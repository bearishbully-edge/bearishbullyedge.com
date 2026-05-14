# main.py
import time
import logging
import os
import signal
from fetcher import fetch_myfxbook, load_manual_events
from normalize import normalize_raw
from storage import upsert_events
from alerts import maybe_send_alert
from datetime import datetime, timezone
import json

LOG = logging.getLogger("econ-engine")
logging.basicConfig(level=os.getenv("LOG_LEVEL","INFO"), format="%(asctime)s [%(levelname)s] %(message)s")

POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "300"))
TZ = os.getenv("TZ", "America/New_York")
RUN_ONCE = os.getenv("RUN_ONCE", "false").lower() in ("1","true","yes")

running = True

def handle_sigterm(signum, frame):
    global running
    LOG.info("Received stop signal, shutting down...")
    running = False

signal.signal(signal.SIGTERM, handle_sigterm)
signal.signal(signal.SIGINT, handle_sigterm)

def save_cache(data, filename="econ_events.json"):
    try:
        with open(filename, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        LOG.debug("Failed to save cache: %s", e)

def fetch_and_normalize():
    # Try MyFXBook first
    raw = fetch_myfxbook()
    
    # If MyFXBook fails, use manual events
    if not raw:
        LOG.info("MyFXBook returned no events, using manual fallback")
        raw = load_manual_events()
    
    events_raw = []
    for r in raw:
        r["source"] = r.get("source", "myfxbook")
        events_raw.append(r)

    normalized = []
    for r in events_raw:
        n = normalize_raw(r)
        if n and n["impact"] in ("high","medium"):
            normalized.append(n)
    return normalized

def main_loop():
    LOG.info("🚀 Econ Engine started (MyFXBook + Manual). Poll: %ss", POLL_INTERVAL)
    while running:
        try:
            normalized = fetch_and_normalize()
            LOG.info("Found %d high/medium events", len(normalized))
            save_cache(normalized)
            upsert_events(normalized)
            for e in normalized:
                try:
                    maybe_send_alert(e)
                except Exception as ex:
                    LOG.warning("Alert failed for %s: %s", e.get("event_name"), ex)
        except Exception as e:
            LOG.exception("Main loop error: %s", e)
        if RUN_ONCE:
            break
        for _ in range(int(POLL_INTERVAL)):
            if not running:
                break
            time.sleep(1)
    LOG.info("✅ Econ Engine stopped.")

if __name__ == "__main__":
    main_loop()
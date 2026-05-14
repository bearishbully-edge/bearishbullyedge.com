# alerts.py
import logging
from storage import alert_exists, mark_alert
from datetime import datetime, timezone
from dateutil import parser
import os
import requests

LOG = logging.getLogger("alerts")

TELEGRAM_BOT = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT = os.getenv("TELEGRAM_CHAT_ID")

def pairs_for_currency(currency: str) -> str:
    mapping = {
        "USD": "EURUSD, GBPUSD, AUDUSD, NZDUSD, USDCAD, USDCHF, USDJPY",
        "EUR": "EURUSD, EURGBP, EURJPY, EURAUD, EURNZD, EURCAD, EURCHF",
        "GBP": "GBPUSD, GBPJPY, GBPAUD, GBPCHF, GBPCAD, GBPNZD",
        "JPY": "USDJPY, EURJPY, GBPJPY, AUDJPY, NZDJPY, CADJPY",
        "AUD": "AUDUSD, AUDJPY, AUDCAD, AUDNZD, GBPAUD, EURAUD",
        "CAD": "USDCAD, CADJPY, AUDCAD, EURCAD, GBPCAD",
        "NZD": "NZDUSD, NZDJPY, NZDCAD, EURNZD, GBPNZD"
    }
    return mapping.get((currency or "").upper(), "Multiple pairs")

def send_telegram(msg: str) -> bool:
    if not TELEGRAM_BOT or not TELEGRAM_CHAT:
        LOG.debug("Telegram not configured")
        return False
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT}/sendMessage"
        payload = {"chat_id": TELEGRAM_CHAT, "text": msg, "parse_mode": "HTML"}
        r = requests.post(url, json=payload, timeout=8)
        r.raise_for_status()
        LOG.info("Telegram message sent")
        return True
    except Exception as e:
        LOG.warning("Telegram send failed: %s", e)
        return False

def maybe_send_alert(event: dict):
    if event.get("impact") != "high":
        return

    event_id = event["event_id"]
    title = event["event_name"]
    event_time = event["date_utc"]

    now = datetime.now(timezone.utc)
    dt = parser.isoparse(event_time)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    minutes = (dt - now).total_seconds() / 60.0

    # T-30
    if 29 <= minutes <= 31:
        if not alert_exists(event_id, "T-30"):
            msg = (f"🚨 <b>HIGH-IMPACT EVENT in ~30 minutes</b>\n\n"
                   f"{title} ({event.get('currency')})\nTime (UTC): {event_time}\nPairs: {pairs_for_currency(event.get('currency'))}")
            if send_telegram(msg):
                mark_alert(event_id, title, "T-30", event_time)
    
    # T-5
    if 4 <= minutes <= 6:
        if not alert_exists(event_id, "T-5"):
            msg = (f"🚨 <b>HIGH-IMPACT EVENT in ~5 minutes</b>\n\n"
                   f"{title} ({event.get('currency')})\nTime (UTC): {event_time}\nPairs: {pairs_for_currency(event.get('currency'))}")
            if send_telegram(msg):
                mark_alert(event_id, title, "T-5", event_time)
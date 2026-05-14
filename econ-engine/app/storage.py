# storage.py
import logging
from supabase_client import sb
from utils.retry import retry

LOG = logging.getLogger("storage")

@retry(tries=3, delay=1, backoff=2, logger=LOG)
def upsert_events(events):
    if not events:
        LOG.debug("No events to upsert")
        return
    for e in events:
        payload = {
            "event_id": e["event_id"],
            "event_name": e["event_name"],
            "currency": e["currency"],
            "impact": e["impact"],
            "date_utc": e["date_utc"],
            "forecast": e.get("forecast"),
            "previous": e.get("previous"),
            "source": e.get("source"),
            "updated_at": e.get("date_utc")
        }
        try:
            res = sb.table("econ_events").upsert(payload, on_conflict="event_id").execute()
            LOG.debug("Upserted event: %s", e["event_id"])
        except Exception as ex:
            LOG.warning("Upsert failed for %s: %s", e.get("event_name"), ex)

def alert_exists(event_id: str, alert_type: str) -> bool:
    try:
        res = sb.table("economic_calendar_alerts").select("id").eq("event_id", event_id).eq("alert_type", alert_type).limit(1).execute()
        data = getattr(res, "data", res)
        return bool(data and len(data) > 0)
    except Exception as e:
        LOG.warning("alert_exists check failed: %s", e)
        return False

def mark_alert(event_id: str, title: str, alert_type: str, event_time: str):
    try:
        payload = {
            "event_id": event_id,
            "title": title,
            "alert_type": alert_type,
            "event_time": event_time
        }
        sb.table("economic_calendar_alerts").insert(payload).execute()
        LOG.info("Recorded alert: %s %s", event_id, alert_type)
    except Exception as e:
        LOG.warning("Failed to record alert: %s", e)
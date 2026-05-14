# normalize.py
from dateutil import parser
from datetime import datetime, timezone
import logging

LOG = logging.getLogger("normalize")

def normalize_raw(raw):
    source = raw.get("source") or "unknown"
    title = raw.get("title") or raw.get("event") or raw.get("name") or ""
    currency = (raw.get("currency") or raw.get("country") or "").upper()
    impact_raw = str(raw.get("impact") or raw.get("importance") or "").strip().lower()
    
    if impact_raw in ("high","h","3","red","high impact"):
        impact = "high"
    elif impact_raw in ("medium","m","2","orange"):
        impact = "medium"
    else:
        impact = "low"

    ts = raw.get("timestamp") or raw.get("time") or raw.get("date")
    dt = None
    if ts:
        try:
            if isinstance(ts, (int, float)):
                dt = datetime.fromtimestamp(int(ts), tz=timezone.utc)
            else:
                dt = parser.parse(str(ts))
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                else:
                    dt = dt.astimezone(timezone.utc)
        except Exception as e:
            LOG.debug("Could not parse timestamp %s: %s", ts, e)
            dt = None

    if not dt:
        return None

    event_id = raw.get("id") or raw.get("event_id") or f"{source}:{abs(hash(title + str(ts)))}"
    return {
        "event_id": str(event_id),
        "event_name": title.strip(),
        "currency": currency,
        "impact": impact,
        "date_utc": dt.isoformat(),
        "forecast": str(raw.get("forecast")) if raw.get("forecast") else None,
        "previous": str(raw.get("previous")) if raw.get("previous") else None,
        "source": source
    }
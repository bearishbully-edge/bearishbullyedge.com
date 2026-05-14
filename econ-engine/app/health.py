# health.py
from flask import Flask, jsonify
import os
from datetime import datetime, timezone
import json
import logging

LOG = logging.getLogger("health")
app = Flask(__name__)

CACHE_FILE = "econ_events.json"

@app.route("/health", methods=["GET"])
def health():
    try:
        cache_age = None
        event_count = 0
        
        if os.path.exists(CACHE_FILE):
            mtime = os.path.getmtime(CACHE_FILE)
            cache_age = (datetime.now(timezone.utc).timestamp() - mtime) / 60.0
            
            with open(CACHE_FILE, 'r') as f:
                data = json.load(f)
                event_count = len(data)
        
        status = "healthy" if cache_age and cache_age < 30 else "degraded"
        
        return jsonify({
            "status": status,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "cache_age_minutes": round(cache_age, 1) if cache_age else None,
            "events_cached": event_count,
            "version": "1.0.0"
        }), 200 if status == "healthy" else 503
        
    except Exception as e:
        LOG.error("Health check failed: %s", e)
        return jsonify({
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }), 500

@app.route("/metrics", methods=["GET"])
def metrics():
    try:
        with open(CACHE_FILE, 'r') as f:
            data = json.load(f)
            high_count = sum(1 for e in data if e.get('impact') == 'high')
            medium_count = sum(1 for e in data if e.get('impact') == 'medium')
            
        return f"""# HELP econ_events_total Total economic events cached
# TYPE econ_events_total gauge
econ_events_total {len(data)}
# HELP econ_events_high High-impact events
# TYPE econ_events_high gauge
econ_events_high {high_count}
# HELP econ_events_medium Medium-impact events
# TYPE econ_events_medium gauge
econ_events_medium {medium_count}
""", 200, {'Content-Type': 'text/plain'}
    except Exception as e:
        return f"# Error: {e}", 500

def run_health_server():
    port = int(os.getenv("HEALTH_PORT", "8080"))
    app.run(host="0.0.0.0", port=port, debug=False)

if __name__ == "__main__":
    run_health_server()
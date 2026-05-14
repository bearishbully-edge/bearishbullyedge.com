# fetcher.py
import json
import logging
from datetime import datetime, timezone
import os

LOG = logging.getLogger("econ-engine.fetcher")

def load_manual_events():
    """Load events from manual_events.json"""
    try:
        with open("manual_events.json", "r", encoding="utf-8") as f:
            events = json.load(f)
        LOG.info("Loaded %d manual events (fallback)", len(events))
        return events
    except FileNotFoundError:
        LOG.warning("manual_events.json not found")
        return []
    except json.JSONDecodeError as e:
        LOG.error("Failed to load manual events: %s", e)
        return []

def fetch_myfxbook():
    """Fetch events from MyFXBook using the API class"""
    try:
        from myfxbook import myfxbook
        
        # Get credentials from environment or use defaults
        email = os.getenv("MYFXBOOK_EMAIL", "your_email@example.com")
        password = os.getenv("MYFXBOOK_PASSWORD", "your_password")
        
        fx = myfxbook(email, password)
        
        # Login
        login_result = fx.login()
        if login_result.get('error'):
            LOG.error("MyFXBook login failed: %s", login_result.get('message'))
            return []
        
        LOG.info("MyFXBook logged in successfully. Session: %s", login_result.get('session'))
        
        # Get outlook data
        outlook = fx.get_community_outlook()
        
        # Logout
        fx.logout()
        
        LOG.info("MyFXBook fetched %d events", len(outlook))
        return outlook
        
    except ImportError:
        LOG.error("myfxbook.py not found")
        return []
    except Exception as e:
        LOG.exception("MyFXBook fetch error: %s", e)
        return []
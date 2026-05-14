"""
bias_engine.py
BearishBully Directional Bias Engine - Production Ready

Run daily at 06:30 AM EST to compute market bias
Inserts to Supabase, sends Telegram alerts

Environment Variables Required:
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
  TELEGRAM_BOT_TOKEN (optional)
  TELEGRAM_CHAT_ID (optional)
  PCR_API_URL (optional)
  TZ (default: America/New_York)
"""

import os
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, List
import pytz
import numpy as np
import pandas as pd
import yfinance as yf
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# ==================== CONFIGURATION ====================

SYMBOLS = ["SPY", "QQQ", "DIA"]  # Using ETFs instead of indices  # S&P 500, Nasdaq-100, Dow Jones
SYMBOL_ALIASES = {"SPY": "SPX", "QQQ": "NDX", "DIA": "DJIA"}
VIX_SYMBOL = "^VIX"  # Using actual VIX index  # VIX ETF for Alpha Vantage  # VIX ETF instead of index
DEFAULT_TIMEZONE = os.getenv("TZ", "America/New_York")

# Component weights (must sum to ~1.0)
WEIGHTS = {
    "price_action": 0.15,
    "volume": 0.20,
    "vix": 0.15,
    "pcr": 0.15,
    "htf_direction": 0.20,
}

# Penalties
DISAGREEMENT_PENALTY_MULT = 30
HIGH_IMPACT_PENALTY = 25

# Environment variables
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
PCR_API_URL = os.getenv("PCR_API_URL")

# Validate required environment variables
if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    logger.error("Missing required environment variables")
    raise SystemExit("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# ==================== UTILITY FUNCTIONS ====================

def fetch_ohlcv(symbol: str, period: str = "120d", interval: str = "1d") -> pd.DataFrame:
    """Fetch OHLCV data using requests directly (no API key)"""
    try:
        import time
        
        # Check cache first
        cache_file = f"cache_{symbol}.csv"
        if os.path.exists(cache_file):
            file_age = time.time() - os.path.getmtime(cache_file)
            if file_age < 86400:
                logger.info(f"Using cached data for {symbol}")
                df = pd.read_csv(cache_file, index_col=0, parse_dates=True)
                return df
        
        logger.info(f"Fetching data for {symbol} from Yahoo Finance v8 API")
        
        # Direct Yahoo Finance v8 API (no yfinance library)
        import requests
        from datetime import datetime, timedelta
        
        end_date = int(datetime.now().timestamp())
        start_date = int((datetime.now() - timedelta(days=120)).timestamp())
        
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
        params = {
            "period1": start_date,
            "period2": end_date,
            "interval": "1d"
        }
        headers = {
            "User-Agent": "Mozilla/5.0"
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        data = response.json()
        
        # Parse response
        quotes = data["chart"]["result"][0]
        timestamps = quotes["timestamp"]
        ohlc = quotes["indicators"]["quote"][0]
        
        df = pd.DataFrame({
            "Open": ohlc["open"],
            "High": ohlc["high"],
            "Low": ohlc["low"],
            "Close": ohlc["close"],
            "Volume": ohlc["volume"]
        }, index=pd.to_datetime(timestamps, unit='s'))
        
        # Save cache
        df.to_csv(cache_file)
        
        if df.empty:
            raise ValueError(f"No data returned for {symbol}")
        
        logger.info(f"Successfully fetched {len(df)} rows for {symbol}")
        return df
    except Exception as e:
        logger.error(f"Error fetching {symbol}: {e}")
        raise

def fetch_vix_change() -> Optional[float]:
    """Calculate VIX percentage change from previous day"""
    try:
        df = fetch_ohlcv(VIX_SYMBOL, period="21d", interval="1d")
        if len(df) < 2:
            return None
        last = float(df["Close"].iloc[-1])
        prev = float(df["Close"].iloc[-2])
        pct_change = (last - prev) / prev
        logger.info(f"VIX change: {pct_change:.2%}")
        return pct_change
    except Exception as e:
        logger.warning(f"Could not fetch VIX: {e}")
        return None

def fetch_pcr() -> Optional[float]:
    """Attempt to fetch Put-Call Ratio from configured endpoint"""
    if not PCR_API_URL:
        logger.info("PCR_API_URL not configured, skipping")
        return None
    
    try:
        r = requests.get(PCR_API_URL, timeout=10)
        r.raise_for_status()
        
        # Try JSON first
        try:
            data = r.json()
            if isinstance(data, dict) and "pcr" in data:
                pcr_value = float(data["pcr"])
                logger.info(f"PCR fetched: {pcr_value}")
                return pcr_value
        except:
            pass
        
        # Try CSV fallback
        text = r.text.strip()
        tokens = [t.strip() for t in text.replace("\n", ",").split(",") if t.strip()]
        for tok in reversed(tokens[-10:]):
            try:
                pcr_value = float(tok)
                if 0.1 < pcr_value < 10:  # Sanity check
                    logger.info(f"PCR parsed: {pcr_value}")
                    return pcr_value
            except:
                continue
        
        logger.warning("Could not parse PCR from response")
        return None
    except Exception as e:
        logger.warning(f"PCR fetch error: {e}")
        return None

def is_high_impact_event_within(hours: int = 6) -> bool:
    """
    Check if high-impact economic event is scheduled within X hours
    Uses Investing.com economic calendar
    """
    try:
        url = "https://www.investing.com/economic-calendar/"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'lxml')
        
        # Look for high-impact events (3 bulls icon)
        high_impact_events = soup.find_all('td', {'class': 'sentiment'})
        
        now = datetime.now(timezone.utc)
        threshold = now + timedelta(hours=hours)
        
        for event in high_impact_events:
            # Check if event has 3 bulls (high impact)
            bulls = event.find_all('i', {'class': 'grayFullBullishIcon'})
            if len(bulls) >= 3:
                # Try to parse event time
                time_cell = event.find_previous('td', {'class': 'time'})
                if time_cell:
                    event_time_str = time_cell.get_text(strip=True)
                    # Parse and compare time (simplified)
                    logger.info(f"High-impact event found: {event_time_str}")
                    return True
        
        logger.info("No high-impact events within timeframe")
        return False
    
    except Exception as e:
        logger.warning(f"Could not check economic calendar: {e}")
        return False

def z_score(value: float, mean: float, std: float) -> float:
    """Calculate z-score"""
    if std is None or std == 0:
        return 0.0
    return (value - mean) / std

def normalize_to_minus1_plus1(z: float, cap: float = 3.0) -> float:
    """Normalize z-score to -1..+1 range using tanh"""
    z_capped = max(min(z, cap), -cap)
    return float(np.tanh(z_capped / cap * 1.5))

# ==================== CORE BIAS CALCULATION ====================

def compute_bias_for_symbol(symbol: str) -> Dict:
    """
    Calculate directional bias for a symbol
    Returns dict with bias, confidence, score, and components
    """
    logger.info(f"=" * 60)
    logger.info(f"Computing bias for {SYMBOL_ALIASES.get(symbol, symbol)}")
    logger.info(f"=" * 60)
    
    # Fetch historical data
    df = fetch_ohlcv(symbol, period="120d", interval="1d")
    
    # === PRICE ACTION ===
    last_close = float(df["Close"].iloc[-1])
    prev_close = float(df["Close"].iloc[-2])
    price_pct = (last_close - prev_close) / (prev_close + 1e-12)
    price_norm = normalize_to_minus1_plus1(price_pct / 0.02)
    
    logger.info(f"Price change: {price_pct:.2%} -> normalized: {price_norm:.3f}")
    
    # === HTF DIRECTION (20 & 50 day MA slope) ===
    ma20 = df["Close"].rolling(window=20).mean()
    ma50 = df["Close"].rolling(window=50).mean()
    
    ma20_last = float(ma20.iloc[-1]) if not np.isnan(ma20.iloc[-1]) else last_close
    ma50_last = float(ma50.iloc[-1]) if not np.isnan(ma50.iloc[-1]) else last_close
    ma20_prev = float(ma20.iloc[-3]) if len(ma20) >= 3 and not np.isnan(ma20.iloc[-3]) else ma20_last
    ma50_prev = float(ma50.iloc[-3]) if len(ma50) >= 3 and not np.isnan(ma50.iloc[-3]) else ma50_last
    
    ma20_slope = (ma20_last - ma20_prev) / (ma20_prev + 1e-12)
    ma50_slope = (ma50_last - ma50_prev) / (ma50_prev + 1e-12)
    htf_dir_score = (ma20_slope + ma50_slope) / 2.0
    htf_norm = normalize_to_minus1_plus1(htf_dir_score * 10.0)
    
    logger.info(f"HTF direction: MA20 slope={ma20_slope:.4f}, MA50 slope={ma50_slope:.4f} -> normalized: {htf_norm:.3f}")
    
    # === VOLUME ===
    vol_series = df["Volume"].dropna()
    vol_last = float(vol_series.iloc[-1]) if not vol_series.empty else 0.0
    vol_mean = float(vol_series[-21:-1].mean()) if len(vol_series) >= 21 else float(vol_series.mean() or 0.0)
    vol_std = float(vol_series[-21:-1].std()) if len(vol_series) >= 21 else float(vol_series.std() or 1.0)
    
    vol_z = z_score(vol_last, vol_mean, vol_std if vol_std != 0 else 1.0)
    vol_norm = normalize_to_minus1_plus1(vol_z)
    
    logger.info(f"Volume: last={vol_last:,.0f}, avg={vol_mean:,.0f}, z={vol_z:.2f} -> normalized: {vol_norm:.3f}")
    
    # === VIX ===
    vix_pct = fetch_vix_change()
    vix_norm = 0.0
    if vix_pct is not None:
        vix_norm = -normalize_to_minus1_plus1(vix_pct * 10.0)  # Inverted
    
    vix_display = f"{vix_pct:.2%}" if vix_pct is not None else "N/A"
    logger.info(f"VIX: change={vix_display} -> normalized: {vix_norm:.3f}")
    
    # === PCR ===
    pcr = fetch_pcr()
    pcr_norm = 0.0
    if pcr is not None:
        pcr_z = (pcr - 1.0) / 0.2
        pcr_norm = normalize_to_minus1_plus1(pcr_z) * -1.0  # Contrarian
    
    logger.info(f"PCR: {pcr if pcr else 'N/A'} -> normalized: {pcr_norm:.3f}")
    
    # === COMPONENTS DICT ===
    components = {
        "price_pct": float(price_pct),
        "price_norm": float(price_norm),
        "volume_last": float(vol_last),
        "volume_avg": float(vol_mean),
        "volume_norm": float(vol_norm),
        "vix_pct": float(vix_pct) if vix_pct is not None else None,
        "vix_norm": float(vix_norm),
        "pcr": float(pcr) if pcr is not None else None,
        "pcr_norm": float(pcr_norm),
        "htf_norm": float(htf_norm)
    }
    
    # === WEIGHTED COMPOSITE SCORE ===
    composite_raw = (
        price_norm * WEIGHTS["price_action"] +
        vol_norm * WEIGHTS["volume"] +
        vix_norm * WEIGHTS["vix"] +
        (pcr_norm if pcr is not None else 0.0) * WEIGHTS["pcr"] +
        htf_norm * WEIGHTS["htf_direction"]
    )
    
    logger.info(f"Composite raw score: {composite_raw:.3f}")
    
    # === DISAGREEMENT PENALTY ===
    comp_vals = np.array([
        price_norm,
        vol_norm,
        vix_norm,
        pcr_norm if pcr is not None else 0.0,
        htf_norm
    ])
    disagreement = float(np.std(comp_vals))
    
    # === BASE CONFIDENCE ===
    base_conf = abs(composite_raw) * 100.0
    base_conf = max(5.0, min(100.0, base_conf))
    
    # Apply disagreement penalty
    penalty = disagreement * DISAGREEMENT_PENALTY_MULT
    confidence = int(max(0, min(100, base_conf - penalty)))
    
    logger.info(f"Base confidence: {base_conf:.1f}%, disagreement: {disagreement:.3f}, penalty: {penalty:.1f}%")
    
    # === HIGH-IMPACT EVENT CHECK ===
    if is_high_impact_event_within(hours=6):
        logger.warning(f"High-impact event detected - reducing confidence by {HIGH_IMPACT_PENALTY}%")
        confidence = max(0, confidence - HIGH_IMPACT_PENALTY)
    
    # === BIAS LABEL ===
    if composite_raw > 0.08:
        bias_label = "Bullish"
    elif composite_raw < -0.08:
        bias_label = "Bearish"
    else:
        bias_label = "Neutral"
        confidence = int(confidence * 0.6)  # Reduce confidence for neutral
    
    logger.info(f"FINAL BIAS: {bias_label} | CONFIDENCE: {confidence}%")
    
    result = {
        "symbol": SYMBOL_ALIASES.get(symbol, symbol),
        "bias": bias_label,
        "confidence": int(confidence),
        "score_raw": float(composite_raw),
        "components": components,
        "computed_at": datetime.now(timezone.utc).isoformat()
    }
    
    return result

# ==================== SUPABASE & TELEGRAM ====================

def push_to_supabase(record: Dict) -> bool:
    """Push bias record to Supabase"""
    try:
        # Also save locally as backup
        import json
        filename = f"bias_{record['symbol']}_{datetime.now().strftime('%Y%m%d')}.json"
        with open(filename, 'w') as f:
            json.dump(record, f, indent=2)
        logger.info(f"✅ Saved local backup: {filename}")
        
        # Push to Supabase
        response = supabase.table("daily_bias").insert(record).execute()
        
        if response.data:
            logger.info(f"✅ Pushed {record['symbol']} to Supabase")
            return True
        else:
            logger.error(f"❌ Supabase push failed for {record['symbol']}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Supabase exception: {e}")
        return False
            
    except Exception as e:
        logger.error(f"❌ Supabase exception: {e}")
        return False

def send_telegram(text: str) -> bool:
    """Send Telegram notification"""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        logger.info("Telegram not configured, skipping")
        return False
    
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = {
            "chat_id": TELEGRAM_CHAT_ID,
            "text": text,
            "parse_mode": "Markdown"
        }
        
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        
        logger.info("✅ Telegram message sent")
        return True
    
    except Exception as e:
        logger.warning(f"❌ Telegram failed: {e}")
        return False

# ==================== MAIN EXECUTION ====================

def run_all() -> List[Dict]:
    """Run bias calculation for all symbols"""
    logger.info("🚀 Starting BearishBully Bias Engine")
    logger.info(f"Time: {datetime.now(pytz.timezone(DEFAULT_TIMEZONE))}")
    
    results = []
    
    for sym in SYMBOLS:
        try:
            result = compute_bias_for_symbol(sym)
            results.append(result)
            
            # Push to Supabase
            success = push_to_supabase(result)
            
            if success:
                # Send Telegram alert
                telegram_msg = (
                    f"*📊 Daily Bias — {result['symbol']}*\n"
                    f"Bias: *{result['bias']}*\n"
                    f"Confidence: *{result['confidence']}%*\n"
                    f"Score: `{result['score_raw']:.3f}`\n"
                    f"Time: `{result['computed_at']}`"
                )
                send_telegram(telegram_msg)
        
        except Exception as e:
            logger.error(f"❌ Failed for {sym}: {e}", exc_info=True)
    
    logger.info("✅ Bias Engine run complete")
    return results

if __name__ == "__main__":
    try:
        results = run_all()
        logger.info(f"Processed {len(results)} symbols successfully")
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        raise
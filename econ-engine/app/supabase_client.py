# supabase_client.py
import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

# Load .env from the current directory (app/)
load_dotenv(Path(__file__).parent / '.env')

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise SystemExit("Missing SUPABASE URL or SERVICE ROLE KEY in env")

sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
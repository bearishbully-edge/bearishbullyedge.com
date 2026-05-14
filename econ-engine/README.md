# econ-engine

Economic Calendar Sync + Telegram Alerts (Supabase-backed)

## Setup

1. Create Supabase tables: run `sql/setup.sql` in Supabase SQL editor
2. Copy `.env` into `econ-engine/.env`:
```
   NEXT_PUBLIC_SUPABASE_URL=https://<your>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   TELEGRAM_BOT_TOKEN=<optional>
   TELEGRAM_CHAT_ID=<optional>
   POLL_INTERVAL=300
   TZ=America/New_York
```
3. Build & run:
```bash
   docker compose up --build -d
```
4. Check health: `curl http://localhost:8080/health`

## Local Testing
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r app/requirements.txt
cd app
python main.py
```

## Production Deploy
See `systemd/econ-engine.service` for DigitalOcean droplet deployment.
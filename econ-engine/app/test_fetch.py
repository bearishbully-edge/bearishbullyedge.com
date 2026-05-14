from fetcher import fetch_investing_com
import json

events = fetch_investing_com()
print(f"\n=== GOT {len(events)} RAW EVENTS ===\n")

for i, e in enumerate(events[:5]):  # Show first 5
    print(f"Event {i+1}:")
    print(f"  Title: {e.get('title')}")
    print(f"  Currency: {e.get('currency')}")
    print(f"  Impact: {e.get('impact')}")
    print(f"  Timestamp: {e.get('timestamp')}")
    print(f"  Source: {e.get('source')}")
    print()
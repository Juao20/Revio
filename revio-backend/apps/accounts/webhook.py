import hashlib
import hmac
import json
import os

WEBHOOK_SECRET = os.getenv('LEMONSQUEEZY_WEBHOOK_SECRET')

def verify_webhook(payload: bytes, signature: str) -> bool:
    """Vérifie la signature du webhook LemonSqueezy"""
    expected = hmac.new(
        WEBHOOK_SECRET.encode('utf-8'),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
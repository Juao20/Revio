import requests
import os

API_KEY = os.getenv('LEMONSQUEEZY_API_KEY')
STORE_ID = os.getenv('LEMONSQUEEZY_STORE_ID')
MONTHLY_VARIANT_ID = os.getenv('LEMONSQUEEZY_MONTHLY_VARIANT_ID')
YEARLY_VARIANT_ID = os.getenv('LEMONSQUEEZY_YEARLY_VARIANT_ID')

HEADERS = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/vnd.api+json',
    'Accept': 'application/vnd.api+json',
}

def create_checkout(variant_id: str, email: str, user_id: int, redirect_url: str) -> str:
    """Crée un checkout LemonSqueezy et retourne l'URL"""
    payload = {
        "data": {
            "type": "checkouts",
            "attributes": {
                "checkout_data": {
                    "email": email,
                    "custom": {
                        "user_id": str(user_id),
                    }
                },
                "product_options": {
                    "redirect_url": redirect_url,
                },
            },
            "relationships": {
                "store": {
                    "data": {
                        "type": "stores",
                        "id": str(STORE_ID),
                    }
                },
                "variant": {
                    "data": {
                        "type": "variants",
                        "id": str(variant_id),
                    }
                }
            }
        }
    }

    response = requests.post(
        'https://api.lemonsqueezy.com/v1/checkouts',
        json=payload,
        headers=HEADERS,
    )

    data = response.json()
    return data['data']['attributes']['url']
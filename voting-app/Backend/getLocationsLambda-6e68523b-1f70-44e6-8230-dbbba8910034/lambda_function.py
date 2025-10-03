import json
import boto3
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.client("dynamodb")
TABLE_NAME = "Locations"

ALLOWED_ORIGINS = [
    "https://d36kgz7l51jjet.cloudfront.net",
    "http://localhost:3000",
    "https://x406dhlkn8.execute-api.ap-south-1.amazonaws.com"
]

def lambda_handler(event, context):
    logger.info(f"Incoming event: {json.dumps(event)}")

    origin = event.get("headers", {}).get("origin") or event.get("headers", {}).get("Origin")
    allow_origin = origin if origin in ALLOWED_ORIGINS else "*"
    logger.info(f"Resolved CORS origin: {allow_origin}")

    cors_headers = {
        "Access-Control-Allow-Origin": allow_origin,
        "Access-Control-Allow-Headers": "Content-Type, Origin, X-Requested-With, Accept",
        "Access-Control-Allow-Methods": "OPTIONS,GET",
        "Vary": "Origin"
    }

    method = event.get("httpMethod") or event.get("requestContext", {}).get("http", {}).get("method")
    
    if method == "OPTIONS":
        logger.info("Handling CORS preflight request")
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": ""
        }

    params = event.get("queryStringParameters", {}) or {}
    location_type = params.get("type", "").strip().lower()
    value = params.get("value", "").strip().lower()

    logger.info(f"Query type: {location_type}, value: {value}")

    if location_type != "root" and not value:
        logger.warning("Missing value for non-root location type")
        return {
            "statusCode": 400,
            "headers": cors_headers,
            "body": json.dumps({"error": "Missing value for location type"})
        }

    try:
        response = dynamodb.scan(TableName=TABLE_NAME)
        items = response.get("Items", [])
        logger.info(f"Scanned {len(items)} items")

        filtered = []

        for item in items:
            country = item.get("country", {}).get("S", "").strip().lower()
            state = item.get("state", {}).get("S", "").strip().lower()
            city = item.get("city", {}).get("S", "").strip().lower()
            center = item.get("center", {}).get("S", "").strip()

            if location_type == "country" and country == value:
                state_val = item.get("state", {}).get("S")
                if state_val:
                    filtered.append(state_val)

            elif location_type == "state" and state == value:
                city_val = item.get("city", {}).get("S")
                if city_val:
                    filtered.append(city_val)

            elif location_type == "city" and city == value:
                center_val = item.get("center", {}).get("S")
                if center_val:
                    filtered.append(center_val)

            elif location_type == "root":
                country_val = item.get("country", {}).get("S")
                if country_val:
                    filtered.append(country_val)

        unique_values = sorted(list(set(filtered)))
        logger.info(f"Returning {len(unique_values)} items: {unique_values}")

        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps(unique_values)
        }

    except Exception as e:
        logger.error(f"❌ Error scanning DynamoDB: {str(e)}", exc_info=True)
        return {
            "statusCode": 500,
            "headers": cors_headers,
            "body": json.dumps({"error": str(e)})
        }
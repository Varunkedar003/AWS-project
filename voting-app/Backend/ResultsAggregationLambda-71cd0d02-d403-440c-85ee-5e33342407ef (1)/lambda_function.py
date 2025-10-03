import json
import boto3
import logging
from collections import defaultdict

# Setup logger
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# DynamoDB client
dynamodb = boto3.client('dynamodb')
TABLE_NAME = "Votes"

def lambda_handler(event, context):
    logger.info(f"Incoming event: {json.dumps(event)}")

    allowed_origins = [
        "https://d36kgz7l51jjet.cloudfront.net",
        "http://localhost:3000"
    ]

    origin = (
        event.get("headers", {}).get("origin")
        or event.get("headers", {}).get("Origin")
        or ""
    )
    allow_origin = origin if origin in allowed_origins else "*"

    cors_headers = {
        "Access-Control-Allow-Origin": allow_origin,
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,GET",
        "Vary": "Origin"
    }

    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": ""
        }

    try:
        response = dynamodb.scan(TableName=TABLE_NAME)
        items = response.get("Items", [])

        # Aggregate votes per candidate
        results = defaultdict(int)
        total_votes = 0

        for item in items:
            candidate = item.get("candidate", {}).get("S")
            if candidate:
                results[candidate] += 1
                total_votes += 1

        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({
                "results": dict(results),
                "votedCount": total_votes
            })
        }

    except Exception as e:
        logger.error(f"Error fetching total results: {str(e)}", exc_info=True)
        return {
            "statusCode": 500,
            "headers": cors_headers,
            "body": json.dumps({"error": "Internal server error"})
        }
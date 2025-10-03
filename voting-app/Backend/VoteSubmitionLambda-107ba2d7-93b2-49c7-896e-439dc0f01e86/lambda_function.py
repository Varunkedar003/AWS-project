import json
import boto3
import logging
import uuid
from datetime import datetime

# Setup logger
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# DynamoDB client
dynamodb = boto3.client("dynamodb")
TABLE_NAME = "Votes"

# Whitelist allowed origins
ALLOWED_ORIGINS = [
    "https://d36kgz7l51jjet.cloudfront.net",
    "http://localhost:3000",
    "https://x406dhlkn8.execute-api.ap-south-1.amazonaws.com"
]

def lambda_handler(event, context):
    logger.info("Full incoming event: %s", json.dumps(event))

    method = event.get("httpMethod") or event.get("requestContext", {}).get("http", {}).get("method")
    origin = event.get("headers", {}).get("origin") or event.get("headers", {}).get("Origin")
    allow_origin = origin if origin in ALLOWED_ORIGINS else "*"

    cors_headers = {
        "Access-Control-Allow-Origin": allow_origin,
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
        "Vary": "Origin"
    }

    if method == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    if method != "POST":
        return {
            "statusCode": 405,
            "headers": cors_headers,
            "body": json.dumps({"error": "Method not allowed"})
        }

    try:
        body_str = event.get("body", "")
        if not body_str:
            return {
                "statusCode": 400,
                "headers": cors_headers,
                "body": json.dumps({"error": "Empty request body"})
            }

        body = json.loads(body_str)
        user_id = str(body.get("userId", "")).strip()
        candidate = str(body.get("candidate", "")).strip()
        country = str(body.get("country", "")).strip()
        state = str(body.get("state", "")).strip()
        city = str(body.get("city", "")).strip()
        center = str(body.get("center", "")).strip()

        if not all([user_id, candidate, country, state, city, center]):
            return {
                "statusCode": 400,
                "headers": cors_headers,
                "body": json.dumps({"error": "Missing required fields"})
            }

        # 🔍 Check if user has already voted
        existing = dynamodb.query(
            TableName=TABLE_NAME,
            IndexName="userId-index",  # You must create this GSI in DynamoDB
            KeyConditionExpression="userId = :uid",
            ExpressionAttributeValues={":uid": {"S": user_id}}
        )

        if existing.get("Count", 0) > 0:
            return {
                "statusCode": 400,
                "headers": cors_headers,
                "body": json.dumps({"error": "You have already cast your vote"})
            }

        # ✅ Proceed to store vote
        vote_id = str(uuid.uuid4())

        item = {
            "voteId": {"S": vote_id},
            "userId": {"S": user_id},
            "candidate": {"S": candidate},
            "country": {"S": country},
            "state": {"S": state},
            "city": {"S": city},
            "center": {"S": center},
            "timestamp": {"S": datetime.utcnow().isoformat()}
        }

        dynamodb.put_item(TableName=TABLE_NAME, Item=item)
        logger.info("Vote submitted successfully for user: %s", user_id)

        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({"message": "Vote submitted successfully"})
        }

    except Exception as e:
        logger.error("Error submitting vote: %s", str(e), exc_info=True)
        return {
            "statusCode": 500,
            "headers": cors_headers,
            "body": json.dumps({"error": "Internal server error"})
        }
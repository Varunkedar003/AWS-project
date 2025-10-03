import json
import boto3

# AWS clients
s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("Locations")

# Configuration
BUCKET_NAME = "voting-frontend-bucket"
FILE_KEY = "locations.json"

def lambda_handler(event, context):
    try:
        # Load JSON from S3
        obj = s3.get_object(Bucket=BUCKET_NAME, Key=FILE_KEY)
        data = json.loads(obj["Body"].read())

        seen_keys = set()
        centers = ["Center A", "Center B", "Center C"]  # ✅ Multiple centers

        # Batch write to DynamoDB
        with table.batch_writer() as batch:
            for state, cities in data.items():
                for city in cities:
                    for center_name in centers:
                        pk = f"{state}#{city}"
                        sk = center_name
                        key = f"{pk}#{sk}"

                        if key in seen_keys:
                            continue  # Skip duplicate

                        seen_keys.add(key)

                        batch.put_item(
                            Item={
                                "PK": pk,
                                "SK": sk,
                                "country": "India",
                                "state": state,
                                "city": city,
                                "center": center_name
                            }
                        )

        return {
            "statusCode": 200,
            "body": "✅ Locations seeded successfully using batch write"
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": f"❌ Error: {str(e)}"
        }
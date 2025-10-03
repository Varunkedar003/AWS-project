import boto3

dynamodb = boto3.client('dynamodb', region_name='ap-south-1')
table_name = 'Locations'

locations = [
    {"PK": "ROOT", "SK": "COUNTRY#IN", "Name": "India"},
    {"PK": "COUNTRY#IN", "SK": "STATE#KA", "Name": "Karnataka"},
    {"PK": "COUNTRY#IN", "SK": "STATE#TN", "Name": "Tamil Nadu"},
    {"PK": "COUNTRY#IN", "SK": "STATE#MH", "Name": "Maharashtra"},
    {"PK": "STATE#KA", "SK": "CITY#BLR", "Name": "Bengaluru"},
    {"PK": "STATE#KA", "SK": "CITY#MYS", "Name": "Mysuru"},
    {"PK": "STATE#TN", "SK": "CITY#CHN", "Name": "Chennai"},
    {"PK": "STATE#TN", "SK": "CITY#CBE", "Name": "Coimbatore"},
    {"PK": "STATE#MH", "SK": "CITY#MUM", "Name": "Mumbai"},
    {"PK": "STATE#MH", "SK": "CITY#PUN", "Name": "Pune"}
]

for loc in locations:
    item = {k: {'S': v} for k, v in loc.items()}
    dynamodb.put_item(TableName=table_name, Item=item)
    print(f"Inserted: {loc['Name']}")
import os
import uuid
import boto3
from botocore.config import Config
from typing import Optional

R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME", "fitness-chatbot-uploads")
R2_PUBLIC_URL = os.getenv("R2_PUBLIC_URL")

client = None

def get_r2_client():
    global client
    if client is None and R2_ACCOUNT_ID and R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY:
        endpoint = f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
        client = boto3.client(
            "s3",
            endpoint_url=endpoint,
            aws_access_key_id=R2_ACCESS_KEY_ID,
            aws_secret_access_key=R2_SECRET_ACCESS_KEY,
            config=Config(signature_version="s3v4"),
        )
    return client

async def upload_to_r2(file_bytes: bytes, filename: str, content_type: Optional[str] = None) -> Optional[str]:
    r2 = get_r2_client()
    if not r2:
        return None

    ext = os.path.splitext(filename)[1]
    key = f"uploads/{uuid.uuid4()}{ext}"

    extra_args = {}
    if content_type:
        extra_args["ContentType"] = content_type

    try:
        r2.put_object(
            Bucket=R2_BUCKET_NAME,
            Key=key,
            Body=file_bytes,
            **extra_args,
        )
        return f"{R2_PUBLIC_URL}/{key}"
    except Exception as e:
        print(f"R2 upload failed: {e}")
        return None

async def delete_from_r2(key: str) -> bool:
    r2 = get_r2_client()
    if not r2:
        return False
    try:
        r2.delete_object(Bucket=R2_BUCKET_NAME, Key=key)
        return True
    except Exception as e:
        print(f"R2 delete failed: {e}")
        return False

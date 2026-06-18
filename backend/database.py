from pymongo import MongoClient, ASCENDING
from config import MONGO_URI, MONGO_DB_NAME

client = MongoClient(
    MONGO_URI,
    # Connection pool: keep up to 10 connections alive, so subsequent requests
    # reuse an existing socket instead of doing a fresh TCP+TLS handshake each time
    maxPoolSize=10,
    minPoolSize=2,
    # Faster failure on bad connections
    connectTimeoutMS=5000,
    socketTimeoutMS=10000,
    serverSelectionTimeoutMS=5000,
)
db = client[MONGO_DB_NAME]

def get_db():
    return db

def ensure_indexes():
    """Create indexes once at startup to speed up all queries."""
    col = db["ieee_participants"]
    col.create_index([("email",  1)], sparse=True)
    col.create_index([("sap_id", 1)], sparse=True)
    col.create_index([("name",   1)])

    otp_col = db["otp_store"]
    otp_col.create_index([("email", 1)], unique=True)
    # TTL index: MongoDB auto-deletes expired OTP docs
    otp_col.create_index([("expires_at", 1)], expireAfterSeconds=0)

# Run at import time — harmless if indexes already exist
ensure_indexes()

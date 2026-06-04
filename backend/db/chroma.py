import os
import chromadb
from chromadb.config import Settings

CHROMA_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_data")

# Initialize ChromaDB client with persistent storage
chroma_client = chromadb.PersistentClient(path=CHROMA_DATA_DIR)

def get_chroma_collection(collection_name="exercises_collection"):
    return chroma_client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"}
    )

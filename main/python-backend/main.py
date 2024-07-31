import redis
import numpy as np
from redis.commands.search.query import Query
from fastapi import FastAPI
from sentence_transformers import SentenceTransformer

app = FastAPI()
model = SentenceTransformer("allenai-specter")
client = redis.Redis(host="localhost", port=6379, decode_responses=True)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/papers/")
def read_item(search_query: str):
    embedding = model.encode([search_query])
    query = (
        Query("(*)=>[KNN 10 @vector $query_vector AS vector_score]")
        .sort_by("vector_score")
        .return_fields("vector_score", "arxivId", "title", "id")
        .dialect(2)
    )
    res = (
        client.ft("idx:papers_vss")
        .search(
            query, {"query_vector": np.array(embedding[0], dtype=np.float32).tobytes()}
        )
        .docs
    )
    return {"results": res}


@app.get("/similar/")
def read_item(paperId: str):
    embedding = client.json().get(f"papers:{paperId}", "$.embedding")
    query = (
        Query("(*)=>[KNN 6 @vector $query_vector AS vector_score]")
        .sort_by("vector_score")
        .return_fields("vector_score", "arxivId", "title", "id")
        .dialect(2)
    )
    res = (
        client.ft("idx:papers_vss")
        .search(
            query, {"query_vector": np.array(embedding, dtype=np.float32).tobytes()}
        )
        .docs
    )
    return {"results": res[1:]}

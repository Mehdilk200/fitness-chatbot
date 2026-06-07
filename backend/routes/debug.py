"""
Debug endpoints to help diagnose connectivity issues between
Frontend (Vite) ←→ Backend (FastAPI) ←→ MongoDB

Endpoints:
  GET /api/debug/ping   → Basic server reachability check
  GET /api/debug/db     → Full MongoDB connection + CRUD test
"""

from fastapi import APIRouter
from datetime import datetime, timezone
from db.mongodb import get_db

router = APIRouter(prefix="/api/debug", tags=["debug"])


@router.get("/ping")
async def debug_ping():
    """
    Lightweight check: is the FastAPI server alive?
    If this returns, your backend is reachable.
    """
    return {
        "status": "ok",
        "message": "FastAPI server is alive",
        "server_time": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/db")
async def debug_database():
    """
    Full MongoDB diagnostics:
      1. Ping the MongoDB server
      2. List all collections and document counts
      3. Write a temporary test document
      4. Read it back
      5. Delete it (cleanup)

    If step 1 or 3 fails → MongoDB connection problem.
    If everything passes, your DB is working.
    """
    results = {"steps": [], "error": None}

    try:
        db = get_db()
    except Exception as e:
        results["error"] = f"Failed to get DB handle: {e}"
        return results

    # ── Step 1: Ping ──────────────────────────────────
    try:
        ping_result = await db.command("ping")
        results["steps"].append({
            "step": "ping",
            "status": "PASS" if ping_result.get("ok") == 1.0 else "FAIL",
            "detail": f"MongoDB ping response: {ping_result}",
        })
    except Exception as e:
        results["steps"].append({
            "step": "ping",
            "status": "FAIL",
            "detail": f"MongoDB ping failed: {e}",
        })
        results["error"] = "MongoDB is not reachable"
        return results

    # ── Step 2: List collections ──────────────────────
    try:
        collections = await db.list_collection_names()
        details = []
        for name in sorted(collections):
            count = await db[name].count_documents({})
            details.append(f"  · {name}: {count} doc(s)")
        results["steps"].append({
            "step": "collections",
            "status": "PASS",
            "detail": f"Found {len(collections)} collection(s):\n" + "\n".join(details) if details else "  (empty database)",
        })
    except Exception as e:
        results["steps"].append({
            "step": "collections",
            "status": "FAIL",
            "detail": f"Failed to list collections: {e}",
        })

    # ── Step 3: Write → Read → Delete (CRUD) ─────────
    try:
        test_doc = {
            "test_key": "debug_write_test",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        insert_result = await db.debug_tests.insert_one(test_doc)
        doc_id = str(insert_result.inserted_id)
        results["steps"].append({"step": "write", "status": "PASS", "detail": f"Inserted _id={doc_id}"})

        read_back = await db.debug_tests.find_one({"_id": insert_result.inserted_id})
        if read_back:
            results["steps"].append({"step": "read", "status": "PASS", "detail": f"Read back: {read_back.get('test_key')}"})
        else:
            results["steps"].append({"step": "read", "status": "FAIL", "detail": "Written but cannot be read back"})

        await db.debug_tests.delete_one({"_id": insert_result.inserted_id})
        results["steps"].append({"step": "cleanup", "status": "PASS", "detail": "Test doc deleted"})

    except Exception as e:
        results["steps"].append({"step": "write/read", "status": "FAIL", "detail": f"CRUD failed: {e}"})
        results["error"] = "MongoDB CRUD operation failed"

    # ── Summary ───────────────────────────────────────
    all_ok = all(s["status"] == "PASS" for s in results["steps"])
    results["summary"] = "ALL CHECKS PASSED" if all_ok else "SOME CHECKS FAILED"
    return results

import os
import asyncio
import httpx
from google import genai
from google.genai import types
from typing import Optional

API_KEY = os.getenv("GEMINI_API_KEY")
_model_name = os.getenv("LLM_MODEL") or os.getenv("LLM_PROVIDER") or "gemini-2.0-flash"

client = None
if API_KEY:
    client = genai.Client(api_key=API_KEY).aio
else:
    print("WARNING: GEMINI_API_KEY is not set.")

_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_UPLOADS_DIR = os.path.join(_BACKEND_DIR, "uploads")

_MIME_MAP = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
}


def _infer_mime_type(url: str) -> str:
    ext = os.path.splitext(url.split('?')[0])[1].lower()
    return _MIME_MAP.get(ext, 'image/jpeg')


async def _resolve_image_part(url: str) -> types.Part:
    """Resolve an image URL to a Part.

    Gemini's from_uri() only supports gs:// URIs and File API URIs, NOT
    arbitrary HTTP URLs.  For HTTP(S) URLs we download the bytes and
    send them as inline_data so the model actually receives the image.
    """
    mime = _infer_mime_type(url)

    # 1. HTTP/HTTPS — download and convert to inline bytes
    if url.startswith(('http://', 'https://')):
        print(f"[Image] Downloading remote image: {url}")
        try:
            async with httpx.AsyncClient() as hc:
                resp = await hc.get(url, timeout=30)
                resp.raise_for_status()
            data = resp.content
            print(f"[Image] Downloaded {len(data)} bytes, mime={mime}")
            return types.Part(inline_data=types.Blob(mime_type=mime, data=data))
        except Exception as e:
            print(f"[Image] ERROR downloading {url}: {e}")
            raise

    # 2. Local filesystem path (/uploads/…)
    local_path = url
    if url.startswith('/uploads/'):
        filename = url.lstrip('/uploads/')
        local_path = os.path.join(_UPLOADS_DIR, filename)
    elif not os.path.isabs(url):
        local_path = os.path.join(_UPLOADS_DIR, url.lstrip('/'))

    print(f"[Image] Local path resolved: {local_path}")
    if os.path.exists(local_path):
        with open(local_path, 'rb') as f:
            data = f.read()
        print(f"[Image] Read {len(data)} bytes, mime={mime}")
        return types.Part(inline_data=types.Blob(mime_type=mime, data=data))

    # 3. Fallback — unknown scheme (gs:// etc.), let Gemini try from_uri
    print(f"[Image] Using from_uri for: {url}")
    return types.Part.from_uri(mime_type=mime, uri=url)


async def generate_response(prompt: str, system_instruction: str = None) -> str:
    """Legacy text-only generation. Kept for backward compatibility."""
    if not client:
        return "Je suis désolé, le service IA n'est pas configuré. Veuillez définir GEMINI_API_KEY."
    try:
        config = None
        if system_instruction:
            config = types.GenerateContentConfig(system_instruction=system_instruction)
        response = await client.models.generate_content(
            model=_model_name,
            contents=prompt,
            config=config,
        )
        return response.text
    except Exception as e:
        print(f"[LLM Error] model={_model_name} key_set={bool(API_KEY)} error={e}")
        import traceback
        traceback.print_exc()
        return "Une erreur interne s'est produite lors de la génération de la réponse."


async def _build_parts(text: str = "", image_urls: Optional[list] = None) -> list:
    """Build a list of Part objects from text and image URLs."""
    parts = []
    if text:
        parts.append(types.Part.from_text(text))
    for url in (image_urls or []):
        part = await _resolve_image_part(url)
        parts.append(part)
    return parts


async def generate_multimodal_response(
    history: list,
    system_instruction: str,
    current_text: str = "",
    current_image_urls: Optional[list] = None,
) -> str:
    """
    Generate a response using proper multimodal message history.

    history: list of message dicts with keys: role, content, image_urls (optional)
    system_instruction: system prompt string
    current_text: the user's new text message
    current_image_urls: list of image URLs for the current message
    """
    if not client:
        return "Je suis désolé, le service IA n'est pas configuré. Veuillez définir GEMINI_API_KEY."

    try:
        contents = []

        for msg in history:
            role = "user" if msg["role"] == "user" else "model"
            img_urls = msg.get("image_urls") or (
                [msg["image_url"]] if msg.get("image_url") else None
            )
            parts = await _build_parts(text=msg.get("content", ""), image_urls=img_urls)
            if parts:
                contents.append(types.Content(role=role, parts=parts))

        # Append the current user message
        current_parts = await _build_parts(text=current_text, image_urls=current_image_urls)
        if current_parts:
            contents.append(types.Content(role="user", parts=current_parts))
        elif current_text:
            contents.append(types.Content(
                role="user",
                parts=[types.Part.from_text(current_text)],
            ))

        config = types.GenerateContentConfig(system_instruction=system_instruction)

        # ── Debug: verify every content part before sending to Gemini ──
        for i, content in enumerate(contents):
            print(f"[Gemini] Content #{i}: role={content.role}")
            for j, part in enumerate(content.parts):
                if hasattr(part, "inline_data") and part.inline_data:
                    blob = part.inline_data
                    print(f"  Part #{j}: IMAGE ATTACHED — {blob.mime_type} {len(blob.data)} bytes")
                elif hasattr(part, "text") and part.text:
                    print(f"  Part #{j}: text={part.text[:80]}…")
                elif hasattr(part, "file_data") and part.file_data:
                    print(f"  Part #{j}: file_data uri={part.file_data.file_uri}")
                else:
                    print(f"  Part #{j}: unknown shape — {type(part).__name__}")

        # ── Call Gemini with retry on 503 ──
        last_error = None
        for attempt in range(3):
            try:
                response = await client.models.generate_content(
                    model=_model_name,
                    contents=contents,
                    config=config,
                )
                print(f"[Gemini] Response received: {len(response.text)} chars")
                return response.text
            except Exception as e:
                error_str = str(e)
                last_error = e
                print(f"[Gemini] Attempt {attempt + 1}/3 failed: {error_str[:200]}")
                if "503" in error_str or "UNAVAILABLE" in error_str:
                    wait = 2 ** attempt
                    print(f"[Gemini] 503 — retrying in {wait}s…")
                    await asyncio.sleep(wait)
                    continue
                raise

        print(f"[Gemini] All 3 attempts exhausted, last error: {last_error}")
        raise last_error
    except Exception as e:
        error_detail = str(e)
        print(f"[LLM MultiModal Error] model={_model_name} key_set={bool(API_KEY)} history_len={len(history)} images={current_image_urls}")
        print(f"[LLM MultiModal Error] detail={error_detail}")
        import traceback
        traceback.print_exc()
        return "Une erreur interne s'est produite lors de la génération de la réponse."


async def format_history(history_dicts: list) -> str:
    """Format history for context inclusion (legacy text-only)."""
    formatted = []
    for msg in history_dicts:
        role = "User" if msg["role"] == "user" else "Assistant"
        text = msg.get("content", "")
        img_urls = msg.get("image_urls") or (
            [msg["image_url"]] if msg.get("image_url") else None
        )
        if img_urls:
            text += f" [shared {len(img_urls)} image(s)]"
        formatted.append(f"{role}: {text}")
    return "\n".join(formatted)

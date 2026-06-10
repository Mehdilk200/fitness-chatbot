import os
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


def _build_parts(text: str = "", image_urls: Optional[list] = None) -> list:
    """Build a list of Part objects from text and image URLs."""
    parts = []
    if text:
        parts.append(types.Part.from_text(text))
    for url in (image_urls or []):
        parts.append(types.Part.from_uri(
            mime_type=_infer_mime_type(url),
            uri=url,
        ))
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
            parts = _build_parts(text=msg.get("content", ""), image_urls=img_urls)
            if parts:
                contents.append(types.Content(role=role, parts=parts))

        # Append the current user message
        current_parts = _build_parts(text=current_text, image_urls=current_image_urls)
        if current_parts:
            contents.append(types.Content(role="user", parts=current_parts))
        elif current_text:
            contents.append(types.Content(
                role="user",
                parts=[types.Part.from_text(current_text)],
            ))

        config = types.GenerateContentConfig(system_instruction=system_instruction)

        response = await client.models.generate_content(
            model=_model_name,
            contents=contents,
            config=config,
        )
        return response.text
    except Exception as e:
        print(f"[LLM MultiModal Error] model={_model_name} key_set={bool(API_KEY)} history_len={len(history)} images={current_image_urls} error={e}")
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

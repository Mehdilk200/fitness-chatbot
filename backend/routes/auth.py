
import os
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from models.schemas import RegisterRequest, LoginRequest, TokenResponse
from routes.crud import create_user, get_user_by_email, get_user_by_id, get_profile

router = APIRouter(prefix="/api/auth", tags=["auth"])

JWT_SECRET  = os.getenv("JWT_SECRET",  "change_me_please_32_chars_minimum")
JWT_ALGO    = os.getenv("JWT_ALGORITHM","HS256")
JWT_EXPIRE  = int(os.getenv("JWT_EXPIRE_MINUTES", 10080))   

pwd_ctx  = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()



def hash_password(plain: str) -> str:
    return pwd_ctx.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)


def create_token(user_id: str) -> str:
    expire  = datetime.utcnow() + timedelta(minutes=JWT_EXPIRE)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token invalide")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalide ou expiré")

    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur introuvable")
    return user



@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(request: RegisterRequest):
    
    existing = await get_user_by_email(request.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email déjà utilisé")

    
    user = await create_user(
        email         = request.email,
        password_hash = hash_password(request.password),
        first_name    = request.first_name,
        last_name     = request.last_name,
    )

    token = create_token(str(user["_id"]))
    return TokenResponse(
        access_token=token, 
        user_id=str(user["_id"]),
        is_profile_complete=False
    )


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    user = await get_user_by_email(request.email)
    if not user or not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    user_id = str(user["_id"])
    token = create_token(user_id)
    profile = await get_profile(user_id)
    
    return TokenResponse(
        access_token=token, 
        user_id=user_id,
        is_profile_complete=True if profile else False
    )


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "user_id":   str(current_user.get("_id", "")),
        "email":     current_user.get("email", ""),
        "first_name": current_user.get("first_name", ""),
        "last_name":  current_user.get("last_name", ""),
    }


@router.get("/oauth/{provider}")
async def oauth_login(provider: str):
    providers = {"google", "apple"}
    if provider not in providers:
        raise HTTPException(status_code=400, detail="Unsupported OAuth provider")

    raise HTTPException(
        status_code=501,
        detail=f"{provider.title()} OAuth not yet configured. Set up your {provider} credentials in the backend .env file."
    )
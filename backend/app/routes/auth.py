import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError

from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests

from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserResponse, GoogleAuthRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

GOOGLE_CLIENT_ID: str = os.environ["GOOGLE_CLIENT_ID"]
APP_SECRET_KEY: str = os.environ["APP_SECRET_KEY"]
ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", "8"))

bearer_scheme = HTTPBearer(auto_error=False)

def _verify_google_token(credential: str) -> dict:
    try:
        claims: dict = google_id_token.verify_oauth2_token(
            id_token=credential,
            request=google_requests.Request(),
            audience=GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google credential: {exc}",
        ) from exc

    if claims.get("iss") not in ("accounts.google.com", "https://accounts.google.com"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token issuer is not Google.",
        )
    return claims

def _upsert_user(db: Session, claims: dict) -> User:
    google_id: str = claims["sub"]
    user: Optional[User] = db.query(User).filter(User.google_id == google_id).first()

    if user is None:
        user = User(
            google_id=google_id,
            email=claims["email"],
            full_name=claims.get("name"),
            picture_url=claims.get("picture"),
            is_active=True,
        )
        db.add(user)
        db.flush()
    else:
        user.full_name = claims.get("name", user.full_name)
        user.picture_url = claims.get("picture", user.picture_url)
        user.updated_at = datetime.now(timezone.utc)
    return user

def _create_access_token(user: User) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "iat": now,
        "exp": now + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS),
    }
    return jwt.encode(payload, APP_SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization token.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    try:
        payload = jwt.decode(credentials.credentials, APP_SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token Validation Failed: {exc}",
            headers={"WWW-Authenticate": "Bearer"}
        ) from exc

    user_id: Optional[str] = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing 'sub' claim.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user: Optional[User] = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with this token no longer exists.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated.",
        )
    return user

# Routes

@router.post("/google", response_model=TokenResponse, status_code=200, summary="Authenticate with Google OAuth2")
def google_auth(body: GoogleAuthRequest, db: Session = Depends(get_db)) -> TokenResponse:
    claims = _verify_google_token(body.credential)
    user = _upsert_user(db, claims)
    access_token = _create_access_token(user)
    return TokenResponse(access_token=access_token, user=UserResponse.model_validate(user))

@router.get("/me", response_model=UserResponse, status_code=200, summary="Get current user profile")
def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(current_user)

@router.post("/logout", status_code=204, summary="Logout user (client-side token removal)")
def logout(_current_user: User = Depends(get_current_user)) -> None:
    return None
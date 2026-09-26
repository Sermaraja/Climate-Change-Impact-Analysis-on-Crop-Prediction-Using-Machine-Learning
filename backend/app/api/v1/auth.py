from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserRegister, UserLogin, UserResponse, TokenResponse,
    UserUpdateOnboarding, UserLanguageUpdate
)
from app.services.auth_service import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegister, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # Hash password & create user
    hashed_pwd = hash_password(payload.password)
    user = User(
        email=payload.email.lower(),
        password_hash=hashed_pwd,
        full_name=payload.full_name,
        phone=payload.phone,
        preferred_language=payload.preferred_language or "EN",
        role="FARMER",
        onboarding_completed=False,
        tour_status="NOT_STARTED"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate access token
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post("/login", response_model=TokenResponse)
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials."
        )

    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.put("/me/onboarding", response_model=UserResponse)
def update_user_onboarding(
    payload: UserUpdateOnboarding,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if payload.onboarding_completed is not None:
        current_user.onboarding_completed = payload.onboarding_completed
    if payload.tour_status is not None:
        current_user.tour_status = payload.tour_status
    if payload.preferred_language is not None:
        current_user.preferred_language = payload.preferred_language.upper()
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.put("/me/language", response_model=UserResponse)
def update_user_language(
    payload: UserLanguageUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.preferred_language = payload.preferred_language.upper()
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)



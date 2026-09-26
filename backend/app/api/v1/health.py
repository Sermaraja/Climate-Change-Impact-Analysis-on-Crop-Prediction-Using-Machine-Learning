from fastapi import APIRouter

router = APIRouter()


@router.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "application": "Climate Change Impact Analysis on Crop Prediction Using Machine Learning"
    }

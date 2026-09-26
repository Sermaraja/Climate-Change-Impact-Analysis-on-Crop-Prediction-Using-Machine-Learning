from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.services.auth_service import get_current_user
from app.services.admin_service import get_admin_dashboard_stats, log_scientific_rule_change

router = APIRouter(prefix="/admin", tags=["Admin & Research Panel"])


def require_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied. Administrator privileges required for scientific configuration and research panel."
        )
    return current_user


@router.get("/dashboard-stats")
def get_admin_stats(
    admin_user: User = Depends(require_admin_user),
    db: Session = Depends(get_db),
):
    """
    Stage 22: Returns user counts, prediction statistics, risk distributions,
    model metadata, and registered dataset provenance.
    """
    return get_admin_dashboard_stats(db)


@router.post("/log-rule-change")
def audit_rule_change(
    entity_name: str,
    entity_id: int,
    old_value: str,
    new_value: str,
    admin_user: User = Depends(require_admin_user),
):
    """
    Stage 22: Logs scientific rule modifications with changed_by, timestamp, and values.
    """
    log_scientific_rule_change(admin_user.email, entity_name, entity_id, old_value, new_value)
    return {"status": "SUCCESS", "message": "Scientific rule audit log recorded successfully."}

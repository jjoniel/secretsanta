from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_active_user
from ..services.assignment import assign_secret_santas, get_assignment_history
from ..services.email import send_assignments_via_email

router = APIRouter(prefix="/api/groups/{group_id}/assignments", tags=["assignments"])


def verify_group_ownership(group_id: int, user_id: int, db: Session) -> models.Group:
    """Verify that the user owns the group"""
    group = (
        db.query(models.Group)
        .filter(models.Group.id == group_id, models.Group.owner_id == user_id)
        .first()
    )
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Group not found"
        )
    return group


@router.post("", response_model=schemas.AssignmentResult)
def create_assignment(
    group_id: int,
    assignment_data: schemas.AssignmentCreate,
    send_emails: bool = Query(False, description="Send emails to participants"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Create Secret Santa assignments for a group"""
    verify_group_ownership(group_id, current_user.id, db)

    try:
        # Generate assignments
        assignments_dict = assign_secret_santas(db, group_id, assignment_data.year)

        # Convert to response format
        assignments = []
        for giver_email, receiver_name in assignments_dict.items():
            # Get participant details
            giver = (
                db.query(models.Participant)
                .filter(
                    models.Participant.email == giver_email,
                    models.Participant.group_id == group_id,
                )
                .first()
            )
            receiver = (
                db.query(models.Participant)
                .filter(
                    models.Participant.name == receiver_name,
                    models.Participant.group_id == group_id,
                )
                .first()
            )

            if giver and receiver:
                assignments.append(
                    schemas.AssignmentResponse(
                        giver_name=giver.name,
                        giver_email=giver.email,
                        receiver_name=receiver.name,
                        receiver_email=receiver.email,
                    )
                )

        # Send emails if requested
        if send_emails:
            try:
                send_assignments_via_email(assignments_dict)
            except Exception as e:
                return schemas.AssignmentResult(
                    assignments=assignments,
                    success=True,
                    message=f"Assignments created but email sending failed: {str(e)}",
                )

        return schemas.AssignmentResult(
            assignments=assignments,
            success=True,
            message="Assignments created successfully",
        )

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/history", response_model=List[dict])
def get_history(
    group_id: int,
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Get assignment history for a group"""
    verify_group_ownership(group_id, current_user.id, db)
    return get_assignment_history(db, group_id, year)

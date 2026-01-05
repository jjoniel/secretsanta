from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_active_user

router = APIRouter(prefix="/api/groups/{group_id}/participants", tags=["participants"])


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


@router.post(
    "", response_model=schemas.ParticipantResponse, status_code=status.HTTP_201_CREATED
)
def create_participant(
    group_id: int,
    participant: schemas.ParticipantCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Add a participant to a group"""
    verify_group_ownership(group_id, current_user.id, db)

    db_participant = models.Participant(
        name=participant.name, email=participant.email, group_id=group_id
    )
    db.add(db_participant)
    db.commit()
    db.refresh(db_participant)
    return db_participant


@router.post(
    "/bulk",
    response_model=List[schemas.ParticipantResponse],
    status_code=status.HTTP_201_CREATED,
)
def create_participants_bulk(
    group_id: int,
    bulk_data: schemas.BulkParticipantCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Add multiple participants to a group at once"""
    verify_group_ownership(group_id, current_user.id, db)

    db_participants = []
    for participant in bulk_data.participants:
        db_participant = models.Participant(
            name=participant.name, email=participant.email, group_id=group_id
        )
        db.add(db_participant)
        db_participants.append(db_participant)

    db.commit()
    for p in db_participants:
        db.refresh(p)
    return db_participants


@router.get("", response_model=List[schemas.ParticipantWithRestrictions])
def get_participants(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Get all participants in a group"""
    verify_group_ownership(group_id, current_user.id, db)

    participants = (
        db.query(models.Participant)
        .filter(models.Participant.group_id == group_id)
        .all()
    )

    result = []
    for p in participants:
        participant_data = schemas.ParticipantWithRestrictions(
            id=p.id,
            name=p.name,
            email=p.email,
            group_id=p.group_id,
            created_at=p.created_at,
            allowed_receivers=[r.name for r in p.allowed_receivers],
        )
        result.append(participant_data)

    return result


@router.get("/{participant_id}", response_model=schemas.ParticipantWithRestrictions)
def get_participant(
    group_id: int,
    participant_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Get a specific participant"""
    verify_group_ownership(group_id, current_user.id, db)

    participant = (
        db.query(models.Participant)
        .filter(
            models.Participant.id == participant_id,
            models.Participant.group_id == group_id,
        )
        .first()
    )

    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Participant not found"
        )

    return schemas.ParticipantWithRestrictions(
        id=participant.id,
        name=participant.name,
        email=participant.email,
        group_id=participant.group_id,
        created_at=participant.created_at,
        allowed_receivers=[r.name for r in participant.allowed_receivers],
    )


@router.put("/{participant_id}", response_model=schemas.ParticipantResponse)
def update_participant(
    group_id: int,
    participant_id: int,
    participant: schemas.ParticipantUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Update a participant"""
    verify_group_ownership(group_id, current_user.id, db)

    db_participant = (
        db.query(models.Participant)
        .filter(
            models.Participant.id == participant_id,
            models.Participant.group_id == group_id,
        )
        .first()
    )

    if not db_participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Participant not found"
        )

    if participant.name is not None:
        db_participant.name = participant.name
    if participant.email is not None:
        db_participant.email = participant.email

    db.commit()
    db.refresh(db_participant)
    return db_participant


@router.delete("/{participant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_participant(
    group_id: int,
    participant_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Delete a participant"""
    verify_group_ownership(group_id, current_user.id, db)

    db_participant = (
        db.query(models.Participant)
        .filter(
            models.Participant.id == participant_id,
            models.Participant.group_id == group_id,
        )
        .first()
    )

    if not db_participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Participant not found"
        )

    db.delete(db_participant)
    db.commit()
    return None


@router.put(
    "/{participant_id}/restrictions", response_model=schemas.ParticipantWithRestrictions
)
def update_restrictions(
    group_id: int,
    participant_id: int,
    restriction_data: schemas.RestrictionUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Update who a participant can be assigned to"""
    verify_group_ownership(group_id, current_user.id, db)

    # Verify participant belongs to this group
    participant = (
        db.query(models.Participant)
        .filter(
            models.Participant.id == participant_id,
            models.Participant.group_id == group_id,
        )
        .first()
    )

    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Participant not found"
        )

    # Verify all receiver IDs belong to the same group
    receiver_ids = set(restriction_data.allowed_receiver_ids)
    all_participants = (
        db.query(models.Participant)
        .filter(models.Participant.group_id == group_id)
        .all()
    )
    valid_ids = {p.id for p in all_participants}

    if not receiver_ids.issubset(valid_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Some receiver IDs do not belong to this group",
        )

    # Can't assign to self
    if participant_id in receiver_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A participant cannot be assigned to themselves",
        )

    # Clear existing restrictions
    participant.allowed_receivers.clear()

    # Add new restrictions
    receivers = (
        db.query(models.Participant)
        .filter(models.Participant.id.in_(restriction_data.allowed_receiver_ids))
        .all()
    )
    participant.allowed_receivers = receivers

    db.commit()
    db.refresh(participant)

    return schemas.ParticipantWithRestrictions(
        id=participant.id,
        name=participant.name,
        email=participant.email,
        group_id=participant.group_id,
        created_at=participant.created_at,
        allowed_receivers=[r.name for r in participant.allowed_receivers],
    )

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_active_user

router = APIRouter(prefix="/api/groups", tags=["groups"])


@router.post(
    "", response_model=schemas.GroupResponse, status_code=status.HTTP_201_CREATED
)
def create_group(
    group: schemas.GroupCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Create a new Secret Santa group"""
    db_group = models.Group(name=group.name, owner_id=current_user.id)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group


@router.get("", response_model=List[schemas.GroupResponse])
def get_groups(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Get all groups owned by the current user"""
    groups = (
        db.query(models.Group).filter(models.Group.owner_id == current_user.id).all()
    )
    return groups


@router.get("/{group_id}", response_model=schemas.GroupResponse)
def get_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Get a specific group"""
    group = (
        db.query(models.Group)
        .filter(models.Group.id == group_id, models.Group.owner_id == current_user.id)
        .first()
    )
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Group not found"
        )
    return group


@router.put("/{group_id}", response_model=schemas.GroupResponse)
def update_group(
    group_id: int,
    group: schemas.GroupCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Update a group"""
    db_group = (
        db.query(models.Group)
        .filter(models.Group.id == group_id, models.Group.owner_id == current_user.id)
        .first()
    )
    if not db_group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Group not found"
        )
    db_group.name = group.name
    db.commit()
    db.refresh(db_group)
    return db_group


@router.delete("/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Delete a group"""
    db_group = (
        db.query(models.Group)
        .filter(models.Group.id == group_id, models.Group.owner_id == current_user.id)
        .first()
    )
    if not db_group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Group not found"
        )
    db.delete(db_group)
    db.commit()
    return None

from pydantic import BaseModel, EmailStr, field_validator
from typing import List, Optional
from datetime import datetime


# User schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not isinstance(v, str):
            raise ValueError("Password must be a string")
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters long")
        # Check byte length (bcrypt limit is 72 bytes)
        password_bytes = v.encode('utf-8')
        if len(password_bytes) > 72:
            raise ValueError(
                f"Password is too long ({len(password_bytes)} bytes). "
                "Maximum 72 bytes allowed (approximately 72 ASCII characters or fewer Unicode characters)."
            )
        return v


class UserResponse(BaseModel):
    id: int
    email: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# Group schemas
class GroupCreate(BaseModel):
    name: str


class GroupResponse(BaseModel):
    id: int
    name: str
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Participant schemas
class ParticipantCreate(BaseModel):
    name: str
    email: EmailStr


class ParticipantUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None


class ParticipantResponse(BaseModel):
    id: int
    name: str
    email: str
    group_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ParticipantWithRestrictions(ParticipantResponse):
    allowed_receivers: List[str] = []  # Names of allowed receivers


# Assignment schemas
class AssignmentCreate(BaseModel):
    group_id: int
    year: Optional[int] = None  # If None, uses current year


class AssignmentResponse(BaseModel):
    giver_name: str
    giver_email: str
    receiver_name: str
    receiver_email: str


class AssignmentResult(BaseModel):
    assignments: List[AssignmentResponse]
    success: bool
    message: Optional[str] = None


# Bulk operations
class BulkParticipantCreate(BaseModel):
    participants: List[ParticipantCreate]


class RestrictionUpdate(BaseModel):
    giver_id: int
    allowed_receiver_ids: List[int]

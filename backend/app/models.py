from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Table,
    Boolean,
    DateTime,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

# Association table for many-to-many relationship between participants
# (who can be assigned to whom)
participant_restrictions = Table(
    "participant_restrictions",
    Base.metadata,
    Column("giver_id", Integer, ForeignKey("participants.id"), primary_key=True),
    Column("receiver_id", Integer, ForeignKey("participants.id"), primary_key=True),
)

# Association table for assignment history
assignment_history = Table(
    "assignment_history",
    Base.metadata,
    Column("giver_id", Integer, ForeignKey("participants.id"), primary_key=True),
    Column("receiver_id", Integer, ForeignKey("participants.id"), primary_key=True),
    Column("group_id", Integer, ForeignKey("groups.id"), primary_key=True),
    Column("year", Integer, nullable=False),
    Column("created_at", DateTime(timezone=True), server_default=func.now()),
)


class User(Base):
    """User accounts for authentication"""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    groups = relationship("Group", back_populates="owner")


class Group(Base):
    """Secret Santa groups"""

    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="groups")
    participants = relationship(
        "Participant", back_populates="group", cascade="all, delete-orphan"
    )


class Participant(Base):
    """Participants in a Secret Santa group"""

    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    group = relationship("Group", back_populates="participants")

    # Many-to-many: who this participant CAN be assigned to
    allowed_receivers = relationship(
        "Participant",
        secondary=participant_restrictions,
        primaryjoin=id == participant_restrictions.c.giver_id,
        secondaryjoin=id == participant_restrictions.c.receiver_id,
        backref="allowed_givers",
    )

    # History of past assignments (who this participant has been assigned to)
    past_assignments = relationship(
        "Participant",
        secondary=assignment_history,
        primaryjoin=id == assignment_history.c.giver_id,
        secondaryjoin=id == assignment_history.c.receiver_id,
        backref="past_givers",
    )

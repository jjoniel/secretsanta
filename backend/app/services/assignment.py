from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from collections import deque
import random
from .. import models
from datetime import datetime


def assign_secret_santas(
    db: Session, group_id: int, year: Optional[int] = None
) -> Dict[str, str]:
    """
    Assign Secret Santas using DFS algorithm to create a circular assignment.
    Returns a dict mapping giver_email -> receiver_name
    """
    if year is None:
        year = datetime.now().year

    # Get all participants for this group
    participants = (
        db.query(models.Participant)
        .filter(models.Participant.group_id == group_id)
        .all()
    )

    if len(participants) < 2:
        raise ValueError("Need at least 2 participants for Secret Santa")

    # Build options map: who can give to whom
    # A participant can give to someone if:
    # 1. They are in their allowed_receivers list, OR
    # 2. They haven't been assigned to them in previous years
    options = {}
    email_map = {}
    name_to_participant = {}

    for participant in participants:
        email_map[participant.name] = participant.email
        name_to_participant[participant.name] = participant

        # Start with all other participants as potential receivers
        potential_receivers = [p for p in participants if p.id != participant.id]

        # Filter by allowed_receivers (restrictions)
        if participant.allowed_receivers:
            # Only include participants in allowed_receivers
            allowed_ids = {p.id for p in participant.allowed_receivers}
            potential_receivers = [
                p for p in potential_receivers if p.id in allowed_ids
            ]

        # Filter out past assignments (from previous years)
        if participant.past_assignments:
            past_ids = {p.id for p in participant.past_assignments}
            potential_receivers = [
                p for p in potential_receivers if p.id not in past_ids
            ]

        options[participant.name] = [p.name for p in potential_receivers]

        # Check if this participant has any valid options
        if not options[participant.name]:
            raise ValueError(
                f"No valid assignment options for {participant.name}. "
                "They may have already been assigned to all available participants "
                "or have too many restrictions."
            )

    # DFS to find a valid circular assignment
    names = [p.name for p in participants]
    random.shuffle(names)

    found_path = None

    def dfs(path: List[str]) -> Optional[Dict[str, str]]:
        """Depth-first search to find a valid circular path"""
        nonlocal found_path
        if len(path) == len(names):
            # Check if we can close the circle
            if path[0] in options[path[-1]]:
                # Create assignments dict
                assignments = {}
                for i in range(len(path)):
                    giver_name = path[i]
                    receiver_name = path[(i + 1) % len(path)]
                    assignments[email_map[giver_name]] = receiver_name
                found_path = path  # Store the actual path found
                return assignments
            return None

        current = path[-1]
        # Try all valid options
        for next_person in options[current]:
            if next_person not in path:
                result = dfs(path + [next_person])
                if result:
                    return result
        return None

    # Try starting from each participant
    for start_person in names:
        result = dfs([start_person])
        if result and found_path:
            # Save assignments to history using the actual path found
            from sqlalchemy import select

            for i, giver_name in enumerate(found_path):
                receiver_name = found_path[(i + 1) % len(found_path)]
                giver = name_to_participant[giver_name]
                receiver = name_to_participant[receiver_name]

                # Check if this assignment already exists
                stmt = select(models.assignment_history).where(
                    models.assignment_history.c.giver_id == giver.id,
                    models.assignment_history.c.receiver_id == receiver.id,
                    models.assignment_history.c.group_id == group_id,
                    models.assignment_history.c.year == year,
                )
                existing = db.execute(stmt).first()

                if not existing:
                    # Add to history
                    insert_stmt = models.assignment_history.insert().values(
                        giver_id=giver.id,
                        receiver_id=receiver.id,
                        group_id=group_id,
                        year=year,
                    )
                    db.execute(insert_stmt)

            db.commit()
            return result

    raise ValueError(
        "No valid Secret Santa assignment could be created. "
        "Try adjusting restrictions or clearing some past assignments."
    )


def get_assignment_history(
    db: Session, group_id: int, year: Optional[int] = None
) -> List[Dict]:
    """Get assignment history for a group"""
    from sqlalchemy import select

    query = select(
        models.assignment_history.c.giver_id,
        models.assignment_history.c.receiver_id,
        models.assignment_history.c.year,
    ).where(models.assignment_history.c.group_id == group_id)

    if year:
        query = query.where(models.assignment_history.c.year == year)

    results = db.execute(query).fetchall()

    # Get participant names
    history = []
    for row in results:
        giver = db.query(models.Participant).filter_by(id=row.giver_id).first()
        receiver = db.query(models.Participant).filter_by(id=row.receiver_id).first()
        if giver and receiver:
            history.append(
                {
                    "giver_name": giver.name,
                    "receiver_name": receiver.name,
                    "year": row.year,
                }
            )

    return history

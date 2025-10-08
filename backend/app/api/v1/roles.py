from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ...db.base import get_db, Base, engine
from ...services.role_service import list_roles, create_role, assign_role

router = APIRouter(prefix="/api/v1")
Base.metadata.create_all(bind=engine)

@router.get("/roles")
def get_roles(db: Session = Depends(get_db)):
    return list_roles(db)

@router.post("/roles")
def post_role(name: str, description: str = "", db: Session = Depends(get_db)):
    # In future: require admin
    return create_role(db, name, description)

@router.post("/assign-role")
def post_assign_role(user_id: int, role_id: int, db: Session = Depends(get_db)):
    # In future: require admin
    return assign_role(db, user_id, role_id)



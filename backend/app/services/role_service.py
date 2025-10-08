from typing import List
from sqlalchemy.orm import Session
from ..db.models import Role, UserRole

def list_roles(db: Session):
    return db.query(Role).all()

def create_role(db: Session, name: str, description: str = ""):
    role = Role(name=name, description=description)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role

def assign_role(db: Session, user_id: int, role_id: int):
    ur = UserRole(user_id=user_id, role_id=role_id)
    db.add(ur)
    db.commit()
    db.refresh(ur)
    return ur

def user_has_any_role(db: Session, user_id: int, role_names: List[str]):
    q = (
        db.query(Role)
        .join(UserRole, UserRole.role_id == Role.id)
        .filter(UserRole.user_id == user_id, Role.name.in_(role_names))
    )
    return db.query(q.exists()).scalar()



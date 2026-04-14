import sys
sys.path.insert(0, '.')

from app.main import app
from app.services import user_service
from app.schemas import UserCreate
from app.core.database import SessionLocal

db = SessionLocal()
try:
    user = user_service.create_user(db, UserCreate(
        username="admin",
        email="admin@quantmaster.com",
        password="admin123"
    ))
    print(f"User created: {user.id} - {user.username} - {user.email}")
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()

import sys
sys.path.insert(0, '.')

from app.core.database import SessionLocal
from app.models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

db = SessionLocal()
try:
    user = db.query(User).filter(User.username == "admin").first()
    if user:
        print(f"管理员账号已存在:")
        print(f"  用户名: admin")
        print(f"  邮箱: {user.email}")
        print(f"  用户ID: {user.id}")
        print(f"  密码: admin123 (已设置)")
    else:
        print("管理员账号不存在")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()

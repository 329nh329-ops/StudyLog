from app.core.config import settings
from app.core.security import hash_password
from app.db.database import SessionLocal
from app.models.category import Category
from app.models.user import User

INITIAL_CATEGORY_NAMES = [
    "Java",
    "Spring Boot",
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Python",
    "SQL",
    "AWS",
    "Git",
    "Docker",
    "その他",
]


def seed_categories(db) -> None:
    existing_names = {
        name for (name,) in db.query(Category.name).filter(Category.is_deleted.is_(False)).all()
    }
    for name in INITIAL_CATEGORY_NAMES:
        if name in existing_names:
            continue
        db.add(Category(name=name, is_deleted=False))
    db.commit()


def seed_admin(db) -> None:
    existing = db.query(User).filter(User.username == settings.seed_admin_username).first()
    if existing is not None:
        return
    admin = User(
        username=settings.seed_admin_username,
        password_hash=hash_password(settings.seed_admin_password),
        role="ADMIN",
    )
    db.add(admin)
    db.commit()


def main() -> None:
    db = SessionLocal()
    try:
        seed_categories(db)
        seed_admin(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()

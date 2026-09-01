from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Computed, DateTime, String, UniqueConstraint, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.study_record import StudyRecord


class Category(Base):
    __tablename__ = "categories"
    __table_args__ = (UniqueConstraint("active_name", name="uq_categories_active_name"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
    )
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # is_deleted=FALSEの行だけnameを持ち、TRUEの行はNULLになる生成カラム。
    # MySQLのUNIQUEインデックスはNULLを複数許容するため、
    # 「未削除カテゴリの中でのみnameが一意」という部分ユニーク制約を実現する。
    active_name: Mapped[str | None] = mapped_column(
        String(50),
        Computed("IF(is_deleted = 0, name, NULL)", persisted=True),
    )

    study_records: Mapped[list[StudyRecord]] = relationship(back_populates="category")

from datetime import datetime

from sqlalchemy import text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from main_source.database import Base, int_pk, str_uniq
from main_source.news.models import NewsORM


class ScreeningsORM(Base):
    __tablename__ = "screenings"
    # Columns
    id: Mapped[int_pk]
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    object_id: Mapped[int] = mapped_column(
        ForeignKey("objects.id", ondelete="CASCADE"),
        nullable=False
    )
    date_time: Mapped[datetime] = mapped_column(nullable=False)
    # Relationships
    user = relationship(
        "UsersORM",
        back_populates="screenings",
        foreign_keys=[user_id]
    )
    object = relationship(
        "ObjectsORM",
        back_populates="screenings",
        foreign_keys=[object_id]
    )




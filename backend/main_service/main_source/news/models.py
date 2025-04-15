from sqlalchemy import text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from main_source.database import Base, int_pk, str_uniq


class NewsORM(Base):
    __tablename__ = "news"
    # Columns
    id: Mapped[int_pk]
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    title: Mapped[str]
    description: Mapped[str]
    # Relationships
    user = relationship(
        "UsersORM",
        back_populates="news",
        foreign_keys=[user_id]
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "user_id": self.user_id,
            "description": self.description,
            "user": self.user,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

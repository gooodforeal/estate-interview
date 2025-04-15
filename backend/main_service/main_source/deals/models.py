from sqlalchemy import text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from main_source.database import Base, int_pk


class DealsORM(Base):
    __tablename__ = "deals"
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
    price: Mapped[int] = mapped_column(nullable=False)
    status: Mapped[str] = mapped_column(nullable=False)
    # Relationships
    user = relationship(
        "UsersORM",
        back_populates="deals",
        foreign_keys=[user_id]
    )
    object = relationship(
        "ObjectsORM",
        back_populates="deals",
        foreign_keys=[object_id]
    )




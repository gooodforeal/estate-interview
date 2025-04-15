from sqlalchemy import text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from main_source.database import Base, int_pk, str_uniq
from main_source.news.models import NewsORM
from main_source.deals.models import DealsORM
from main_source.screenings.models import ScreeningsORM


class ObjectsORM(Base):
    __tablename__ = "objects"
    # Columns
    id: Mapped[int_pk]
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    title: Mapped[str_uniq] = mapped_column(nullable=False)
    address: Mapped[str] = mapped_column(nullable=False)
    photo_link: Mapped[str] = mapped_column(nullable=True)
    author: Mapped[str] = mapped_column(nullable=False)
    price: Mapped[int] = mapped_column(nullable=False)
    total_square: Mapped[float] = mapped_column(nullable=False)
    metro: Mapped[str] = mapped_column(nullable=True)
    floor: Mapped[str] = mapped_column(nullable=True)
    remont_type: Mapped[str] = mapped_column(nullable=True)
    description: Mapped[str] = mapped_column(nullable=True)
    cian_link: Mapped[str] = mapped_column(nullable=True)
    # Relationships
    user = relationship(
        "UsersORM",
        back_populates="objects",
        foreign_keys=[user_id]
    )
    screenings: Mapped[list["ScreeningsORM"]] = relationship(
        "ScreeningsORM",
        back_populates="object",
        foreign_keys=[ScreeningsORM.object_id],
        cascade="all, delete"
    )
    deals: Mapped[list["DealsORM"]] = relationship(
        "DealsORM",
        back_populates="object",
        foreign_keys=[DealsORM.object_id],
        cascade="all, delete"
    )





from sqlalchemy import text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from main_source.database import Base, int_pk, str_uniq

from main_source.news.models import NewsORM
from main_source.objects.models import ObjectsORM
from main_source.screenings.models import ScreeningsORM
from main_source.deals.models import DealsORM


class UsersORM(Base):
    __tablename__ = "users"
    # Columns
    id: Mapped[int_pk]
    fio: Mapped[str]
    email: Mapped[str_uniq]
    password: Mapped[str]
    avatar_link: Mapped[str] = mapped_column(nullable=True)
    verified: Mapped[bool] = mapped_column(default=False, nullable=False)
    verification_code: Mapped[str] = mapped_column(nullable=True)
    is_admin: Mapped[bool] = mapped_column(default=False, server_default=text('false'), nullable=False)
    # Relationships
    news: Mapped[list["NewsORM"]] = relationship(
        "NewsORM",
        back_populates="user",
        foreign_keys=[NewsORM.user_id],
        cascade="all, delete"
    )
    objects: Mapped[list["ObjectsORM"]] = relationship(
        "ObjectsORM",
        back_populates="user",
        foreign_keys=[ObjectsORM.user_id],
        cascade="all, delete"
    )
    screenings: Mapped[list["ScreeningsORM"]] = relationship(
        "ScreeningsORM",
        back_populates="user",
        foreign_keys=[ScreeningsORM.user_id],
        cascade="all, delete"
    )
    deals: Mapped[list["DealsORM"]] = relationship(
        "DealsORM",
        back_populates="user",
        foreign_keys=[DealsORM.user_id],
        cascade="all, delete"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "fio": self.fio,
            "email": self.email,
            "avatar_link": self.avatar_link,
            "password": self.password,
            "verified": self.verified,
            "verification_code": self.verification_code,
            "is_admin": self.is_admin,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

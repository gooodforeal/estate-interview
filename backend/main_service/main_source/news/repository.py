from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import joinedload

from main_source.news.models import NewsORM
from main_source.users.models import UsersORM
from main_source.database import async_session_maker
from main_source.repository.base import BaseRepository


class NewsRepository(BaseRepository):
    model = NewsORM

    @classmethod
    async def add_new(cls, data: dict):
        async with async_session_maker() as session:
            get_user = (
                select(UsersORM)
                .filter_by(id=data["user_id"])
            )
            user_orm = (await session.execute(get_user)).scalar_one()
            new_item = NewsORM(
                title=data["title"],
                description=data["description"],
                user_id=data["user_id"],
                user=user_orm
            )
            session.add(new_item)
            try:
                await session.commit()
                return new_item
            except SQLAlchemyError as e:
                await session.rollback()
                raise e

    @classmethod
    async def find_all_joined_user(cls):
        async with async_session_maker() as session:
            query = (
                select(cls.model)
                .options(joinedload(cls.model.user).load_only(UsersORM.fio, UsersORM.avatar_link))
            )
            result = await session.execute(query)
            return result.scalars().all()

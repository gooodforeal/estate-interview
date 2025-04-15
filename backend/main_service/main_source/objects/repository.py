from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import joinedload

from main_source.database import async_session_maker
from main_source.repository.base import BaseRepository
from main_source.objects.models import ObjectsORM
from main_source.users.models import UsersORM


class ObjectsRepository(BaseRepository):
    model = ObjectsORM

    @classmethod
    async def add_new_manually(cls, data: dict):
        async with async_session_maker() as session:
            new_item = ObjectsORM(**data)
            session.add(new_item)
            try:
                await session.commit()
                return new_item
            except SQLAlchemyError as e:
                await session.rollback()
                raise e

    @classmethod
    async def find_one_or_none_by_id(cls, object_id: int):
        async with async_session_maker() as session:
            query = (
                select(cls.model).filter_by(id=object_id)
                .options(joinedload(cls.model.user).load_only(UsersORM.fio, UsersORM.avatar_link))
            )
            result = await session.execute(query)
            return result.scalar_one_or_none()

    @classmethod
    async def find_all(cls, **filter_by):
        async with async_session_maker() as session:
            query = (
                select(cls.model).filter_by(**filter_by)
                .options(joinedload(cls.model.user).load_only(UsersORM.fio, UsersORM.avatar_link))
            )
            result = await session.execute(query)
            return result.scalars().all()

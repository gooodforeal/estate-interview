from sqlalchemy import select

from main_source.users.models import UsersORM
from main_source.database import async_session_maker
from main_source.repository.base import BaseRepository
from sqlalchemy.orm import joinedload, selectinload


class UsersRepository(BaseRepository):
    model = UsersORM

    @classmethod
    async def find_one_or_none_by_id(cls, data_id: int) -> UsersORM:
        async with async_session_maker() as session:
            query = select(cls.model).filter_by(id=data_id)
            result = await session.execute(query)
            return result.scalar_one_or_none()

    @classmethod
    async def find_stats(cls, **filter_by):
        async with async_session_maker() as session:
            query = (
                select(cls.model).filter_by(**filter_by)
                .options(selectinload(UsersORM.objects))
                .options(selectinload(UsersORM.deals))
                .options(selectinload(UsersORM.screenings))
            )
            result = await session.execute(query)
            return result.scalar_one_or_none()

    @classmethod
    async def find_stats_all(cls, **filter_by):
        async with async_session_maker() as session:
            query = (
                select(cls.model).filter_by(**filter_by)
                .options(selectinload(UsersORM.objects))
                .options(selectinload(UsersORM.deals))
                .options(selectinload(UsersORM.screenings))
            )
            result = await session.execute(query)
            return result.scalars().all()

from datetime import datetime, date

from sqlalchemy import select, update, func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import joinedload

from main_source.database import async_session_maker
from main_source.repository.base import BaseRepository
from main_source.screenings.models import ScreeningsORM
from main_source.users.models import UsersORM
from main_source.objects.models import ObjectsORM


class ScreeningsRepository(BaseRepository):
    model = ScreeningsORM

    @classmethod
    async def add(cls, data: dict):
        async with async_session_maker() as session:
            async with session.begin():
                get_user = (
                    select(UsersORM)
                    .filter_by(id=data["user_id"])
                )
                user_orm: UsersORM = (await session.execute(get_user)).scalar_one()
                get_object = (
                    select(ObjectsORM)
                    .filter_by(id=data["object_id"])
                )
                object_orm: ObjectsORM = (await session.execute(get_object)).scalar_one()
                new_screening = cls.model(
                    user_id=data["user_id"],
                    object_id=data["object_id"],
                    # Cant store timezone in db
                    date_time=data["date_time"].replace(tzinfo=None),
                    user=user_orm,
                    object=object_orm
                )
                session.add(new_screening)
                try:
                    await session.commit()
                except SQLAlchemyError as e:
                    await session.rollback()
                    raise e
                return new_screening

    @classmethod
    async def update_date(cls, scr_id: int, date_time: datetime):
        async with async_session_maker() as session:
            async with session.begin():
                query = (
                    update(cls.model)
                    .where(cls.model.id == scr_id)
                    .values(date_time=date_time.replace(tzinfo=None))
                    .execution_options(synchronize_session="fetch")
                )
                result = await session.execute(query)
                try:
                    await session.commit()
                except SQLAlchemyError as e:
                    await session.rollback()
                    raise e
                return result.rowcount

    @classmethod
    async def find_one_or_none_by_id(cls, scr_id: int):
        async with async_session_maker() as session:
            query = (
                select(cls.model).filter_by(id=scr_id)
                .options(joinedload(cls.model.user).load_only(UsersORM.fio, UsersORM.avatar_link))
                .options(joinedload(cls.model.object).load_only(ObjectsORM.title, ObjectsORM.address))
            )
            result = await session.execute(query)
            return result.scalar_one_or_none()

    @classmethod
    async def find_all(cls, **filter_by):
        async with async_session_maker() as session:
            query = (
                select(cls.model)
                .options(joinedload(cls.model.user).load_only(UsersORM.fio, UsersORM.avatar_link))
                .options(joinedload(cls.model.object).load_only(ObjectsORM.title, ObjectsORM.address))
            )
            result = await session.execute(query)
            return result.scalars().all()

    @classmethod
    async def find_all_today(cls):
        async with async_session_maker() as session:
            query = (
                select(cls.model)
                .filter(func.date(cls.model.date_time) == date.today())
                .options(joinedload(cls.model.user).load_only(UsersORM.fio, UsersORM.avatar_link))
                .options(joinedload(cls.model.object).load_only(ObjectsORM.title, ObjectsORM.address))
            )
            result = await session.execute(query)
            return result.scalars().all()

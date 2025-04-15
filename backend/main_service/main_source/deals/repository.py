from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import joinedload

from main_source.database import async_session_maker

from main_source.repository.base import BaseRepository

from main_source.objects.models import ObjectsORM
from main_source.users.models import UsersORM
from main_source.deals.models import DealsORM


class DealsRepository(BaseRepository):
    model = DealsORM

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
                new_deal = cls.model(
                    user_id=data["user_id"],
                    object_id=data["object_id"],
                    price=data["price"],
                    status=data["status"],
                    user=user_orm,
                    object=object_orm
                )
                session.add(new_deal)
                try:
                    await session.commit()
                except SQLAlchemyError as e:
                    await session.rollback()
                    raise e
                return new_deal

    @classmethod
    async def find_one_or_none_by_id(cls, deal_id: int):
        async with async_session_maker() as session:
            query = (
                select(cls.model).filter_by(id=deal_id)
                .options(joinedload(cls.model.user).load_only(UsersORM.fio, UsersORM.avatar_link))
                .options(joinedload(cls.model.object))
            )
            result = await session.execute(query)
            return result.scalar_one_or_none()

    @classmethod
    async def find_all(cls, **filter_by):
        async with async_session_maker() as session:
            query = (
                select(cls.model)
                .options(joinedload(cls.model.user).load_only(UsersORM.fio, UsersORM.avatar_link))
                .options(joinedload(cls.model.object))
            )
            result = await session.execute(query)
            return result.scalars().all()



from fastapi import APIRouter, Depends

from main_source.news.schemas import SNewsAdd, SNewsResponse, SNew, SNewsAddResponse, SNewDeleteResponse

from main_source.news.models import NewsORM

from main_source.news.repository import NewsRepository
from main_source.exceptions import NewNotFoundException

from main_source.users.deps import CurrentAdminUser, CurrentUser


router = APIRouter(prefix='/news', tags=['News'])


@router.post("/add")
async def add_new(
        news_data: SNewsAdd,
        current_user: CurrentAdminUser
) -> SNewsAddResponse:
    result: NewsORM = await NewsRepository.add_new(
        {
            "title": news_data.title,
            "description": news_data.description,
            "user_id": current_user.id
        }
    )
    # Maybe add notifications >>
    return SNewsAddResponse(
        status="ok",
        message="Successful request!",
        data=SNew.model_validate(result)
    )


@router.delete("/delete/{new_id}")
async def delete_new(
        new_id: int,
        current_user: CurrentAdminUser
) -> SNewDeleteResponse:
    # Find new with such id
    result = await NewsRepository.find_one_or_none(id=new_id)
    # New not found
    if not result:
        raise NewNotFoundException
    # New found
    await NewsRepository.delete(id=new_id)
    return SNewDeleteResponse(
        status="ok",
        message="New is successfully deleted from db!"
    )


@router.get("/all")
async def get_all_news(
    current_user: CurrentUser
) -> SNewsResponse:
    # Getting response from db
    all_news_orm: list[NewsORM] = await NewsRepository.find_all_joined_user()
    # Converting ORM to Pydantic schema
    all_news_schema: list[SNew] = [SNew.model_validate(new_orm) for new_orm in all_news_orm]
    return SNewsResponse(
        status="ok",
        message="Successful request!",
        data=all_news_schema
    )

from datetime import timedelta
from fastapi import APIRouter

from main_source.screenings.schemas import *

from main_source.objects.models import ObjectsORM
from main_source.screenings.models import ScreeningsORM

from main_source.screenings.repository import ScreeningsRepository
from main_source.objects.repository import ObjectsRepository

from main_source.exceptions import ScreeningNotFoundException, ObjectNotFoundException

from main_source.users.deps import CurrentUser


router = APIRouter(prefix='/screenings', tags=['Screenings'])


@router.post("/add")
async def add_screening(
        screening_data: SAddScreening,
        current_user: CurrentUser
) -> SAddScreeningResponse:
    current_object: ObjectsORM = await ObjectsRepository.find_one_or_none_by_id(object_id=screening_data.object_id)
    if current_object is None:
        raise ObjectNotFoundException
    screening_data.user_id = current_user.id
    screening_data.date_time += timedelta(hours=3)
    # Adding data to database
    new_screening_orm: ScreeningsORM = await ScreeningsRepository.add(screening_data.dict())
    return SAddScreeningResponse(
        status="ok",
        message="Screening successfully added to db!"
    )


@router.put("/edit/{scr_id}")
async def edit_screening(
        scr_id: int,
        scr_data: SEditScreening,
        current_user: CurrentUser
) -> SEditScreeningResponse:
    # Find screening with such id
    result = await ScreeningsRepository.find_one_or_none(id=scr_id)
    # Screening not found
    if not result:
        raise ScreeningNotFoundException
    # Screening found
    await ScreeningsRepository.update_date(
        scr_id=scr_id,
        date_time=(scr_data.date_time + timedelta(hours=3))
    )
    return SEditScreeningResponse(
        status="ok",
        message="Screening information successfully edited!"
    )


@router.delete("/delete/{scr_id}")
async def delete_screening(
        scr_id: int,
        current_user: CurrentUser
) -> SDeleteScreeningResponse:
    # Find screening with such id
    result = await ScreeningsRepository.find_one_or_none(id=scr_id)
    # Screening not found
    if not result:
        raise ScreeningNotFoundException
    # Screening found
    await ScreeningsRepository.delete(id=scr_id)
    return SDeleteScreeningResponse(
        status="ok",
        message="Screening is successfully deleted from db!"
    )


@router.get("/screening/{scr_id}")
async def get_screening_by_id(
        scr_id: int,
        current_user: CurrentUser
) -> SGetScreeningResponse:
    # Find screening with such id
    scr_orm: ScreeningsORM = await ScreeningsRepository.find_one_or_none_by_id(scr_id=scr_id)
    # Screening not found
    if scr_orm is None:
        raise ScreeningNotFoundException
    # Screening found
    return SGetScreeningResponse(
        status="ok",
        message="Screening successfully found!",
        data=SScreening.model_validate(scr_orm)
    )


@router.get("/all")
async def get_all_screenings(
        current_user: CurrentUser
) -> SGetAllScreeningsResponse:
    screenings_orm: list[ScreeningsORM] = await ScreeningsRepository.find_all()
    return SGetAllScreeningsResponse(
        status="ok",
        message="Screenings successfully found!",
        data=[SScreening.model_validate(scr) for scr in screenings_orm]
    )


@router.get("/all/today")
async def get_all_screenings_today() -> SGetAllScreeningsResponse:
    screenings_orm: list[ScreeningsORM] = await ScreeningsRepository.find_all_today()
    return SGetAllScreeningsResponse(
        status="ok",
        message="Screenings successfully found!",
        data=[SScreening.model_validate(scr) for scr in screenings_orm]
    )

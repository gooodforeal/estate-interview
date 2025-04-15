from fastapi import APIRouter, Query

from main_source.deals.schemas import *

from main_source.users.models import UsersORM
from main_source.objects.models import ObjectsORM
from main_source.deals.models import DealsORM

from main_source.deals.repository import DealsRepository
from main_source.objects.repository import ObjectsRepository

from main_source.exceptions import ObjectNotFoundException, DealNotFoundException

from main_source.users.deps import CurrentUser, CurrentAdminUser


router = APIRouter(prefix='/deals', tags=['Deals'])


@router.post("/add")
async def add_deal(
        deal_data: SAddDeal,
        current_user: CurrentUser
) -> SAddDealResponse:
    current_object: ObjectsORM = await ObjectsRepository.find_one_or_none_by_id(object_id=deal_data.object_id)
    if current_object is None:
        raise ObjectNotFoundException
    deal_data.user_id = current_user.id
    # Adding data to database
    await DealsRepository.add(deal_data.dict())
    return SAddDealResponse(
        status="ok",
        message="Deal successfully added to db!"
    )


@router.put("/edit/{deal_id}")
async def edit_deal(
        deal_id: int,
        deal_data: SEditDeal,
        current_user: CurrentUser
) -> SEditDealResponse:
    # Deal with such id
    result = await DealsRepository.find_one_or_none(id=deal_id)
    # Deal not found
    if not result:
        raise DealNotFoundException
    # Deal found
    await DealsRepository.update(
        filter_by={"id": deal_id},
        **(deal_data.dict())
    )
    return SEditDealResponse(
        status="ok",
        message="Deal information successfully edited!"
    )


@router.delete("/delete/{deal_id}")
async def delete_deal(
        deal_id: int,
        current_user: CurrentUser
) -> SDeleteDealResponse:
    # Find deal with such id
    result = await DealsRepository.find_one_or_none(id=deal_id)
    # Deal not found
    if not result:
        raise DealNotFoundException
    # Deal found
    await DealsRepository.delete(id=deal_id)
    return SDeleteDealResponse(
        status="ok",
        message="Deal is successfully deleted from db!"
    )


@router.get("/deal/{deal_id}")
async def get_deal_by_id(
        deal_id: int,
        current_user: CurrentUser
) -> SGetDealResponse:
    # Find deal with such id
    deal_orm: DealsORM = await DealsRepository.find_one_or_none_by_id(deal_id=deal_id)
    # Deal not found
    if deal_orm is None:
        raise DealNotFoundException
    # Deal found
    return SGetDealResponse(
        status="ok",
        message="Deal successfully found!",
        data=SDeal.model_validate(deal_orm)
    )


@router.get("/all")
async def get_all_deals(
        current_user: CurrentUser
) -> SGetAllDealsResponse:
    deals_orm: list[DealsORM] = await DealsRepository.find_all()
    return SGetAllDealsResponse(
        status="ok",
        message="Deals successfully found!",
        data=[SDeal.model_validate(deal) for deal in deals_orm]
    )



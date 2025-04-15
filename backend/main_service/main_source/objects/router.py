import datetime
from io import BytesIO

from fastapi import APIRouter, Depends, File, UploadFile
from starlette.responses import StreamingResponse

from main_source.objects.schemas import SAddObjectM, SAddObjectMResponse
from main_source.objects.schemas import SAddObject, SAddObjectResponse
from main_source.objects.schemas import SEditObject, SEditObjectResponse
from main_source.objects.schemas import SGetObjectResponse
from main_source.objects.schemas import SGetAllObjectsResponse
from main_source.objects.schemas import SDeleteObjectResponse
from main_source.objects.schemas import SSetPhotoResponse
from main_source.objects.schemas import SObject
from main_source.objects.schemas import SPres

from main_source.users.models import UsersORM
from main_source.objects.models import ObjectsORM

from main_source.objects.repository import ObjectsRepository

from main_source.exceptions import ObjectNotFoundException

from main_source.config import settings
from main_source.users.deps import get_current_user, get_current_admin_user
from main_source.s3client import get_s3_client, S3Client
from main_source.objects.presgenerator import get_presgenerator, PresGenerator


router = APIRouter(prefix='/objects', tags=['Objects'])


# Adding object information manually
@router.post("/add-manually")
async def add_object_manually(
        object_data: SAddObjectM,
        user_data: UsersORM = Depends(get_current_user)
) -> SAddObjectMResponse:
    # Converting pydentic schema to dict
    object_data_dict: dict = object_data.dict()
    # Filling fields
    object_data_dict["user_id"] = user_data.id
    object_data_dict["user"] = user_data
    # Adding data to database
    new_object_orm: ObjectsORM = await ObjectsRepository.add_new_manually(data=object_data_dict)
    return SAddObjectMResponse(
        status="ok",
        message="Object successfully added to db!"
    )


# Adding object information from cian by link
@router.post("/add-cian")
async def add_object_from_cian(
        object_data: SAddObject,
        user_data: UsersORM = Depends(get_current_user)
) -> SAddObjectResponse:
    ...


@router.put("/edit/{object_id}")
async def edit_object(
        object_id: int,
        object_data: SEditObject,
        user_data: UsersORM = Depends(get_current_user)
) -> SEditObjectResponse:
    # Find object with such id
    result = await ObjectsRepository.find_one_or_none(id=object_id)
    # Object not found
    if not result:
        raise ObjectNotFoundException
    # Object found
    await ObjectsRepository.update(
        filter_by={"id": object_id},
        **(object_data.dict(exclude_none=True))
    )
    return SEditObjectResponse(
        status="ok",
        message="Object information successfully edited!"
    )


@router.delete("/delete/{object_id}")
async def delete_object(
        object_id: int,
        user_data: UsersORM = Depends(get_current_user)
) -> SDeleteObjectResponse:
    # Find object with such id
    result = await ObjectsRepository.find_one_or_none(id=object_id)
    # Object not found
    if not result:
        raise ObjectNotFoundException
    # Object found
    await ObjectsRepository.delete(id=object_id)
    return SDeleteObjectResponse(
        status="ok",
        message="Object is successfully deleted from db!"
    )


@router.get("/object/{object_id}")
async def get_object_by_id(
        object_id: int
) -> SGetObjectResponse:
    # Find object with such id
    object_orm: ObjectsORM = await ObjectsRepository.find_one_or_none_by_id(object_id=object_id)
    # Object not found
    if object_orm is None:
        raise ObjectNotFoundException
    # Object found
    return SGetObjectResponse(
        status="ok",
        message="Object successfully found!",
        data=SObject.model_validate(object_orm)
    )


@router.get("/all")
async def get_all_objects() -> SGetAllObjectsResponse:
    # Find objects
    objects_orm: list[ObjectsORM] = await ObjectsRepository.find_all()
    return SGetAllObjectsResponse(
        status="ok",
        message="Objects successfully found!",
        data=[SObject.model_validate(obj) for obj in objects_orm]
    )


@router.post("/upload-photo/{object_id}")
async def upload_photo(
        object_id: int,
        file: UploadFile = File(...),
        s3_client: S3Client = Depends(get_s3_client),
        user_data: UsersORM = Depends(get_current_user)
) -> SSetPhotoResponse:
    # Creating file name
    file_name: str = f"object_{object_id}_{datetime.datetime.now()}.jpg"
    # Uploading file to S3 storage
    await s3_client.upload_file(
        file=file.file.read(),
        object_name=file_name
    )
    # Saving file link in db
    await ObjectsRepository.update(
        filter_by={"id": object_id},
        photo_link=f"{settings.S3_DOM}/{file_name}"
    )
    return SSetPhotoResponse(
        status="ok",
        message="Successful request!",
        data=str(file.file.read())
    )


@router.post("/presentation")
async def download_photo(
        pres_data: SPres,
        pres_generator: PresGenerator = Depends(get_presgenerator),
        user_data: UsersORM = Depends(get_current_user)
) -> StreamingResponse:
    object1: ObjectsORM = await ObjectsRepository.find_one_or_none_by_id(object_id=pres_data.object1_id)
    object2: ObjectsORM = await ObjectsRepository.find_one_or_none_by_id(object_id=pres_data.object2_id)
    if object1 is None or object2 is None:
        raise ObjectNotFoundException
    img_data: bytes = pres_generator.create_comparison_image(
        obj1=SObject.model_validate(object1).dict(),
        obj2=SObject.model_validate(object2).dict()
    )
    return StreamingResponse(
        BytesIO(img_data),
        media_type="image/jpeg",
        headers={"Content-Disposition": "attachment; filename=comparison.jpg"}
    )

import { useState, useEffect } from "react";
import { Descriptions, Button, message, Upload, Spin } from "antd";
import { UploadOutlined, ArrowLeftOutlined} from "@ant-design/icons";
import axios from "axios";
import { useNavigate, useParams } from 'react-router-dom';
import ObjectsService from "../services/objects.service";



axios.defaults.withCredentials = true;


const Object = () => {
    const { objectId } = useParams();
    const [currentObject, setCurrentObject] = useState(null);
    const [items, setItems] = useState([]);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        async function fetchObject() {
        try {
            const response = await ObjectsService.getObject(objectId);
            if (response && response.data) {
            setCurrentObject(response.data);
            setItems([
                {
                    key: "1",
                    label: "Заголовок",
                    children: response.data.title || "Не указано",
                    span: 3,
                  },
                  {
                    key: "2",
                    label: "Описание",
                    children: response.data.description || "Не указано",
                    span: 3,
                  },
                  {
                    key: "3",
                    label: "Адрес",
                    children: response.data.address || "Не указано",
                  },
                  {
                    key: "4",
                    label: "Метро",
                    children: response.data.metro || "Не указано",
                  },
                  {
                    key: "5",
                    label: "Этаж",
                    children: response.data.floor || "Не указано",
                  },
                  {
                    key: "6",
                    label: "Площадь",
                    children: response.data.total_square + "м2" || "Не указано",
                  },
                  {
                    key: "7",
                    label: "Ремонт",
                    children: response.data.remont_type || "Не указано",
                  },
                  {
                    key: "8",
                    label: "Собственник",
                    children: response.data.author || "Не указано",
                  },
                  {
                    key: "9",
                    label: "Цена",
                    children: response.data.price + "₽" || "Не указано",
                  },
                  {
                    key: "10",
                    label: "Ссылка на Циан",
                    children: response.data.cian_link || "Не указано",
                  },
              ]);
            }
        } catch (error) {
            console.error("Ошибка получения данных объекта:", error);
            message.error("Ошибка получения данных объекта");
        }
        }
        fetchObject();
    }, []);

    const handleUpload = async ({ file }) => {
        const formData = new FormData();
        formData.append("file", file);
        try {
        setUploading(true);
        const response = await axios.post(
            "http://localhost:3000/api/objects/upload-photo/" + currentObject.id,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        message.success(response.data.message);
        } catch (error) {
        console.error("Ошибка загрузки:", error);
        message.error("Ошибка загрузки.");
        } finally {
        setUploading(false);
        }
    };

    return (
      <>
        <h3 className="tw-mb-4">Объект</h3>
        <div className="tw-bg-white tw-p-[25px] tw-rounded-[25px] tw-shadow-sm">
        {(currentObject) ? (
            <>
              <Button
                type="primary"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
              >
                Назад
              </Button>
              <div className="tw-mx-auto tw-py-[25px]">
                  <img
                  src={
                      currentObject.photo_link
                      ? currentObject.photo_link
                      : "https://cdn4.iconfinder.com/data/icons/church-4/500/vab48_4_grey_church_house_isometric_cartoon_family_wedding-512.png"
                  }
                  className="tw-w-[50%] tw-mx-auto tw-rounded-[25px]"
                  alt="Фото"
                  />
            </div>
            <div className="tw-py-[25px]">
                <Upload
                customRequest={handleUpload}
                showUploadList={false}
                accept=".jpg,.jpeg,.png"
                beforeUpload={(file) => {
                    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                    if (!isJpgOrPng) {
                    message.error('Можно загружать только JPG или PNG файлы!');
                    }
                    return isJpgOrPng || Upload.LIST_IGNORE;
                }}
                >
                <Button icon={<UploadOutlined />} loading={uploading}>
                    {uploading ? "Загрузка..." : "Загрузить фото"}
                </Button>
                </Upload>
            </div>
            <div className="tw-mx-auto">
                <Descriptions title="Описание" items={items} column={3} />
            </div>
            </>
        ) : (
            <Spin />
        )}
        </div>
      </>
    );
};

export default Object;

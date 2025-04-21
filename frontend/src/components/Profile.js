import { useState, useEffect } from "react";
import { Descriptions, Button, message, Upload, Spin } from "antd";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import AuthService from "../services/auth.service";
import axios from "axios";
import { useNavigate } from 'react-router-dom';


axios.defaults.withCredentials = true;


const Profile = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState(null);
  const [itemsStats, setItemsStats] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await AuthService.getMe();
        if (response && response.data) {
          setCurrentUser(response.data);
          setItems([
            {
              key: "1",
              label: "ФИО",
              children: response.data.fio || "Не указано",
            },
            {
              key: "2",
              label: "Почта",
              children: response.data.email || "Не указано",
            },
            {
              key: "3",
              label: "Роль",
              children: response.data.is_admin ? "Администратор" : "Пользователь",
            },
            {
              key: "4",
              label: "Дата регистрации",
              children: response.data.created_at
                ? response.data.created_at.split("T")[0]
                : "Неизвестно",
            },
          ]);
        }
      } catch (error) {
        console.error("Ошибка получения данных пользователя:", error);
        message.error("Ошибка получения данных пользователя");
      }
    }

    async function fetchStats() {
      try {
        const response = await AuthService.getCurrentUserStats();
        if (response && response.data) {
          setItemsStats([
            {
              key: "1",
              label: "🏠 Объекты",
              children: response.data.objects_count || "-",
            },
            {
              key: "2",
              label: "🤝 Сделки",
              children: response.data.deals_count || "-",
            },
            {
              key: "3",
              label: "🔍 Показы",
              children: response.data.screenings_count || "-",
            },
          ]);
          console.log(itemsStats);
        }
      } catch (error) {
        console.error("Ошибка получения данных пользователя:", error);
        message.error("Ошибка получения данных пользователя");
      }
    }
    fetchUser();
    fetchStats(); 
  }, []);

  const handleUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      setUploading(true);
      const response = await axios.post(
        "http://localhost:3000/api/users/upload-avatar",
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
      <h3 className="tw-mb-4">Профиль</h3>
      <div className="tw-bg-white tw-p-[25px] tw-rounded-[25px] tw-shadow-sm">
        {(currentUser || itemsStats) ? (
          <>
            <div className="tw-mx-auto tw-py-[25px] tw-relative">
              <img
                src={
                  currentUser.avatar_link
                    ? currentUser.avatar_link
                    : "https://avatars.mds.yandex.net/i?id=bc4adc841ef91c461ffc20c7f66d4d2e_l-5524434-images-thumbs&n=13"
                }
                className="tw-w-[200px] tw-h-[200px] tw-mx-auto tw-rounded-[50%]"
                alt="Аватар"
              />
              <div className="tw-absolute tw-top-0 tw-left-0 tw-right-0 tw-bottom-0 tw-flex tw-justify-center tw-items-center tw-opacity-0 hover:tw-opacity-100 tw-transition-opacity">
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
                  <Button icon={<UploadOutlined />} loading={uploading} type="primary">
                    {uploading ? "Загрузка..." : "Загрузить фото"}
                  </Button>
                </Upload>
              </div>
            </div>
            <div className="tw-text-center">
              {currentUser.fio}
            </div>
            <div className="tw-pt-[25px]">
              <Descriptions title="Профиль" items={items} />
            </div>
            <div className="tw-pt-[10px]">
              <Descriptions title="Статистика" items={itemsStats} className="tw-mt-4" />
            </div>
          </>
        ) : (
          <Spin />
        )}
      </div>
    </>
  );
};

export default Profile;

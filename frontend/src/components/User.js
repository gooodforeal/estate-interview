import { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { Descriptions, message, Spin, Button } from "antd";
import { ArrowLeftOutlined} from "@ant-design/icons";
import AuthService from "../services/auth.service";
import axios from "axios";


axios.defaults.withCredentials = true;

const User = () => {
    const { userId } = useParams();
    const [currentUser, setCurrentUser] = useState(null);
    const [items, setItems] = useState(null);
    const [itemsStats, setItemsStats] = useState(null);
    const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await AuthService.getUser(userId);
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
        const response = await AuthService.getUser(userId);
        if (response && response.data) {
            setCurrentUser(response.data)
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
        }
      } catch (error) {
        console.error("Ошибка получения данных пользователя:", error);
        message.error("Ошибка получения данных пользователя");
      }
    }
    fetchUser();
    fetchStats(); 
  }, [userId]);

  return (
    <>
      <h3 className="tw-mb-4">Пользователь</h3>
      <div className="tw-bg-white tw-p-[25px] tw-rounded-[25px] tw-shadow-sm">
        {(currentUser) ? (
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
                  currentUser.avatar_link
                    ? currentUser.avatar_link
                    : "https://avatars.mds.yandex.net/i?id=bc4adc841ef91c461ffc20c7f66d4d2e_l-5524434-images-thumbs&n=13"
                }
                className="tw-w-[200px] tw-h-[200px] tw-mx-auto tw-rounded-[50%]"
                alt="Аватар"
              />
            </div>
            <div className="tw-text-center">
                {currentUser.fio}
              </div>
            <div className="tw-mx-auto tw-pt-[25px]">
              <Descriptions title="Профиль" items={items} />
            </div>
            <div className="tw-mx-auto tw-pt-[10px]">
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

export default User;

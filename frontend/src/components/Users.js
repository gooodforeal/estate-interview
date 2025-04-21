import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { message, Spin, Table } from "antd";
import AuthService from "../services/auth.service";
import EventBus from "../common/EventBus";
import dayjs from "dayjs";

const Users = () => {
  const user = AuthService.getCurrentUser();
  const navigate = useNavigate();
  const [users, setUsers] = useState(null);

  const columns = [
    {
      key: "1",
      title: "ID",
      dataIndex: "id",
    },
    {
      key: "2",
      title: "Фото",
      dataIndex: "avatar_link",
      render: (url, record) => (
        <Link to={`user/${record.id}`}>
          <img
            src={
              url
                ? url
                : "https://avatars.mds.yandex.net/i?id=bc4adc841ef91c461ffc20c7f66d4d2e_l-5524434-images-thumbs&n=13"
            }
            alt="avatar"
            style={{ width: 50, borderRadius: '50%' }}
          />
        </Link>
      ),
    },
    {
      key: "3",
      title: "ФИО",
      dataIndex: "fio",
      sorter: (a, b) => a.fio.localeCompare(b.fio),
    },
    {
      key: "4",
      title: "Email",
      dataIndex: "email",
    },
    {
      key: "5",
      title: "Дата регистрации",
      dataIndex: "created_at",
      responsive: ["md"],
      render: (text) => dayjs(text).format("DD.MM.YYYY"),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
  ];

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await AuthService.getAllUsers();
        if (response && response.data) {
          setUsers(response.data);
        }
      } catch (error) {
        console.error("Ошибка получения данных пользователя:", error);
        message.error("Ошибка получения данных пользователя");
        if (error.response && error.response.status === 401) {
          EventBus.dispatch("logout");
        }
      }
    }

    if (user) {
      fetchUsers();
    } else {
      navigate("/login");
    }
  }, []);

  const getTopUsers = () => {
    if (!users) return [];

    return [...users]
      .sort((a, b) => {
        const scoreA = (a.deals_count || 0) + (a.objects_count || 0) + (a.screenings_count || 0);
        const scoreB = (b.deals_count || 0) + (b.objects_count || 0) + (b.screenings_count || 0);
        return scoreB - scoreA;
      })
      .slice(0, 3);
  };

  const podium = getTopUsers();

  return (
    users ?
    <div className="App">
      <header className="App-header">
        <h3 className="tw-mb-6 tw-text-center">👑 Лидеры</h3>
        {podium.length > 0 && (
          <div className="tw-flex tw-justify-center tw-items-end tw-mb-8 tw-gap-6">
            {podium.map((user, index) => {
              const total =
                (user.deals_count || 0) +
                (user.objects_count || 0) +
                (user.screenings_count || 0);

              const heights = [190, 180, 170];
              const colors = ["gold", "silver", "#CD7F32"];
              const color = colors[index];
              const height = heights[index] || 120;
              return (
                <div
                  key={user.id}
                  className="tw-flex tw-flex-col tw-items-center tw-bg-gray-100 tw-rounded-xl tw-shadow-md tw-overflow-hidden"
                  style={{ height: `${height}px`, width: '140px', padding: '12px', background: `${color}` }}
                >
                  <Link to={`user/${user.id}`}>
                    <img
                      src={
                        user.avatar_link ||
                        "https://avatars.mds.yandex.net/i?id=bc4adc841ef91c461ffc20c7f66d4d2e_l-5524434-images-thumbs&n=13"
                      }
                      alt="avatar"
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        marginBottom: '6px',
                        objectFit: 'cover',
                      }}
                    />
                  </Link>
                  <strong className="tw-text-sm">{index + 1} место</strong>
                  <span
                    className="tw-text-xs tw-text-center tw-leading-tight"
                    style={{
                      maxWidth: '120px',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                      marginBottom: '2px',
                    }}
                  >
                    {user.fio}
                  </span>
                  <span className="tw-text-xs tw-my-2">Рейтинг: {total}</span>
                </div>
              );
            })}
          </div>
        )}
        <h3 className="tw-mb-6"><span>Пользователи {" "} ({users.length})</span></h3>
        {users ? (
          <Table
            className="tw-rounded-xl tw-shadow-md tw-bg-white"
            columns={columns}
            dataSource={users}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        ) : (
          <Spin />
        )}
      </header>
    </div>
    : <Spin/>
  );
};

export default Users;

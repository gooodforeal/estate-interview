import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Spin,
  Popconfirm,
  message,
  Avatar,
  Pagination
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, FullscreenOutlined } from "@ant-design/icons";
import DealsService from "../services/deals.service";
import ObjectsService from "../services/objects.service";
import AuthService from "../services/auth.service";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import EventBus from "../common/EventBus";


const { Option } = Select;


const Deals = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
        fetchDeals();
        fetchObjects();
    }
    else {
      navigate("/login");
    }
  }, []);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const response = await DealsService.getAllDeals();
      setDeals(response.data);
    } catch (error) {
      console.error("Ошибка загрузки сделок:", error);
      if (error.response && error.response.status === 401) {
        EventBus.dispatch("logout");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchObjects = async () => {
    try {
      const response = await ObjectsService.getAllObjects();
      setObjects(response.data);
    } catch (error) {
      console.error("Ошибка загрузки объектов:", error);
      if (error.response && error.response.status === 401) {
        EventBus.dispatch("logout");
      }
    }
  };

  const handleAddSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        price: values.price,
        status: values.status,
        object_id: values.object_id,
      };
      await DealsService.addDeal(payload);
      message.success("Сделка добавлена");
      setModalVisible(false);
      form.resetFields();
      fetchDeals();
    } catch (error) {
      console.error("Ошибка при добавлении сделки:", error);
      message.error("Ошибка при добавлении сделки");
    }
  };

  const handleEdit = (deal) => {
    setSelectedDeal(deal);
    editForm.setFieldsValue({
      price: deal.price,
      status: deal.status,
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      await DealsService.editDeal(selectedDeal.id, values);
      message.success("Сделка обновлена");
      setEditModalVisible(false);
      fetchDeals();
    } catch (error) {
      console.error("Ошибка при обновлении сделки:", error);
      message.error("Ошибка при обновлении сделки");
    }
  };

  const handleDelete = async (id) => {
    try {
      await DealsService.deleteDeal(id);
      message.success("Сделка удалена");
      fetchDeals();
    } catch (error) {
      console.error("Ошибка удаления сделки:", error);
      message.error("Не удалось удалить сделку");
    }
  };

  const currentMonthSum = deals
    .filter(deal => {
      const isPassed = deal.status === "Пройден";
      const isThisMonth =
        new Date(deal.updated_at).getMonth() === new Date().getMonth() &&
        new Date(deal.updated_at).getFullYear() === new Date().getFullYear();
      return isPassed && isThisMonth;
    })
    .reduce((acc, deal) => acc + Number(deal.price), 0);

  const paginatedDeals = deals.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) return <Spin />;

  return (
    <div className="tw-flex tw-flex-col tw-gap-4">
      <h3>Результат</h3>
      <div className="tw-bg-white tw-rounded-xl tw-shadow-md tw-p-4 tw-mb-2">
        <p className="tw-text-base tw-font-semibold">
          💰 Сумма за текущий месяц:{" "}
          <span className="tw-text-green-600">{currentMonthSum.toLocaleString("ru-RU")}₽</span>
        </p>
        <p className="tw-text-base tw-font-semibold">
          📈 Процент агентства:{" "}
          <span className="tw-text-green-600">{(currentMonthSum * 0.03).toLocaleString("ru-RU")}₽</span>
        </p>
      </div>
      <h3><span>Все сделки{" "}({deals.length})</span></h3>
      <div className="tw-flex tw-justify-between">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          Добавить сделку
        </Button>
      </div>

      {paginatedDeals.map((deal) => (
        <Card
          className="tw-rounded-xl tw-shadow-md"
          key={deal.id}
          title={`Сделка: ${deal.object?.title}`}
          actions={[
            <Link to={`/objects/object/${deal.object?.id}`}>
              <FullscreenOutlined key="open" /> Посмотреть объект
            </Link>,
            <EditOutlined key="edit" onClick={() => handleEdit(deal)} />,
            <Popconfirm
              title="Удалить сделку?"
              onConfirm={() => handleDelete(deal.id)}
              okText="Да"
              cancelText="Нет"
            >
              <DeleteOutlined />
            </Popconfirm>,
          ]}
        >
          <p>Цена: {deal.price}₽</p>
          {deal.status === "Пройден" ? (
            <p className="tw-text-sm tw-text-green-600">
              ✅ {deal.status} ({new Date(deal.updated_at).toLocaleString("ru-RU")})
            </p>
          ) : (
            <p className="tw-text-yellow-500 tw-text-sm">🕓 {deal.status}</p>
          )}
          <div className="tw-flex tw-justify-end tw-items-center tw-gap-2">
            <Avatar
              src={deal.user?.avatar_link || 'https://avatars.mds.yandex.net/i?id=bc4adc841ef91c461ffc20c7f66d4d2e_l-5524434-images-thumbs&n=13'}
              size={32}
            />
            <Link to={`/users/user/${deal.user?.id}`}>
              <span>{deal.user?.fio}</span>
            </Link>
          </div>
        </Card>
      ))}

      <div className="tw-flex tw-justify-center tw-mt-4">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={deals.length}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>

      <Modal
        title="Добавить сделку"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleAddSubmit}
        okText="Добавить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="object_id" label="Объект" rules={[{ required: true }]}>
            <Select placeholder="Выберите объект">
              {objects.map(obj => <Option key={obj.id} value={obj.id}>{obj.title}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="Статус" rules={[{ required: true }]}>
            <Select>
              <Option value="Пройден">Пройден</Option>
              <Option value="В процессе">В процессе</Option>
            </Select>
          </Form.Item>
          <Form.Item name="price" label="Цена" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Редактировать сделку"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditSubmit}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="status" label="Статус" rules={[{ required: true }]}>
            <Select>
              <Option value="Пройден">Пройден</Option>
              <Option value="В процессе">В процессе</Option>
            </Select>
          </Form.Item>
          <Form.Item name="price" label="Цена" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Deals;

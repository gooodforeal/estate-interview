import React, { useState, useEffect } from 'react';
import {
  EditOutlined,
  DeleteOutlined,
  FullscreenOutlined,
  LinkOutlined,
  PlusOutlined
} from '@ant-design/icons';
import {
  Avatar,
  Card,
  Spin,
  message,
  Modal,
  Input,
  Pagination,
  Button,
  Form,
  Row,
  Col,
  Select,
  AutoComplete
} from 'antd';
import ObjectsService from "../services/objects.service";
import AuthService from "../services/auth.service";
import { Link } from 'react-router-dom';
import axios from 'axios';
import dayjs from "dayjs";
import EventBus from "../common/EventBus";
import { useNavigate } from 'react-router-dom';


axios.defaults.withCredentials = true;
const { Option } = Select;
const DADATA_TOKEN = "5d821cbf037e717a89103108de89195b867b0508"

const Objects = () => {
  const navigate = useNavigate();
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareForm] = Form.useForm();

  const [compareIds, setCompareIds] = useState({ object1: null, object2: null });
  const user = AuthService.getCurrentUser();
  const [loading, setLoading] = useState(true);
  const [objects, setObjects] = useState([]);
  const [userRole, setUserRole] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [currentObject, setCurrentObject] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");  // Новое состояние для сортировки

  const [formAdd] = Form.useForm();
  const [formEdit] = Form.useForm();

  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [metroSuggestions, setMetroSuggestions] = useState([]);

  useEffect(() => {
    async function fetchObjects() {
      try {
        const response = await ObjectsService.getAllObjects();
        if (response && response.data) {
          setObjects(response.data);
        }
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        if (error.response && error.response.status === 401) {
          EventBus.dispatch("logout");
        }
      } finally {
        setLoading(false);
      }
    }

    const user = AuthService.getCurrentUser();
    if (user) {
      setUserRole(user.is_admin);
      fetchObjects();
    }
    else {
      navigate("/login");
    }
    
  }, []);

  const showDeleteConfirm = (objectId) => {
    Modal.confirm({
      title: 'Вы уверены, что хотите удалить этот объект?',
      content: 'После удаления эта информация будет потеряна навсегда.',
      okText: 'Да',
      cancelText: 'Отмена',
      onOk: () => handleDelete(objectId),
    });
  };

  const handleDelete = async (objectId) => {
    try {
      await ObjectsService.deleteObject(objectId);
      setObjects(objects.filter(object => object.id !== objectId));
      message.success('Объект удален');
    } catch (error) {
      console.error("Ошибка при удалении объекта:", error);
      message.error('Ошибка при удалении объекта');
    }
  };

  const openCian = (link) => {
    window.open(link, '_blank');
  };

  const handleEdit = (object) => {
    setCurrentObject(object);
    formEdit.setFieldsValue(object);
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await formEdit.validateFields();
      await ObjectsService.editObject(currentObject.id, values);
      const response = await ObjectsService.getAllObjects();
      setObjects(response.data);
      setEditModalVisible(false);
      message.success('Объект обновлен');
    } catch (error) {
      console.error("Ошибка при обновлении объекта:", error);
      message.error('Ошибка при обновлении объекта');
    }
  };

  const handleAddSubmit = async () => {
    try {
      const values = await formAdd.validateFields();
      await ObjectsService.addObject(values);
      const response = await ObjectsService.getAllObjects();
      setObjects(response.data);
      setAddModalVisible(false);
      formAdd.resetFields();
      message.success('Объект успешно добавлен');
    } catch (error) {
      console.error("Ошибка при добавлении объекта:", error);
      message.error('Ошибка при добавлении объекта');
    }
  };

  const fetchSuggestions = async (query, type) => {
    const url = `https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/${type}`;
    try {
      const response = await axios.post(url,
        { query },
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Token ${DADATA_TOKEN}`
          },
          withCredentials: false
        }
      );
      console.log(response.data.suggestions);
      return response.data.suggestions;
    } catch (error) {
      console.error("Ошибка Dadata:", error);
      return [];
    }
  };

  const handleAddressSearch = async (value) => {
    if (!value) return;
    const suggestions = await fetchSuggestions(value, 'address');
    setAddressSuggestions(suggestions.map(item => item.value));
  };

  const handleMetroSearch = async (value) => {
    if (!value) return;
    const suggestions = await fetchSuggestions(value, 'metro');
    setMetroSuggestions(suggestions.map(item => item.value));
  };

  const handleSortChange = (value) => {
    setSortOrder(value);
  };

  const sortedObjects = objects.sort((a, b) => {
    const dateA = dayjs(a.created_at);
    const dateB = dayjs(b.created_at);

    if (sortOrder === "asc") {
      return dateA.isBefore(dateB) ? -1 : 1;
    } else {
      return dateA.isAfter(dateB) ? -1 : 1;
    }
  });


  const handleCompare = async (id1, id2) => {
    try {
      setCompareLoading(true);
  
      const response = await axios.post(
        "/api/objects/presentation",
        { object1_id: id1, object2_id: id2 },
        { responseType: 'blob' }
      );
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "comparison.jpg");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
  
      message.success("Изображение успешно скачано");
      setCompareModalVisible(false); // Закрываем после загрузки
    } catch (error) {
      console.error("Ошибка при сравнении:", error);
      message.error("Не удалось скачать изображение");
    } finally {
      setCompareLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="tw-flex tw-justify-center tw-mt-[100px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
    {user ?
     <div className="tw-flex tw-flex-col tw-gap-5">
        <h3><span>Все объекты {" "} ({objects.length})</span></h3>
          <div className="tw-flex tw-justify-between tw-gap-2">
            <div className="tw-flex tw-gap-2">
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalVisible(true)}>
                Добавить вручную
              </Button>
              <Button onClick={() => setCompareModalVisible(true)}>
                Сравнить
              </Button>
            </div>
            <Select
              defaultValue="desc"
              onChange={handleSortChange}
              style={{ width: 200 }}
            >
              <Option value="asc">↑ По дате добавления</Option>
              <Option value="desc">↓ По дате добавления</Option>
            </Select>
        </div>
        {sortedObjects.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((object, index) => (
          <Card
            className="tw-rounded-xl tw-shadow-md"
            key={index}
            actions={[
              <Link to={"object/" + object.id}><FullscreenOutlined key="open" /></Link>,
              object.cian_link && (
                <LinkOutlined key="openCian" onClick={() => openCian(object.cian_link)} />
              ),
              <EditOutlined key="edit" onClick={() => handleEdit(object)} />,
              userRole && (
                <DeleteOutlined key="delete" onClick={() => showDeleteConfirm(object.id)} />
              ),
            ]}
            style={{ width: '100%' }}
          >
            <Card.Meta
              avatar={
                <Avatar
                  src={
                    object.photo_link
                      ? object.photo_link
                      : "https://cdn4.iconfinder.com/data/icons/church-4/500/vab48_4_grey_church_house_isometric_cartoon_family_wedding-512.png"
                  }
                  size={100}
                  shape="square"
                />
              }
              title={
                <div className="tw-border-b tw-border-gray-200 tw-pb-2 tw-mb-2">
                  {object.title}
                </div>
              }
              description={
                <>
                  <p>{object.description}</p>
                  <p><b>Собственник: </b>{object.author}</p>
                  <p><b>Адрес: </b>{object.address}</p>
                  <p><b>Цена: </b>{object.price}₽</p>
                  <p><b>Дата добавления: </b>{dayjs(object.created_at).format("DD.MM.YYYY")}</p>
                  <div className="tw-flex tw-justify-end tw-items-center tw-gap-2">
                    <Avatar src={object.user?.avatar_link || "https://avatars.mds.yandex.net/i?id=bc4adc841ef91c461ffc20c7f66d4d2e_l-5524434-images-thumbs&n=13"} size={32} />
                    <Link to={`../users/user/${object.user?.id}`}>
                      <span>{object.user?.fio}</span>
                    </Link>
                  </div>
                </>
              }
            />
          </Card>
        ))}
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={objects.length}
          onChange={(page) => setCurrentPage(page)}
          className="tw-self-center tw-mt-1"
        />
        <Modal
          title="Редактировать объект"
          open={editModalVisible}
          onOk={handleEditSubmit}
          onCancel={() => setEditModalVisible(false)}
          okText="Сохранить"
          cancelText="Отмена"
        >
          <Form form={formEdit} layout="vertical">
            <Form.Item name="title" label="Название" rules={[{ required: true, message: 'Введите название' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Описание">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item name="author" label="Автор">
              <Input />
            </Form.Item>
            <Form.Item name="price" label="Цена">
              <Input type="number" />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="Добавить объект"
          open={addModalVisible}
          onOk={handleAddSubmit}
          onCancel={() => setAddModalVisible(false)}
          okText="Добавить"
          cancelText="Отмена"
        >
          <Form form={formAdd} layout="vertical">
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item name="title" label="Название" rules={[{ required: true, message: 'Введите название' }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="author" label="Автор">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="description" label="Описание">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item name="price" label="Цена (Рубль)">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="total_square" label="Площадь (м2)">
                  <Input type="number" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item name="floor" label="Этаж">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="remont_type" label="Тип ремонта">
                  <Select placeholder="Выберите тип ремонта">
                    <Option value="От застройщика">От застройщика</Option>
                    <Option value="Кастом">Кастом</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="metro" label="Метро">
              <AutoComplete
                options={metroSuggestions.map(value => ({ value }))}
                onSearch={handleMetroSearch}
                placeholder="Введите станцию метро"
              />
            </Form.Item>
            <Form.Item name="address" label="Адрес">
              <AutoComplete
                options={addressSuggestions.map(value => ({ value }))}
                onSearch={handleAddressSearch}
                placeholder="Введите адрес"
              />
            </Form.Item>
            <Form.Item name="cian_link" label="Ссылка на Циан">
              <Input />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="Сравнить объекты"
          open={compareModalVisible}
          onCancel={() => setCompareModalVisible(false)}
          onOk={() => {
            compareForm
              .validateFields()
              .then(({ object1_id, object2_id }) => handleCompare(object1_id, object2_id));
          }}
          confirmLoading={compareLoading}
          okText="Сравнить"
          cancelText="Отмена"
        >
          <Form form={compareForm}>
            <Form.Item
              name="object1_id"
              label="Объект 1"
              rules={[{ required: true, message: 'Выберите первый объект' }]}
            >
              <Select
                placeholder="Выберите первый объект"
                showSearch
                optionFilterProp="children"
                disabled={compareLoading}
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {objects.map(obj => (
                  <Option key={obj.id} value={obj.id}>{obj.title}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="object2_id"
              label="Объект 2"
              rules={[{ required: true, message: 'Выберите второй объект' }]}
            >
              <Select
                placeholder="Выберите второй объект"
                showSearch
                optionFilterProp="children"
                disabled={compareLoading}
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {objects.map(obj => (
                  <Option key={obj.id} value={obj.id}>{obj.title}</Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
      : 
      <Spin/>
      }
    </>
  );
};

export default Objects;

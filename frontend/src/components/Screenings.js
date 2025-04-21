import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Spin,
  message,
  Pagination,
  Avatar,
  Select,
  Button,
  Modal,
  Form,
  DatePicker,
  Popconfirm,
  Carousel,
  Calendar,
} from 'antd';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { FullscreenOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import ScreeningsService from '../services/screenings.service';
import ObjectsService from '../services/objects.service';
import AuthService from '../services/auth.service';
import { useNavigate } from 'react-router-dom';
import EventBus from "../common/EventBus";


const { Option } = Select;

const Screenings = () => {
    const navigate = useNavigate();
    const user = AuthService.getCurrentUser();
    const [loading, setLoading] = useState(true);
    const [screenings, setScreenings] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState('desc');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalCellVisible, setModalCellVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false); 
    const [editForm] = Form.useForm(); 
    const [form] = Form.useForm(); 
    const [selectedScreening, setSelectedScreening] = useState(null); 
    const [selectedDate, setSelectedDate] = useState(null);
    const [objects, setObjects] = useState([]); 
    const pageSize = 5;

    useEffect(() => {
        if (user) {
            fetchScreenings();
            fetchObjects();
        }
        else {
            navigate("/login");
        }
    }, []);

    const onChangeToday = currentSlide => {
        console.log(currentSlide);
    };

    const fetchScreenings = async () => {
        setLoading(true);
        try {
            const response = await ScreeningsService.getAllScreenings();
            if (response && response.data) {
                setScreenings(response.data);
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            message.error('Не удалось загрузить показы');
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
            setObjects(response.data || []);
        } catch (error) {
            console.error('Ошибка загрузки объектов:', error);
            if (error.response && error.response.status === 401) {
                EventBus.dispatch("logout");
              }
        }
    };

    const handleSortChange = (value) => {
        setSortOrder(value);
    };

    const sortedScreenings = useMemo(() => {
        return [...screenings].sort((a, b) => {
            const dateA = dayjs(a.date_time).valueOf();
            const dateB = dayjs(b.date_time).valueOf();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }, [screenings, sortOrder]);

    const handleAddSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                date_time: values.date_time.toISOString(),
                object_id: values.object_id,
            };
            await ScreeningsService.addScreening(payload);
            setModalVisible(false);
            form.resetFields();
            fetchScreenings();
            message.success('Показ успешно добавлен');
        } catch (error) {
            console.error('Ошибка добавления показа:', error);
            message.error('Ошибка при добавлении показа');
        }
    };

    const handleDelete = async (id) => {
        try {
            await ScreeningsService.deleteScreening(id);
            message.success('Показ успешно удалён');
            fetchScreenings();
        } catch (error) {
            console.error('Ошибка удаления показа:', error);
            message.error('Не удалось удалить показ');
        }
    };

    const handleEdit = (screening) => {
        setSelectedScreening(screening);
        editForm.setFieldsValue({
            date_time: dayjs(screening.date_time),
        });
        setEditModalVisible(true);
    };

    const handleEditSubmit = async () => {
        try {
            const values = await editForm.validateFields();
            const payload = {
                date_time: values.date_time.toISOString(),
            };
            await ScreeningsService.editScreening(selectedScreening.id, payload);
            setEditModalVisible(false);
            fetchScreenings();
            message.success('Дата показа успешно обновлена');
        } catch (error) {
            console.error('Ошибка редактирования показа:', error);
            message.error('Ошибка при редактировании показа');
        }
    };

    const getTimeUntilShow = (dateTime) => {
        const now = dayjs();
        const showTime = dayjs(dateTime);
        if (showTime.isBefore(now)) {
            return 'Пройден';
        } else {
            const diffInDays = showTime.diff(now, 'day');
            const diffInHours = showTime.diff(now, 'hour') % 24;
            const diffInMinutes = showTime.diff(now, 'minute') % 60;

            return `${diffInDays} д. ${diffInHours} ч. ${diffInMinutes} мин.`;
        }
    };

    const getTodayScreenings = () => {
        const today = dayjs().startOf('day');
        return screenings
            .filter(screening => {
                const showTime = dayjs(screening.date_time);
                return showTime.isSame(today, 'day') && showTime.isAfter(dayjs()); 
            })
            .sort((a, b) => dayjs(a.date_time).valueOf() - dayjs(b.date_time).valueOf()); 
    };

    const todayScreenings = useMemo(() => getTodayScreenings(), [screenings]);

    const dateCellRender = (value) => {
        const currentDate = value.format('YYYY-MM-DD');
        const screeningsForDay = screenings.filter(screening => dayjs(screening.date_time).format('YYYY-MM-DD') === currentDate);
        return (
            <ul>
                {screeningsForDay.map((screening) => (
                    <li key={screening.id}>
                        {screening.user.id === user.id ?
                            <span className='tw-text-[14px] tw-text-green-600'>🕓{dayjs(screening.date_time).format('HH:mm')}</span>
                            : <span className='tw-text-[14px] tw-text-blue-600'>🕓{dayjs(screening.date_time).format('HH:mm')}</span>
                        }     
                    </li>
                ))}
            </ul>
        );
    };

    const handleDateSelect = (date) => {
      setSelectedDate(date);
      const screeningsForSelectedDate = screenings.filter(screening => dayjs(screening.date_time).isSame(date, 'day'));
      if (screeningsForSelectedDate.length > 0) {
          setModalCellVisible(true);
      } else {
          message.info('Нет показов на выбранную дату');
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
        <div className="tw-flex tw-flex-col tw-gap-5">
            <div className="tw-mb-4">
                <h3 className='tw-mb-6'>Расписание показов на сегодня</h3>
                <div className="tw-overflow-x-auto">
                    {todayScreenings.length === 0 ? (
                        <div>Нет показов на сегодня</div>
                    ) : (
                        <Carousel afterChange={onChangeToday} autoplay dots={false} slidesToShow={2} infinite>
                            {todayScreenings.map((screening) => (
                                <Card
                                    key={screening.id}
                                    className='tw-h-[200px]'
                                    style={{ minWidth: '250px', width: 'auto', margin: '10px' }}
                                >
                                    <Card.Meta
                                        title={`${dayjs(screening.date_time).format('HH:mm')}`}
                                        description={
                                            <>
                                                <p><b>Объект:</b> {screening.object?.title}</p>
                                                <p><b>Адрес:</b> {screening.object?.address}</p>
                                                <div className="tw-flex tw-items-center">
                                                    <Avatar
                                                        className='tw-mr-1'
                                                        src={screening.user?.avatar_link || 'https://avatars.mds.yandex.net/i?id=bc4adc841ef91c461ffc20c7f66d4d2e_l-5524434-images-thumbs&n=13'}
                                                        size={32}
                                                    />
                                                    <Link to={`/users/user/${screening.user?.id}`}>
                                                        <span>{screening.user?.fio}</span>
                                                    </Link>
                                                </div>
                                            </>
                                        }
                                    />
                                </Card>
                            ))}
                        </Carousel>
                    )}
                </div>
            </div>
            <h3>Календарь показов</h3>
            <div className="tw-bg-white tw-p-[25px] tw-rounded-[25px] tw-shadow-sm  tw-mb-[20px]">
                <Calendar
                    dateCellRender={dateCellRender} // Для отображения событий в календаре
                    onSelect={handleDateSelect} // Обработчик выбора даты
                />
            </div>
            <h3><span>Все показы{" "}({screenings.length})</span></h3>
            <div className="tw-flex tw-justify-between">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalVisible(true)}
                >
                    Добавить показ
                </Button>
                <Select defaultValue="desc" onChange={handleSortChange} style={{ width: 200 }}>
                    <Option value="asc">↑ По дате показа</Option>
                    <Option value="desc">↓ По дате показа</Option>
                </Select>
            </div>

            {sortedScreenings.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((screening, index) => (
                <Card
                    className="tw-rounded-xl tw-shadow-md"
                    key={index}
                    actions={[
                        <Link to={`/objects/object/${screening.object.id}`}>
                            <FullscreenOutlined key="open" /> Посмотреть объект
                        </Link>,
                        <EditOutlined onClick={() => handleEdit(screening)} />,
                        <Popconfirm
                            title="Вы уверены, что хотите удалить этот показ?"
                            onConfirm={() => handleDelete(screening.id)}
                            okText="Да"
                            cancelText="Нет"
                        >
                            <DeleteOutlined />
                        </Popconfirm>,
                    ]}
                    style={{ width: '100%' }}
                >
                    <Card.Meta
                        title={
                            <div className="tw-border-b tw-border-gray-200 tw-pb-2 tw-mb-2">
                                {dayjs(screening.date_time).format('DD.MM.YYYY HH:mm')}
                            </div>
                        }
                        description={
                            <>
                                <p><b>Объект:</b> {screening.object?.title}</p>
                                <p><b>Адрес:</b> {screening.object?.address}</p>
                                <div className="tw-flex tw-justify-between tw-items-center">
                                    <div className="tw-flex tw-items-center tw-gap-2">
                                        {getTimeUntilShow(screening.date_time) === 'Пройден' ? (
                                            <span style={{ color: 'green' }}>✅ Пройден</span>
                                        ) : (
                                            <span>🕓 До показа: {getTimeUntilShow(screening.date_time)}</span>
                                        )}
                                    </div>
                                    <div className="tw-flex tw-items-center tw-gap-2">
                                        <Avatar
                                            src={screening.user?.avatar_link || 'https://avatars.mds.yandex.net/i?id=bc4adc841ef91c461ffc20c7f66d4d2e_l-5524434-images-thumbs&n=13'}
                                            size={32}
                                        />
                                        <Link to={`/users/user/${screening.user?.id}`}>
                                            <span>{screening.user?.fio}</span>
                                        </Link>
                                    </div>
                                </div>
                            </>
                        }
                    />
                </Card>
            ))}
            <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={screenings.length}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
            />
            <Modal
                title="Редактировать дату показа"
                open={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                onOk={handleEditSubmit}
                okText="Сохранить"
                cancelText="Отмена"
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item
                        name="date_time"
                        label="Дата и время показа"
                        rules={[{ required: true, message: 'Выберите дату и время' }]} >
                        <DatePicker
                            showTime={{ format: 'HH:mm' }}
                            format="DD.MM.YYYY HH:mm"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="Добавить показ"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleAddSubmit}
                okText="Добавить"
                cancelText="Отмена"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="date_time"
                        label="Дата и время показа"
                        rules={[{ required: true, message: 'Выберите дату и время' }]} >
                        <DatePicker
                            showTime={{ format: 'HH:mm' }}
                            format="DD.MM.YYYY HH:mm"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="object_id"
                        label="Объект недвижимости"
                        rules={[{ required: true, message: 'Выберите объект' }]} >
                        <Select placeholder="Выберите объект">
                            {objects.map((obj) => (
                                <Option key={obj.id} value={obj.id}>
                                    {obj.title} — {obj.address}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title={`Показы на ${dayjs(selectedDate).format('DD.MM.YYYY')}`}
                visible={modalCellVisible}
                onCancel={() => setModalCellVisible(false)}
                footer={null}
            >
                <ul>
                    {screenings
                      .filter(screening => dayjs(screening.date_time).isSame(selectedDate, 'day'))
                      .map(screening => (
                          <li key={screening.id} className='tw-border-b tw-py-1'>
                              <span>{dayjs(screening.date_time).format('HH:mm')} -{" "} 
                                <Link to={`/objects/object/${screening.object?.id}`}>
                                    <span>{screening.object.title}</span>
                                </Link></span>
                              <div>{screening.object.address}</div>
                              <div className="tw-flex tw-items-center tw-gap-2">
                                <Avatar
                                    src={screening.user?.avatar_link || 'https://avatars.mds.yandex.net/i?id=bc4adc841ef91c461ffc20c7f66d4d2e_l-5524434-images-thumbs&n=13'}
                                    size={32}
                                />
                                <Link to={`/users/user/${screening.user?.id}`}>
                                    <span>{screening.user?.fio}</span>
                                </Link>
                              </div>
                          </li>
                      ))}
                </ul>
            </Modal>
        </div>
    );
};

export default Screenings;

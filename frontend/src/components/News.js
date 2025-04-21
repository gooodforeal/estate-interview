import { message, Button, Avatar, List, Popconfirm, Modal, Form, Input, Spin } from 'antd';
import NewsService from "../services/news.service";
import React, { useState, useEffect} from "react";
import AuthService from "../services/auth.service";
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from "dayjs";


const News = () => {
    const currentUser = AuthService.getCurrentUser();
    const [loading, setLoading] = useState(true);
    const [news, setNews] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        async function fetchNews() {
        try {
            const response = await NewsService.getAllNews();
            if (response && response.data) {
            setNews(response.data);
            }
        } catch (error) {
            console.error("Ошибка получения данных новости:", error);
            message.error("Ошибка получения данных новости");
        } finally {
        setLoading(false);
        }
        }
        fetchNews();
    }, []);

    const handleDelete = async (id) => {
        try {
        await NewsService.deleteNew(id);
        message.success("Новость удалена");
        setNews(prev => prev.filter(newsItem => newsItem.id !== id));
        } catch (error) {
        console.error("Ошибка при удалении новости:", error);
        message.error("Не удалось удалить новость");
        }
    };

    const handleAddNews = async (values) => {
        try {
          const response = await NewsService.addNew(values);
          message.success("Новость добавлена");
          setNews(prev => [response.data, ...prev]); // Добавляем новость в начало списка
          setIsModalVisible(false);
          form.resetFields();
        } catch (error) {
          console.error("Ошибка при добавлении новости:", error);
          message.error("Не удалось добавить новость");
        }
      };

    return (
      <>
      {currentUser ? <div className='tw-mx-auto'>
        <div className='tw-flex tw-items-center tw-justify-between tw-mb-4 tw-px-5'>
            <h2 className=''>Новости</h2>
            {currentUser.is_admin && (
                <div className="tw-flex tw-justify-end">
                    <Button type="primary" onClick={() => setIsModalVisible(true)}>
                        <PlusOutlined />
                    </Button>
                </div>
            )}
        </div>
        <List
          loading={loading}
          itemLayout="horizontal"
          dataSource={news}
          renderItem={(item) => (
            <List.Item
              actions={
                currentUser.is_admin
                  ? [
                      <Popconfirm
                        title="Удалить эту новость?"
                        okText="Да"
                        cancelText="Отмена"
                        onConfirm={() => handleDelete(item.id)}
                      >
                        <DeleteOutlined className='tw-mr-7 hover:tw-no-underline hover:tw-text-black hover:tw-bg-gray-200 tw-duration-200'/>
                      </Popconfirm>,
                    ]
                  : []
              }
            >
              <List.Item.Meta
                avatar={<Avatar src={item.user.avatar_link} />}
                title={dayjs(item.created_at).format("DD.MM.YYYY") + " - " + item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
        <Modal
            title="Добавить новость"
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            onOk={() => form.submit()}
            okText="Сохранить"
            cancelText="Отмена"
        > 
        <Form form={form} layout="vertical" onFinish={handleAddNews}>
          <Form.Item
            label="Заголовок"
            name="title"
            rules={[{ required: true, message: 'Введите заголовок' }]}
            >
            <Input />
          </Form.Item>
          <Form.Item
            label="Описание"
            name="description"
            rules={[{ required: true, message: 'Введите описание' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
      </div> 
      : <Spin />}
    </>
    );
};

export default News;
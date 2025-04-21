import { Collapse, Button, Spin } from 'antd';
import News from "./News";
import { useNavigate } from 'react-router-dom';
import AuthService from "../services/auth.service";
import { useState, useEffect } from "react";


const Home = () => {
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate("/login")
    }
  }, []);
  const items = [
    {
      key: '1',
      label: <b
      style={{
        fontSize: "16px",

      }}
    >
      Как добавить новый объект недвижимости в систему?
    </b>,
      children: <p
      style={{
        paddingInlineStart: 24,
      }}
    >
      Вы можете добавить объект через раздел "Объекты", нажав кнопку "Добавить объект" и заполнив форму с описанием, характеристиками и фотографиями.
    </p>
    },
    {
      key: '2',
      label: <b
      style={{
        fontSize: "16px",

      }}
    >
      Можно ли привязать сделку к определённому агенту?
    </b>,
      children: <p
      style={{
        paddingInlineStart: 24,
      }}
    >
      Да, при создании сделки вы можете указать ответственного сотрудника, который будет отслеживать этапы сделки и взаимодействовать с клиентом.
    </p>
    },
    {
      key: '3',
      label: <b
      style={{
        fontSize: "16px",

      }}
    >
      Как запланировать и зафиксировать показ объекта?
    </b>,
      children: <p
      style={{
        paddingInlineStart: 24,
      }}
    >
      В разделе "Показы" доступен календарь, где можно выбрать дату, время и объект, а также указать клиента, которому будет проведён показ.
    </p>
    },
    {
      key: '4',
      label: <b
      style={{
        fontSize: "16px",

      }}
    >
      Есть ли возможность отслеживать статус сделки?
    </b>,
      children: <p
      style={{
        paddingInlineStart: 24,
      }}
    >
      Да, каждая сделка имеет этапы (например: первичный контакт, просмотр, задаток, сделка завершена). Вы всегда видите текущий статус и можете оставлять комментарии.
    </p>
    },
    {
      key: '5',
      label: <b
      style={{
        fontSize: "16px",

      }}
    >
      Могут ли сотрудники с разными ролями иметь ограниченный доступ?
    </b>,
      children: <p
      style={{
        paddingInlineStart: 24,
      }}
    >
     Конечно. Система поддерживает разграничение прав — администраторы, агенты роли видят только ту информацию, которая им разрешена.
    </p>
    },
  ];

  return (
    user ? (
    <>
      <div className='tw-mx-auto tw-w-[90%]'>
        <h3 className='tw-mb-6'>Главная</h3>
        <div className="tw-bg-[url('./images/home.jpg')] tw-bg-cover tw-bg-center tw-h-[450px] tw-rounded-[25px] tw-shadow-md tw-bg-blend-multiply tw-bg-gray-400 tw-mb-[20px]">
          <h1 className='tw-text-[32px] tw-text-center md:tw-text-[48px] tw-mx-auto tw-pt-32 tw-w-[100%] tw-text-white tw-font-bold tw-opacity-[75%]'>Платформа поддержки деятельности агентства недвижимости</h1>
          <p className='tw-text-center tw-mx-auto tw-w-3/4 tw-text-white tw-opacity-[75%]'>Estate Interview</p>
          <div className='tw-mx-auto tw-text-center'>
            <Button type='primary' >
              <a href="/objects" className='hover:tw-no-underline hover:tw-text-white'>Добавить объект</a>
            </Button>
        </div>   
        </div>
        <News></News>
        <div className="text-justify tw-bg-gradient-to-r tw-from-emerald-500 tw-to-emerald-600 tw-rounded-[25px] tw-mx-auto tw-p-[25px] tw-my-[20px] tw-shadow-lg">
          <h3 className='tw-group tw-font-brand tw-font-bold tw-text-white'>О проекте</h3>
          <p className='tw-group tw-text-slate-200'>
            Estate.Interview - это универсальное решение для автоматизации и оптимизации работы риелторов и менеджеров. 
            Система предоставляет удобные инструменты для управления объектами недвижимости, ведения сделок, планирования и учёта показов. 
            Благодаря централизованному хранению данных, встроенной аналитике и календарям, платформа позволяет 
            эффективно контролировать все этапы работы с клиентами — от первого контакта до завершения сделки.
          </p>
        </div>
        <div className='lg:tw-flex tw-gap-5 tw-mx-auto'>
          <div className='tw-mb-5 tw-bg-gradient-to-r tw-from-purple-800 tw-to-violet-600 tw-p-[15px] tw-rounded-[15px] tw-shadow-lg'>
            <p className='tw-text-white tw-font-brand tw-tracking-wider'><b>▎🏠 Объекты:</b></p>
            <p className='tw-text-justify tw-font-brand tw-text-slate-200'>
              Добавляйте и отслеживайте информацию об объектах недвижимости
            </p>
          </div>
          <div className='tw-mb-5 tw-bg-gradient-to-r tw-from-purple-500 tw-to-pink-500 tw-p-[15px] tw-rounded-[15px] tw-shadow-lg'>
            <p className='tw-text-white tw-font-brand tw-tracking-wider'><b>▎🤝 Сделки:</b></p>
            <p className='tw-text-justify tw-font-brand tw-text-slate-200'>
              Ведеите учет сделок, проходящих от лица агентства недвижимости
          </p>
          </div>
        </div>
        <div className="text-justify tw-bg-gradient-to-r tw-from-amber-500 tw-to-amber-600 tw-rounded-[25px] tw-mx-auto tw-p-[25px] tw-mt-[3px] tw-mb-[20px] tw-shadow-lg">
          <p className='tw-text-white tw-font-brand tw-tracking-wider'><b>▎🔍 Показы:</b></p>
          <p className='tw-text-justify tw-font-brand tw-text-slate-200'>
            Добавляйте информацию о паказах объектов недвижимости и отслеживайте график показов.
          </p>
        </div>
        <div className='tw-mx-auto'>
          <div className='tw-text-black tw-pl-5 tw-pt-5'>
            <h2 className=''>FAQ</h2>
          </div>
          <Collapse items={items} bordered={false} />
        </div>
      </div>
    </>
  ) : (<Spin />)
  );
};

export default Home;
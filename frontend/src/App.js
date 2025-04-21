import React, { useState, useEffect } from "react";
import { Routes, Route, redirect} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

import AuthService from "./services/auth.service";

import Login from "./components/Login";
import User from "./components/User";
import Register from "./components/Register";
import Home from "./components/Home";
import Header from "./components/Header";
import Objects from "./components/Objects";
import Object from "./components/Object";
import Profile from "./components/Profile";
import Users from "./components/Users";
import Footer from "./components/Footer";
import Screenings from "./components/Screenings";
import Deals from "./components/Deals";
import EventBus from "./common/EventBus";
import { useNavigate } from 'react-router-dom';


const App = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(undefined);
  const enterItems = [ 
    {
      label: 'Войти',
      key: '1',
      route: "/login",
    },
    {
      label: 'Зарегистрироваться',
      key: '2',
      route: "/register",
    }
  ]
  const userItems = [
    {
      label: '🏠 Объекты',
      key: '6',
      route: "/objects",
    },
    {
      label: '🔍 Показы',
      key: '7',
      route: "/screenings",
    },
    {
      label: '🤝 Сделки',
      key: '8',
      route: "/deals",
    },
    {
      label: 'Профиль',
      key: '5',
      route: "/profile",
    },
    {
      label: 'Выйти',
      key: '3',
      route: "/login",
    },
  ]
  const adminItems = [
    {
      label: '🏠 Объекты',
      key: '6',
      route: "/objects",
    },
    {
      label: '🔍 Показы',
      key: '7',
      route: "/screenings",
    },
    {
      label: '🤝 Сделки',
      key: '8',
      route: "/deals",
    },
    {
      label: '👤 Пользователи',
      key: '4',
      route: "/users",
    },
    {
      label: 'Профиль',
      key: '5',
      route: "/profile",
    },
    {
      label: 'Выйти',
      key: '3',
      route: "/login",
    },
  ]

  const [headerItems, setHeaderItems] = useState(enterItems);

  useEffect(() => {
    const user = AuthService.getCurrentUser();

    if (user) {
      setHeaderItems(userItems)
      setCurrentUser(user);
      if (user.is_admin) {
        setHeaderItems(adminItems)
      }
    }

    EventBus.on(
      "logout", 
      () => {
        logOut();
      }
    );

    return () => {
      EventBus.remove("logout");
    };
  }, []);

  const logOut = () => {
    AuthService.logout();
    setCurrentUser(undefined);
    setHeaderItems(enterItems);
    navigate("/login");
  };
 

  return (
    <div className="tw-bg-gray-200 tw-bg-[url('images/home1.jpg')] tw-bg-cover tw-bg-no-repeat tw-bg-center">
      <Header logout={logOut} items={headerItems}/>
      <div className="container mt-3 tw-min-h-screen tw-flex tw-flex-col">
        <Routes>
            <Route exact path={"/"} element={<Home />} />
            <Route exact path={"/home"} element={<Home />} />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/register" element={<Register />} />
            <Route exact path="/profile" element={<Profile />} />
            <Route path="/users/user/:userId" element={<User/>} />
            <Route path="/users" element={<Users/>} />
            <Route path="/objects" element={<Objects/>} />
            <Route path="/screenings" element={<Screenings/>} />
            <Route path="/deals" element={<Deals/>} />
            <Route path="/objects/object/:objectId" element={<Object/>} />
        </Routes>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default App;
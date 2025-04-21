import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import { Spin } from 'antd';

import AuthService from "../services/auth.service";

const required = (value) => {
  if (!value) {
    return (
      <div className="invalid-feedback d-block">
        This field is required!
      </div>
    );
  }
};

const Login = () => {
  const form = useRef();
  const checkBtn = useRef();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const onChangeUsername = (e) => {
    const username = e.target.value;
    setUsername(username);
  };

  const onChangePassword = (e) => {
    const password = e.target.value;
    setPassword(password);
  };

  const handleLogin = (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    form.current.validateAll();

    if (checkBtn.current.context._errors.length === 0) {
      AuthService.login(username, password).then(
        () => {
          navigate("/profile");
          window.location.reload();
        },
        (error) => {
          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();

          setLoading(false);
          setMessage(resMessage);
        }
      );
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="tw-w-3/5 tw-mx-auto tw-mt-[50px]">
      <div className="tw-bg-white tw-p-[25px] tw-rounded-[25px] tw-shadow-sm">
        <img
          src={require('./img/logo.png')}
          alt="profile-img"
          className="profile-img-card tw-w-[30%] mx-auto tw-mb-[20px]"
        />

        <div className="tw-text-center tw-mb-5">
          <h4>
            <b>Авторизация</b>
          </h4>
        </div>

        <Form onSubmit={handleLogin} ref={form}>
          <div className="form-group">
            <Input
              placeholder="Почта"
              type="text"
              className="form-control"
              name="username"
              value={username}
              onChange={onChangeUsername}
              validations={[required]}
            />
          </div>

          <div className="form-group">
            <Input
              placeholder="Пароль"
              type="password"
              className="form-control"
              name="password"
              value={password}
              onChange={onChangePassword}
              validations={[required]}
            />
          </div>

          <div className="tw-mx-auto tw-mb-5 tw-text-center">
            {loading && (<Spin />)}
          </div>

          <div className="form-group tw-mx-auto tw-w-[50%]">
            <button className="tw-w-[100%] tw-rounded-xl tw-bg-blue-600 tw-py-2 tw-text-white hover:tw-bg-blue-500 focus:tw-bg-blue-600 active:tw-bg-blue-900" disabled={loading}>
              <span><b>Войти</b></span>
            </button>
          </div>

          {message && (
            <div className="form-group">
              <div className="alert alert-danger" role="alert">
                {message}
              </div>
            </div>
          )}
          <CheckButton style={{ display: "none" }} ref={checkBtn} />
        </Form>
      </div>
    </div>
  );
};

export default Login;
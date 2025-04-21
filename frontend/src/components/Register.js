import React, { useState, useRef } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import { isEmail } from "validator";
import { Spin } from 'antd';

import AuthService from "../services/auth.service";


const required = (value) => {
  if (!value) {
    return (
      <div className="invalid-feedback d-block">
        Это обязательное поле
      </div>
    );
  }
};

const validEmail = (value) => {
  if (!isEmail(value)) {
    return (
      <div className="invalid-feedback d-block">
        Неправильный email
      </div>
    );
  }
};

const vfio = (value) => {
  if (value.length < 10 || value.length > 50) {
    return (
      <div className="invalid-feedback d-block">
        ФИО должно быть от 10 до 50 символов
      </div>
    );
  }
};

const vpassword = (value) => {
  if (value.length < 8 || value.length > 16) {
    return (
      <div className="invalid-feedback d-block">
        Пароль дожен быть от 8 до 16 символов
      </div>
    );
  }
};

const Register = (props) => {
  const form = useRef();
  const checkBtn = useRef();

  const [fio, setFio] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRep, setPasswordRep] = useState("");
  const [successful, setSuccessful] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onChangeFio = (e) => {
    const fio = e.target.value;
    setFio(fio);
  };

  const onChangeEmail = (e) => {
    const email = e.target.value;
    setEmail(email);
  };

  const onChangePassword = (e) => {
    const password = e.target.value;
    setPassword(password);
  };

  const onChangePasswordRep = (e) => {
    const passwordRep = e.target.value;
    setPasswordRep(passwordRep);
  };

  const handleRegister = (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setSuccessful(false);

    form.current.validateAll();

    if (checkBtn.current.context._errors.length === 0) {
      AuthService.register(fio, email, password, passwordRep).then(
        (response) => {
          setMessage(response.data.message);
          setSuccessful(true);
        },
        (error) => {
          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();

          setMessage(resMessage);
          setSuccessful(false);
          setLoading(false);
        }
      );
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
            <b>Регистрация</b>
          </h4>
        </div>

        <Form onSubmit={handleRegister} ref={form}>
          {!successful && (
            <div>
              <div className="form-group">
                <Input
                  placeholder="ФИО"
                  type="text"
                  className="form-control"
                  name="username"
                  value={fio}
                  onChange={onChangeFio}
                  validations={[required, vfio]}
                />
              </div>

              <div className="form-group">
                <Input
                  placeholder="Почта"
                  type="text"
                  className="form-control"
                  name="email"
                  value={email}
                  onChange={onChangeEmail}
                  validations={[required, validEmail]}
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
                  validations={[required, vpassword]}
                />
              </div>

              <div className="form-group">
                <Input
                  placeholder="Повторите пароль"
                  type="password"
                  className="form-control"
                  name="passwordRep"
                  value={passwordRep}
                  onChange={onChangePasswordRep}
                  validations={[required, vpassword]}
                />
              </div>

              
              <div className="tw-mx-auto tw-mb-5 tw-text-center">
                {loading && (<Spin />)}
              </div>

              <div className="form-group tw-mx-auto tw-w-[80%]">
                <button className="tw-w-[100%] tw-rounded-xl tw-bg-blue-600 tw-py-2 tw-text-white hover:tw-bg-blue-500 focus:tw-bg-blue-600 active:tw-bg-blue-900" disabled={loading}>
                  <span><b> Зарегистрироваться</b></span>
                </button>
              </div>
            </div>
          )}

          {message && (
            <div className="form-group">
              <div
                className={
                  successful ? "alert alert-success" : "alert alert-danger"
                }
                role="alert"
              >
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

export default Register;
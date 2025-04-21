import axios from "axios";

const API_URL = "http://localhost:3000/api/users/";

axios.defaults.withCredentials = true


const register = (fio, email, password, password_repeat) => {
  return axios.post(API_URL + "register", {
    "fio": fio,
    "email": email,
    "password": password,
    "password_repeat": password_repeat
  },
  {
    headers: {
      'Content-Type': 'application/json'
  }
  });
};

const login = (email, password) => {
  return axios
    .post(API_URL + "login", {
      "email": email,
      "password": password,
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
    .then((response) => {
      if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return response.data;
    });
};

const logout = () => {
  localStorage.removeItem("user");
  return axios
  .post(API_URL + "logout", {headers: {'Content-Type': 'application/json'}})
  .then((response) => {
    return response.data;
  });
};

const getCurrentUserStats = () => {
  return axios
    .get(API_URL + "me/stats", {headers: {'Content-Type': 'application/json'}})
    .then((response) => {
      return response.data;
    });
};

const uploadPhoto = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axios
    .post(API_URL + "upload-avatar", formData,
    {
      headers: {"Content-Type": "multipart/form-data"}
    }
  )
}

const getMe = () => {
  return axios.get(API_URL + "me", { headers: { "Content-Type": "application/json" } })
    .then((response) => {
      return response.data
    })
};

const getAllUsers = () => {
  return axios.get(API_URL + "all_users", { headers: { "Content-Type": "application/json" } })
    .then((response) => {
      return response.data
    })
};


const getUser = (id) => {
  return axios.get(API_URL + "user/" + id, { headers: { "Content-Type": "application/json" } })
    .then((response) => {
      return response.data
    })
};


const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
}


const AuthService = {
  register,
  login,
  logout,
  getMe,
  getCurrentUser,
  getAllUsers,
  getCurrentUserStats,
  uploadPhoto,
  getUser
}

export default AuthService;
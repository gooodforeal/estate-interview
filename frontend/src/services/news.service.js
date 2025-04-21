import axios from "axios";

const API_URL = "http://localhost:3000/api/news/";


axios.defaults.withCredentials = true


const getAllNews = () => {
  return axios.get(API_URL + "all", { headers: { "Content-Type": "application/json" } })
    .then((response) => {
      return response.data
    })
};


const addNew = (data) => {
    return axios
      .post(API_URL + "add", data,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
      .then((response) => {
        return response.data;
      });
  };


const deleteNew = (id) => {
    return axios.delete(API_URL + "delete/" + id, { headers: { "Content-Type": "application/json" } })
      .then((response) => {
        return response.data
      })
  };


const NewsService = {
    getAllNews,
    deleteNew,
    addNew
}

export default NewsService;
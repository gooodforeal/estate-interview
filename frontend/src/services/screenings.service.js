import axios from "axios";

const API_URL = "http://localhost:3000/api/screenings/";


axios.defaults.withCredentials = true


const getAllScreenings = () => {
  return axios.get(API_URL + "all", { headers: { "Content-Type": "application/json" } })
    .then((response) => {
      return response.data
    })
};

const addScreening= (data) => {
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


  const editScreening = (id, data) => {
    return axios
      .put(API_URL + "edit/" + id, data,
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


  const getScreening = (id) => {
    return axios
      .get(API_URL + "object/" + id,
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


const deleteScreening = (id) => {
    return axios.delete(API_URL + "delete/" + id, { headers: { "Content-Type": "application/json" } })
      .then((response) => {
        return response.data
      })
  };


const ScreeningsService = {
    addScreening,
    getAllScreenings,
    getScreening,
    deleteScreening,
    editScreening,
}

export default ScreeningsService;
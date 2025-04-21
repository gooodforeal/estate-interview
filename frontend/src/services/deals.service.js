import axios from "axios";

const API_URL = "http://localhost:3000/api/deals/";


axios.defaults.withCredentials = true


const getAllDeals = () => {
  return axios.get(API_URL + "all", { headers: { "Content-Type": "application/json" } })
    .then((response) => {
      return response.data
    })
};

const addDeal = (data) => {
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


  const editDeal = (id, data) => {
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


  const getDeal = (id) => {
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


const deleteDeal = (id) => {
    return axios.delete(API_URL + "delete/" + id, { headers: { "Content-Type": "application/json" } })
      .then((response) => {
        return response.data
      })
  };


const DealsService = {
    addDeal,
    getAllDeals,
    getDeal,
    deleteDeal,
    editDeal,
}

export default DealsService;
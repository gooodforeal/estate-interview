import axios from "axios";

const API_URL = "http://localhost:3000/api/objects/";


axios.defaults.withCredentials = true


const getAllObjects = () => {
  return axios.get(API_URL + "all", { headers: { "Content-Type": "application/json" } })
    .then((response) => {
      return response.data
    })
};


const addObject = (data) => {
    return axios
      .post(API_URL + "add-manually", data,
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


  const editObject = (id, data) => {
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


  const getPresentation = (data) => {
    return axios
      .post(API_URL + "presentation", data,
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


  const getObject = (id) => {
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



const deleteObject = (id) => {
    return axios.delete(API_URL + "delete/" + id, { headers: { "Content-Type": "application/json" } })
      .then((response) => {
        return response.data
      })
  };


const ObjectsService = {
    addObject,
    getAllObjects,
    deleteObject,
    editObject,
    getObject,
    getPresentation
}

export default ObjectsService;
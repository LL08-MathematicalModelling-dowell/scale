import axios from "axios";

const baseURL = window.location.hostname === 'localhost'
  ? 'http://127.0.0.1:8001'
  : 'https://www.scales.uxlivinglab.online/api';


  console.log(baseURL);
  

const servicesAxiosInstance = axios.create({
    baseURL: baseURL,
});

export {
    servicesAxiosInstance
}

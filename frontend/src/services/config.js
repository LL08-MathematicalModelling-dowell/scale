import axios from "axios";

const baseURL = window.location.hostname === 'localhost'
  ? 'http://127.0.0.1:8001'
  : 'https://www.scales.uxlivinglab.online/api';

  

const servicesAxiosInstance = axios.create({
    baseURL: baseURL,
});

const scaleAxiosInstance = axios.create({
  baseURL: 'https://100035.pythonanywhere.com',
});

export {
  servicesAxiosInstance,
  scaleAxiosInstance
}

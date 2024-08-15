import axios from "axios";

// comment the localhost baseURL before pushing
const servicesAxiosInstance = axios.create({
    // baseURL: "http://127.0.0.1:8001"
    baseURL: "https://www.scales.uxlivinglab.online/api"
});

const scaleAxiosInstance = axios.create({
  baseURL: 'https://100035.pythonanywhere.com',
});

export {
  servicesAxiosInstance,
  scaleAxiosInstance
}

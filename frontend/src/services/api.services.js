import { servicesAxiosInstance } from "./config"

const getServerStatus = async() => {
    return await servicesAxiosInstance.get('/')
}

const getAPIServerStatus = async() => {
    return await servicesAxiosInstance.get('v1/health-check/')
}
export {
    getServerStatus,
    getAPIServerStatus
}
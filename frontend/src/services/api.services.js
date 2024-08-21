import { servicesAxiosInstance, scaleAxiosInstance } from "./config";

const getServerStatus = async () => {
    return await servicesAxiosInstance.get('/')
}

const getAPIServerStatus = async () => {
    return await servicesAxiosInstance.get('/v1/')
}

const getUserLogin = async (credentials) => {
    return await servicesAxiosInstance.post('/v1/voc/user-management/?type=authenticate_user',
        credentials
    )
}

export const updateUserDetails = async (userId, data) => {
    const token = localStorage.getItem("accessToken"); 
  
    return await servicesAxiosInstance.post(
      '/v1/voc/user-management/?type=update_profile',
      {
        _id: userId,
        data: data
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      }
    );
  };
  

const getUserReport = async (scale_id) => {
    return await scaleAxiosInstance.get(`/addons/get-response/?scale_id=${scale_id}`)
}

const getUserScales = async ({ workspace_id, portfolio, type_of_scale, accessToken }) => {
    return await servicesAxiosInstance.post(
        '/v1/voc/scale-management/?type=scale_details',
        { workspace_id, portfolio,type_of_scale },
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );
}

const saveScaleDetails = async ({ hardCodedData, accessToken }) => {
    return await servicesAxiosInstance.post("/v1/voc/scale-management/?type=save_scale_details", hardCodedData,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken} `,
            }
        }
    )
}


export {
    getUserLogin,
    getServerStatus,
    getAPIServerStatus,
    getUserReport,
    getUserScales,
    saveScaleDetails,
    servicesAxiosInstance
}
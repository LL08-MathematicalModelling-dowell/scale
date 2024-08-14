import { servicesAxiosInstance,scaleAxiosInstance } from "./config";

const getServerStatus = async() => {
    return await servicesAxiosInstance.get('/')
}

const getAPIServerStatus = async() => {
    return await servicesAxiosInstance.get('/voc/v1/')
}

const getUserLogin = async (credentials) => {
    return await servicesAxiosInstance.post('/voc/v1/user-management/?type=authenticate_user', 
     credentials
    )
}

const getUserReport = async (scale_id)=> {
 return await scaleAxiosInstance.get(`/addons/get-response/?scale_id=${scale_id}`)
}

const getUserScales = async ({ workspace_id, portfolio, accessToken }) => {
    return await servicesAxiosInstance.post(
        '/voc/v1/scale-management/?type=scale_details',
        { workspace_id, portfolio }, 
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`, 
            },
        }
    );
}

const saveScaleDetails = async ({hardCodedData, accessToken}) => {
  return await servicesAxiosInstance.post("/voc/v1/scale-management/?type=save_scale_details", hardCodedData,
    {
        headers: {
            "Content-Type" : "application/json",
            Authorization: `Bearer ${accessToken } `,
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
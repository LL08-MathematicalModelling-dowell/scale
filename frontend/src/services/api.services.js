import { servicesAxiosInstance, scaleAxiosInstance, otpAxiosInstance } from "./config";

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

export const saveScaleDetailsType = async ({ hardCodedData, accessToken }) => {
    return await servicesAxiosInstance.post("/v1/voc/scale-management/?type=save_scale_details", hardCodedData,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken} `,
            }
        }
    )
}

const emailServiceForUserDetails = async (email,userId,latitude,longitude) => {
    return await servicesAxiosInstance.post('/v1/voc/user-management/?type=send_customer_email',{
        email: email,
        user_id: userId,
        latitude: latitude, 
        longitude: longitude
    })
}

const sendOtpServices = async (email,userId) => {
    return await otpAxiosInstance.post('/v1/otp-services/send-otp',{
        email: email,
        userId: userId
    })
}

const validateOtpServices = async (email, userId, otp) => {
    return await otpAxiosInstance.post('/v1/otp-services/validate-otp',{
        email: email,
        userId: userId,
        otp: otp
    })
}

const saveLocationData = async (data) => {
    console.log(data);
    
    return await otpAxiosInstance.post('/v1/location-services/save-location',data);
}

export {
    getUserLogin,
    getServerStatus,
    getAPIServerStatus,
    getUserReport,
    getUserScales,
    saveScaleDetails,
    servicesAxiosInstance,
    emailServiceForUserDetails,
    sendOtpServices,
    validateOtpServices,
    saveLocationData
}
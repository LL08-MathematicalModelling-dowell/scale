import {servicesAxiosInstance, scaleAxiosInstance, otpAxiosInstance} from "./config";

const getServerStatus = async () => {
  return await servicesAxiosInstance.get("/");
};

const getAPIServerStatus = async () => {
  return await servicesAxiosInstance.get("/v1/");
};

const microServicesServerStatus = async () => {
  return await otpAxiosInstance.get("/");
};

const microServicesAPIServerStatus = async () => {
  return await otpAxiosInstance.get("/v1/healtcheckup");
}

const getUserLogin = async (credentials) => {
  return await servicesAxiosInstance.post("/v1/voc/user-management/?type=authenticate_user", credentials);
};

const scaleResponse = async (user, scaleType, channel, instance, workspace_id, username, scale_id, index) => {
  return await servicesAxiosInstance.get(`/v1/create-response/?user=${user}&scale_type=${scaleType}&channel=${channel}&instance=${instance}&workspace_id=${workspace_id}&username=${username}&scale_id=${scale_id}&item=${index}`);
};

export const updateUserDetails = async (userId, data) => {
  const token = localStorage.getItem("accessToken");

  return await servicesAxiosInstance.post(
    "/v1/voc/user-management/?type=update_profile",
    {
      _id: userId,
      data: data,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const getUserReport = async (scale_id) => {
  return await servicesAxiosInstance.get(`/v1/get-response/?scale_id=${scale_id}`);
};

const getUserScales = async ({workspace_id, portfolio, type_of_scale, accessToken}) => {
  return await servicesAxiosInstance.post(
    "/v1/voc/scale-management/?type=scale_details",
    {workspace_id, portfolio, type_of_scale},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
};

const saveScaleDetails = async ({hardCodedData, accessToken}) => {
  return await servicesAxiosInstance.post("/v1/voc/scale-management/?type=save_scale_details", hardCodedData, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken} `,
    },
  });
};

const saveScaleDetailsType = async ({hardCodedData, accessToken}) => {
  return await servicesAxiosInstance.post("/v1/voc/scale-management/?type=save_scale_details", hardCodedData, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken} `,
    },
  });
};

const emailServiceForUserDetails = async (email, userId, latitude, longitude) => {
  return await servicesAxiosInstance.post("/v1/voc/user-management/?type=send_customer_email", {
    email: email,
    user_id: userId,
    latitude: latitude,
    longitude: longitude,
  });
};

const sendOtpServices = async (email, userId) => {
  return await otpAxiosInstance.post("/v1/otp-services/send-otp", {
    email: email,
    userId: userId,
  });
};

const validateOtpServices = async (email, userId, otp) => {
  return await otpAxiosInstance.post("/v1/otp-services/validate-otp", {
    email: email,
    userId: userId,
    otp: otp,
  });
};

const saveLocationData = async (data) => {
  console.log(data);

  return await otpAxiosInstance.post("/v1/location-services/save-location", data);
};

const getLikertReport= async (payload) => {
  return await servicesAxiosInstance.post(`/v1/get-report/?scale_type=likert`, payload);
};

const  getLikertChannelsInstances = async (scale_id) => {
  return await servicesAxiosInstance.get((`/v1/create-scale/?scale_id=${scale_id}`))
}
const getScaleChannels = async (scale_id) => {
  return await servicesAxiosInstance.get((`/v1/create-scale/?scale_id=${scale_id}`))
}

const getScaleReport = async (payload) => {
  return await servicesAxiosInstance.post(`/v1/get-report/?scale_type=likert`, payload);
};

const getLLXReport = async (payload) => {
  return await servicesAxiosInstance.post(`v1/scale-services/?service_type=get_scale_report&scale_type=learning_index`, payload);
}


export {getUserLogin, 
  getServerStatus, 
  getAPIServerStatus, 
  getUserReport, 
  getUserScales, 
  saveScaleDetails,
  servicesAxiosInstance,
  emailServiceForUserDetails, 
  sendOtpServices, 
  validateOtpServices, 
  saveLocationData,
  scaleResponse, 
   saveScaleDetailsType, 
   getLikertReport,
  getLikertChannelsInstances,
  microServicesServerStatus,
  microServicesAPIServerStatus,
  getScaleChannels,
  getScaleReport,
  getLLXReport
  };

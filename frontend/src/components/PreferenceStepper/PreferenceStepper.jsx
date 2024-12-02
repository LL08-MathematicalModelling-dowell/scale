import { useEffect, useState } from "react";
import BasicInformation from "@/Pages/Preference/PreferenceSteps/BasicInformation";
import ReportConfiguration from "@/Pages/Preference/PreferenceSteps/ReportConfiguration";
import ScaleConfiguration from "@/Pages/Preference/PreferenceSteps/ScaleConfiguration";
import { FaCheckCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./CSS/Stepper.css";
import { decodeToken } from "@/utils/tokenUtils";
import { createPreferenceApi, getAvailablePreferences, getUserScales, updatePreferences } from "@/services/api.services";
import { workspaceNamesForLikert, workspaceNamesForNPS } from "@/data/Constants";
import { useCurrentUserContext } from "@/contexts/CurrentUserContext";

const PreferenceStepper = () => {
  const steps = ["Basic ", "Configure", "Finish Up"];

  const [formData, setFormData] = useState({
    scaleType: " ",
    dataType: "",
    brandName: "",
    productName: "",
    questionToDisplay: " ",
  });

  const savedStep = localStorage.getItem("currentStep");
  const [currentStep, setCurrentStep] = useState(savedStep ? parseInt(savedStep) : 1);
  const [complete, setComplete] = useState(false);
  const [preferenceData, setPreferenceData] = useState(null); 
  const [scaleId, setScaleId] = useState(null);
  const [accessKey, setAccessKey] = useState({});
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertColor, setAlertColor] = useState("green");


  const {defaultScaleOfUser, setDefaultScaleOfUser} = useCurrentUserContext();

  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      navigate("/voc");
    } else {
      const decodedTokenForWorkspaceName = decodeToken(accessToken);
      if (workspaceNamesForNPS.some((workspaceName) => workspaceName === decodedTokenForWorkspaceName.workspace_owner_name)) {
        setDefaultScaleOfUser("nps");
      } else if (workspaceNamesForLikert.some((workspaceName) => workspaceName === decodedTokenForWorkspaceName.workspace_owner_name)) {
        setDefaultScaleOfUser("likert");
      }
    }
  }, [accessToken, refreshToken, navigate]);

  useEffect(() => {
    const fetchScaleId = async () => {
      let scale_id = localStorage.getItem("scale_id");
      if (!scale_id) {
        try {
          const decodedToken = decodeToken(accessToken);
          const response = await getUserScales({
            workspace_id: decodedToken.workspace_id,
            portfolio: decodedToken.portfolio,
            type_of_scale: defaultScaleOfUser,
            accessToken,
          });
          scale_id = response?.data?.response[0]?.scale_id;
          console.log(scale_id);
          setScaleId(scale_id);
        } catch (error) {
          showAlert("Error fetching user scales", "red");
          return error;
        }
      } else {
        setScaleId(scale_id);
      }
    };

    if (defaultScaleOfUser) fetchScaleId();
    console.log(scaleId);
  }, [defaultScaleOfUser]);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    console.log(scaleId);
    if (accessToken) {
      const decodeAccessToken = decodeToken(accessToken);
      setAccessKey(decodeAccessToken);
    }
  }, []);

  const showAlert = (message, color) => {
    setAlertMessage(message);
    setAlertColor(color);
    setAlert(true);

    setTimeout(() => {
      setAlert(false);
    }, 3000);
  };

  useEffect(() => {
    const fetchUserPreferences = async () => {
      setLoading(true);
      if (accessKey.workspace_id && accessKey.portfolio_username) {
        try {
          const response = await getAvailablePreferences(accessKey.workspace_id, accessKey.portfolio_username);
          if (response.status === 200 && response.data.response.length > 0) {
            setPreferenceData(response.data.response[0]);
            setFormData({
              scaleType: response.data.response[0].scaleType,
              dataType: response.data.response[0].dataType,
              brandName: response.data.response[0].brandName,
              productName: response.data.response[0].productName,
              questionToDisplay: response.data.response[0].questionToDisplay,
            });

          } else {
            showAlert("No preference data found", "yellow");
          }
        } catch (error) {
          showAlert("Error fetching user preferences", "red");
          console.log(error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        showAlert("Access key not found", "blue");
      }
    };

    if (accessKey.workspace_id && accessKey.portfolio_username) {
      fetchUserPreferences();
    }
  }, [accessKey]);

  const payload = {
    workspaceId: accessKey.workspace_id,
    workspaceName: accessKey.workspace_owner_name,
    portfolio: accessKey.portfolio,
    userId: accessKey.portfolio_username,
    scaleTypePreference: defaultScaleOfUser,
    scaleDesignPreference: [
      {
        scaleType: formData.scaleType,
        scaleId: scaleId,
        design: "default",
      },
    ],
    notificationDuration: "biweekly",
    dataType: formData.dataType,
    productType: "voice_of_customer",
    brandName: formData.brandName,
    productName: formData.productName,
    questionToDisplay: formData.questionToDisplay,
  };

  const createPreference = async () => {
    try {
      setLoading(true);
      showAlert("Please wait... Processing your request", "green");

      const response = await createPreferenceApi(payload);
      if (response.success === "true") {
        showAlert("Preference created successfully", "green");
        setPreferenceData(response.data);
        setTimeout(() => {
          navigate("/voc/preferences");
        }, [1000])

      }
      setLoading(false);
    } catch (error) {
      console.log(error.response.data.message);
      setLoading(false);
      showAlert(error.response.data.message, "red");
    }
  };

  const updatePreference = async () => {
    try {
      setLoading(true);
      showAlert("Please wait... Updating your preference", "green");

      const response = await updatePreferences(payload);
      if (response.success === "true") {
        showAlert("Preference updated successfully", "green");
        setPreferenceData(response.data);

      }
      setLoading(false);
    } catch (error) {
      console.log(error.response.data.message);
      setLoading(false);
      showAlert(error.response.data.message, "red");
    }
  };

  const handleSubmit = async (e) => {
    console.log(formData)
    e.preventDefault();
    if (preferenceData) {
      updatePreference();
    } else {
      createPreference();
    }
  };


  useEffect(() => {
    localStorage.setItem("currentStep", currentStep);
  }, [currentStep]);

  // Fetch Location

  useEffect(() => {
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(function(position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
  
        console.log("Latitude: " + latitude + ", Longitude: " + longitude);
        console.log("Timezone: " + timezone);
      }, function(error) {
        console.log(error)
      })
    }
    }, [])

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      if (complete) setComplete(false);
    }
  };

  const handleNext = () => {
    if (currentStep === steps.length) {
      setComplete(true);
      console.log(formData); // This will log all the form data collected across the steps
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  return (
    <>
      <div className="flex flex-col gap-9 max-w-full md:max-w-full relative">
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`relative flex flex-col justify-center items-center md:w-full w-64 step-item gap-2 ${currentStep === index + 1 && "active"} ${(index + 1 < currentStep || complete) && "complete"}`}
            >
              <div className={`step ${currentStep > index + 1 || complete ? "text-white bg-dowellDeepGreen" : null}`}>
                {currentStep > index + 1 || complete ? <FaCheckCircle /> : index + 1}
              </div>
              <p className={`text-center pl-[7px] font-poppins text-black text-[13px] ${currentStep > index + 1 || complete ? "font-bold" : null}`}>
                {step}
              </p>
            </div>
          ))}
        </div>


        {/* Alert and Notification */}
    {
      alert && (
        <div className={`absolute top-20 right-12 bg-${alertColor}-600 font-poppins tracking-tight text-white text-[15px] font-medium py-2 px-4 rounded-md ${alertColor}`}>
          <p>{alertMessage}</p>
        </div>
      )
    }

        {/* Step Content */}
        {currentStep === 1 && (
          <div className="mt-4 md:mx-32 max-w-full px-12">
            <BasicInformation formData={formData} handleInputChange={handleInputChange} />
          </div>
        )}
        {currentStep === 2 && (
          <div className="mt-4 md:mx-32 max-w-full">
            <ScaleConfiguration formData={formData} handleInputChange={handleInputChange} />
          </div>
        )}
        {currentStep === 3 && (
          <div className="mt-4 md:mx-32 max-w-full">
            <ReportConfiguration formData={formData} handleInputChange={handleInputChange} />
          </div>
        )}
      </div>

      <div className="flex items-center mt-20 gap-8 w-full justify-center py-10">
        <Link className={`previous ${currentStep === 1 && "hidden"}`} onClick={handlePrevious}>
          Previous
        </Link>
        {!complete && (
          <Link
            // to={`${currentStep === steps.length ? handleSubmit  : "#"}`}
            className="py-2 px-12 font-poppins text-center text-white text-[15px] font-medium bg-dowellDeepGreen hover:bg-transparent hover:text-dowellDeepGreen rounded-md cursor-pointer hover:shadow-xl transition ease-in-out duration-300"
            onClick={currentStep !== steps.length ? handleNext : handleSubmit}
          >
            {currentStep === steps.length ? "Finish" : "Next"}
          </Link>
        )}
      </div>
    </>
  );
};

export default PreferenceStepper;

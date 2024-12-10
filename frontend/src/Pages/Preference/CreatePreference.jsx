import PreferenceSelect from "@/components/PreferenceSelect/PreferenceSelect";
import {useEffect, useState} from "react";
import {decodeToken} from "@/utils/tokenUtils";
import {useCurrentUserContext} from "@/contexts/CurrentUserContext";
import {useNavigate} from "react-router-dom";
import {workspaceNamesForLikert, workspaceNamesForNPS} from "@/data/Constants";

import Navbar from "@/components/Navbar/Navbar";
import {createPreferenceApi, getAvailablePreferences, getUserScales, updatePreferences} from "@/services/api.services";
import SelectField from "@/components/SelectField/SelectField";
import {FaInfoCircle} from "react-icons/fa";
import CustomTooltip from "@/components/Tooltip/CustomTooltip";

const CreatePreference = () => {
  const [alert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertColor, setAlertColor] = useState("green");
  const [loading, setLoading] = useState(false);
  const [accessKey, setAccessKey] = useState({});
  const [scaleId, setScaleId] = useState("");
  const [preferenceData, setPreferenceData] = useState(null); // Holds fetched preference data, if any
  const [isEditing, setIsEditing] = useState(false); // Edit mode toggle
  const [formData, setFormData] = useState({
    scaleType: " ",
    dataType: "",
    brandName: "",
    productName: "",
    questionToDisplay: " ",
  });

  const scaleTypes = [
    {label: "NPS Scale", value: "nps"},
    {label: "Likert Scale", value: "likert"},
  ];
  const DataTypes = [
    {label: "Real Data", value: "Real_Data"},
    {label: "Learning Data", value: "Learning_Data"},
    {label: "Testing Data", value: "Testing_Data"},
    {label: "Archived Data", value: "Archived_Data"},
  ];
  const Ratting = [
    {
      label: `On a scale of 0 -10, how would you rate ${formData.productName === "" ? "{product_name}" : formData.productName}?`,
      value: `On a scale of 0 -10, how would you rate ${formData.productName === "" ? "{product_name}" : formData.productName}?`,
    },
    {
      label: `On a scale of 0 - 10, how would you rate ${formData.brandName === "" ? "{brand_name}" : formData.brandName}`,
      value: `On a scale of 0 - 10, how would you rate ${formData.brandName === "" ? "{brand_name}" : formData.brandName}`,
    },
    {
      label: `On a scale of 0 - 10, how would you rate ${formData.productName === "" ? "{product_name}" : formData.productName} from ${formData.brandName === "" ? "{brand_name}" : formData.brandName}?`,
      value: `On a scale of 0 - 10, how would you rate ${formData.productName === "" ? "{product_name}" : formData.productName} from ${formData.brandName === "" ? "{brand_name}" : formData.brandName}?`,
    },
  ];

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
            setIsEditing(false);
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
        showAlert("Access key not found");
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
        setIsEditing(false);
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
        setIsEditing(false);
      }
      setLoading(false);
    } catch (error) {
      console.log(error.response.data.message);
      setLoading(false);
      showAlert(error.response.data.message, "red");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (preferenceData) {
      updatePreference();
    } else {
      createPreference();
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleInputChange = (event, value, name) => {
    setFormData({...formData, [name]: value});
  };

  const Duration = [
    {label: "Last 7 days", value: "seven_days"},
    {label: "Last 15 days", value: "fifteen_days"},
    {label: "Last 30 days", value: "thirty_days"},
    {label: "Last 90 days", value: "ninety_days"},
  ];

  return (
    <div className="min-h-screen max-w-full">
      <Navbar />
      <h1 className="text-2xl font-bold font-poppins tracking-tight md:px-10 px-2 ">Set Preferences</h1>
      <div className="mt-8 md:px-10 px-2  flex flex-col gap-5 w-full md:items-center">
        {alert && <div className={`absolute top-44 right-6 ml-32 md:top-50 md:right-8 bg-${alertColor}-600 text-white text-sm font-poppins tracking-tight px-2 py-3  md:px-4 md:py-4 rounded-md`}>{alertMessage}</div>}

        <div className="flex flex-col gap-2 ">
          <label htmlFor="scaleType" className="font-poppins tracking-tighter">
            Choose a scale Type
          </label>
          <PreferenceSelect name="scaleType" data={scaleTypes} triggerClass="md:w-[620px] w-[320px]  font-poppins tracking-tight" placeholder="Select scale type" type="select" handleInputChange={handleInputChange} value={formData.scaleType} />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="dataType" className="font-poppins tracking-tighter">
            Choose a data Type
          </label>
          <PreferenceSelect name="dataType" data={DataTypes} triggerClass="md:w-[620px] w-[320px] font-poppins tracking-tight" placeholder="Select data type" type="select" handleInputChange={handleInputChange} value={formData.dataType} />
        </div>

        <div className="flex gap-5 flex-col md:flex-row">
          <div className="flex flex-col gap-2">
            <label htmlFor="brandName" className="font-poppins tracking-tighter">
              Your Brand Name
            </label>
            <PreferenceSelect name="brandName" type="input" inputClass="w-[300px] font-poppins text-sm tracking-tight h-10 px-2 border border-gray-300 rounded-md" placeholder="Enter brand name" handleInputChange={handleInputChange} value={formData.brandName} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="productName" className="font-poppins tracking-tighter">
              Your Product Name
            </label>
            <PreferenceSelect name="productName" type="input" inputClass="w-[300px] font-poppins text-sm tracking-tight h-10 px-2 border border-gray-300 rounded-md" placeholder="Enter product name" handleInputChange={handleInputChange} value={formData.productName} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="questionToDisplay" className="md:text-md  font-poppins tracking-tighter">
            Choose the type of question you want
          </label>
          <PreferenceSelect name="questionToDisplay" data={Ratting} customClass="md:w-[610px] w-[300px] font-poppins tracking-tight"  placeholder="On a scale of 0 -10, how would you rate our product/service?" type="rating" handleInputChange={handleInputChange} value={formData.questionToDisplay} />
        </div>

        <div className="flex flex-col gap-2 items-center w-full">
          <p className="font-poppins text-md tracking-tight">
            This is how the <span className="font-semibold text-dowellDeepGreen">Question</span> will be:
          </p>
          <p className="font-poppins md:text-lg text-sm font-bold tracking-tight  ">{formData.questionToDisplay}</p>
        </div>

        <div className="flex  gap-2 flex-col ">
          <div className="flex items-center gap-2">
            <label htmlFor="" className="font-poppins tracking-tight font-semibold">
              Set time period for report
            </label>
            <CustomTooltip text="This is the time period for the report to be sent to your email.">
              <FaInfoCircle className="text-green-800" />
            </CustomTooltip>
          </div>
          <PreferenceSelect triggerClass="md:w-[620px] w-[320px] font-poppins tracking-tight" data={Duration} placeholder="Select time period" />
        </div>

        <div className="">
          <p className="tracking-tight font-poppins text-sm text-gray-600 flex gap-1 items-center justify-center">
            Receive new updates via email{" "}
            <a onClick={() => null} className=" cursor-pointer font-bold tracking-tight text-md text-green-900 underline">
              Subscribe
            </a>
          </p>
        </div>

        <div className="flex justify-center my-10">
          {preferenceData && !isEditing ? (
            <button onClick={handleEdit} className="w-28 h-10 font-poppins tracking-tight text-sm font-medium text-white bg-dowellLiteGreen rounded-md hover:bg-dowellGreen">
              Edit
            </button>
          ) : (
            <button onClick={handleSubmit} className="w-28 h-10 font-poppins tracking-tight text-sm font-medium text-white bg-dowellLiteGreen rounded-md hover:bg-dowellGreen">
              {preferenceData ? "Update" : "Save"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePreference;

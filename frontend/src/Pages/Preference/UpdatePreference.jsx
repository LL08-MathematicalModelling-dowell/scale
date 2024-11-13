import Navbar from "@/components/Navbar/Navbar";
import PreferenceSelect from "@/components/PreferenceSelect/PreferenceSelect";
import { useCurrentUserContext } from "@/contexts/CurrentUserContext";
import { workspaceNamesForLikert, workspaceNamesForNPS } from "@/data/Constants";
import { getAvailablePreferences, getUserScales, updatePreferences } from "@/services/api.services";
import { decodeToken } from "@/utils/tokenUtils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UpdatePreference = () => {
  const { defaultScaleOfUser, setDefaultScaleOfUser } = useCurrentUserContext();
  const [alert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertColor, setAlertColor] = useState("green");
  const [accessKey, setAccessKey] = useState({});
  const [loading, setLoading] = useState(false);
  const [preferenceData, setPreferenceData] = useState([]);
  const [formData, setFormData] = useState({
    scaleType: "",
    dataType: "",
    brandName: "",
    productName: "",
    questionToDisplay: "",
  });
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  const showAlert = (message, color) => {
    setAlertMessage(message);
    setAlertColor(color);
    setAlert(true);
    setTimeout(() => {
      setAlert(false);
    }, 3000);
  };

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      navigate("/voc");
    } else {
      const decodedTokenForWorkspaceName = decodeToken(accessToken);
      if (workspaceNamesForNPS.includes(decodedTokenForWorkspaceName.workspace_owner_name)) {
        setDefaultScaleOfUser("nps");
      } else if (workspaceNamesForLikert.includes(decodedTokenForWorkspaceName.workspace_owner_name)) {
        setDefaultScaleOfUser("likert");
      }
    }
  }, [accessToken, refreshToken]);

  useEffect(() => {
    const fetchUserPreferences = async () => {
      setLoading(true);
      if (accessKey.workspace_id && accessKey.portfolio_username) {
        try {
          const response = await getAvailablePreferences(accessKey.workspace_id, accessKey.portfolio_username);
          if (response.status === 200) {
            const preference = response.data.response;
            setPreferenceData(preference);
            setFormData({
              scaleType: preference.scaleType,
              dataType: preference.dataType,
              brandName: preference.brandName,
              productName: preference.productName,
              questionToDisplay: preference.questionToDisplay,
            });
            showAlert("Field preferences fetched successfully", "green");
          } else {
            showAlert("No preference data found", "yellow");
            navigate("/voc/create-preference");
            return; // Stop further execution if redirected
          }
        } catch (error) {
          showAlert("Error fetching user preferences", "red");
          console.log(error);
        }
      }
      setLoading(false);
    };

    fetchUserPreferences();
  }, [accessKey]);

  useEffect(() => {
    if (accessToken) {
      const decodedToken = decodeToken(accessToken);
      setAccessKey({
        ...decodedToken,
        workspace_id: decodedToken.workspace_id,
        portfolio_username: decodedToken.portfolio_username,
      });
    }
  }, [accessToken]);

  const DataTypes = [
    { label: "Real Data", value: "Real_Data" },
    { label: "Learning Data", value: "Learning_Data" },
    { label: "Testing Data", value: "Testing_Data" },
    { label: "Archived Data", value: "Archived_Data" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { dataType: formData.dataType };

    try {
      setLoading(true);
      showAlert("Please wait... Processing your request", "green");

      const response = await updatePreferences(accessKey.workspace_id, accessKey.portfolio_username, payload);
      if (response.success === "true" || response.status === 200) {
        showAlert("Preference updated successfully", "green");

        setTimeout(() => {
          navigate("/voc/preference");
        }, 2000);
      }
    } catch (error) {
      console.log(error.response?.data?.message || "Error updating preference");
      showAlert(error.response?.data?.message || "Error updating preference", "red");
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (event, value, name) => {
    if (event) {
      // Case when `event` is provided (input field)
      const { name, value } = event.target;
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    } else if (name) {
      // Case when `event` is `null` (select field)
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  return (
    <div className="min-h-screen max-w-full">
      <Navbar />
      <div className="mt-8 px-10 w-full flex flex-col gap-5">
        <h1 className="text-2xl font-bold font-poppins tracking-tight">Update Preferences</h1>

        {alert && (
          <div className={`absolute top-44 right-6 ml-32 md:top-50 md:right-8 ${alertColor === "green" ? "bg-green-600" : "bg-red-600"} text-white text-sm font-poppins tracking-tight px-2 py-3 md:px-4 md:py-4 rounded-md`}>
            {alertMessage}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor="dataType" className="font-poppins tracking-tighter">
            Choose a data Type
          </label>
          <PreferenceSelect
            name="dataType"
            data={DataTypes}
            triggerClass="w-[300px] font-poppins tracking-tight"
            placeholder="Select data type"
            type="select"
            handleInputChange={handleInputChange}
            selectedValue={formData.dataType}
          />
        </div>

        <div className="flex justify-center">
          <button onClick={handleSubmit} className="w-28 h-10 font-poppins tracking-tight text-sm font-medium text-white bg-green-900 rounded-md hover:bg-dowellGreen">
            Save Updates
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePreference;

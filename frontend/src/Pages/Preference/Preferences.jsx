import Navbar from "@/components/Navbar/Navbar";
import { Separator } from "@/components/ui/separator";
import { useCurrentUserContext } from "@/contexts/CurrentUserContext";
import { workspaceNamesForLikert, workspaceNamesForNPS } from "@/data/Constants";
import { getAvailablePreferences, getUserScales } from "@/services/api.services";
import { decodeToken } from "@/utils/tokenUtils";
import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { IoCopy } from "react-icons/io5";
import { MdAccessTimeFilled } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Preferences = () => {
  const {defaultScaleOfUser, setDefaultScaleOfUser} = useCurrentUserContext();
  const [scaleId, setScaleId] = useState("");
  const [alert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertColor, setAlertColor] = useState("green");
  const [accessKey, setAccessKey] = useState({});
  const [loading, setLoading] = useState(false);
  const [preferenceData, setPreferenceData] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false); // New state for subscription toggle
  const [email, setEmail] = useState(""); // New state for email input
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
  }, [accessToken, refreshToken, navigate, setDefaultScaleOfUser]);

  useEffect(() => {
    const fetchScaleId = async () => {
      let scale_id = localStorage.getItem("scale_id");
      if (!scale_id && defaultScaleOfUser) {
        try {
          const decodedToken = decodeToken(accessToken);
          const response = await getUserScales({
            workspace_id: decodedToken.workspace_id,
            portfolio: decodedToken.portfolio,
            type_of_scale: defaultScaleOfUser,
            accessToken,
          });
          scale_id = response?.data?.response[0]?.scale_id;
          setScaleId(scale_id);
          return scaleId;
        } catch (error) {
          showAlert("Error fetching user scales", "red");
          console.log(error);
        }
      } else {
        setScaleId(scale_id);
      }
    };

    if (defaultScaleOfUser) fetchScaleId();
  }, [defaultScaleOfUser, accessToken]);

  useEffect(() => {
    if (accessToken) {
      const decodedToken = decodeToken(accessToken);
      setAccessKey(decodedToken);
    }
  }, [accessToken]);

  useEffect(() => {
    const fetchUserPreferences = async () => {
      setLoading(true);
      if (accessKey.workspace_id && accessKey.portfolio_username) {
        try {
          const response = await getAvailablePreferences(accessKey.workspace_id, accessKey.portfolio_username);
          if (response.status === 200) {
            setPreferenceData(response.data.response);
            console.log(response.data.response);
            showAlert("User preferences fetched successfully", "green");
          } else {
            showAlert("No preference data found", "yellow");
          }
        } catch (error) {
          showAlert("Error fetching user preferences", "red");
          console.log(error);
          navigate("/voc/create-preference");
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

  const formatDate = (date) => {
    const now = new Date();
    const createdAtDate = new Date(date);
    const diffInDays = Math.floor((now - createdAtDate) / (1000 * 60 * 60 * 24));

    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
    } else {
      return createdAtDate.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(
      () => showAlert("Copied to clipboard", "green"),
      () => showAlert("Failed to copy to clipboard", "red")
    );
  };

  // const handleSubscriptionToggle = () => {
  //   setIsSubscribed((prevState) => !prevState);
  //   showAlert(isSubscribed ? "Unsubscribed from emails" : "Subscribed to emails", "green");
  // };

  // // Handle email input change
  // const handleEmailChange = (e) => {
  //   setEmail(e.target.value);
  // };

  // const Duration = [
  //   {label: "Last 7 days", value: "seven_days"},
  //   {label: "Last 15 days", value: "fifteen_days"},
  //   {label: "Last 30 days", value: "thirty_days"},
  //   {label: "Last 90 days", value: "ninety_days"},
  // ];

  return (
    <div className="max-w-full min-h-screen">
      <Navbar />
      <div className="flex flex-col px-4 py-5 relative">
        {/* Card */}
        <h1 className="text-3xl font-bold font-poppins tracking-tight text-gray-800">Settings</h1>
        <div className="flex gap-9 w-full">
          {loading ? (
            <div className="flex justify-center items-center flex-col py-12">
              <CircularProgress />
              <h2 className="font-poppins font-bold text-3xl tracking-tight mt-4">Loading...</h2>
              <p className="font-poppins tracking-tight">Please wait while fetching your preference</p>
            </div>
          ) : (
            <div className="flex flex-col w-[450px] h-[480px] mt-5 px-3 py-4 border border-b-gray-400 rounded-lg">
              <div className="flex flex-col gap-3 ">
                <h2 className="font-poppins font-bold text-lg tracking-tight underline">Workspace Details</h2>

                <p className="flex gap-3 font-poppins font-semibold text-md tracking-tight items-center">

                  Scale Type:{" "}
                  <span className="font-normal flex items-center gap-3">
                    {preferenceData.scaleTypePreference} <IoCopy className="size-4 cursor-pointer" onClick={() => handleCopy(preferenceData.scaleTypePreference)} />
                  </span>
                </p>
                <Separator />
                <h2 className="font-poppins font-bold text-lg tracking-tight underline">Preference Details</h2>
                <p className="flex gap-3 font-poppins font-semibold text-md tracking-tight items-center">

                  Brand Name:{" "}
                  <span className="font-normal flex items-center gap-3">
                    {preferenceData.brandName} <IoCopy className="size-4 cursor-pointer" onClick={() => handleCopy(preferenceData.brandName)} />
                  </span>
                </p>
                <p className="flex gap-3 font-poppins font-semibold text-md tracking-tight items-center">

                  Product Name:{" "}
                  <span className="font-normal flex items-center gap-3">
                    {preferenceData.productName} <IoCopy className="size-4 cursor-pointer" onClick={() => handleCopy(preferenceData.productName)} />
                  </span>
                </p>
                <div className="flex flex-col gap-1">
                  <p className="flex gap-3 font-poppins font-semibold text-md tracking-tight items-center">
    Question Displayed:
                  </p>
                  <span className="font-normal flex items-center gap-3 ml-7">( {preferenceData.questionToDisplay} )</span>
                </div>
                <p className="flex gap-3 font-poppins font-semibold text-md tracking-tight items-center">

                  Data Type:{" "}
                  <span className="font-normal flex items-center gap-3">
                    {preferenceData.dataType} <IoCopy className="size-4 cursor-pointer" onClick={() => handleCopy(preferenceData.dataType)} />
                  </span>
                </p>
                <Separator />
                <p className="flex gap-3 font-poppins font-semibold text-md tracking-tight items-center">
                  <MdAccessTimeFilled className="size-5 text-gray-700" /> Created:
                  <span className="font-normal flex items-center gap-3">{formatDate(preferenceData.createdAt)}</span>
                </p>
                {preferenceData.createdAt !== preferenceData.updatedAt && (
                  <p className="flex gap-3 font-poppins font-semibold text-md tracking-tight items-center">
                    <MdAccessTimeFilled className="size-5 text-gray-700" /> Last Updated:
                    <span className="font-normal flex items-center gap-3">{formatDate(preferenceData.updatedAt)}</span>
                  </p>
                )}
              </div>

              <div className="mt-2">
                <p className="flex gap-3 font-poppins font-semibold text-md tracking-tight items-center"><MdAccessTimeFilled className="size-5 text-gray-700" /> Time period for report: </p>
              </div>
              <div className="mb-10 text-right py-5">
                <button className="font-poppins py-2 px-4 bg-green-800 text-white rounded-lg md:text-md text-sm" onClick={() => navigate("/voc/update-preference")}>
                  Update Preference
                </button>
              </div>
            </div>
          )}

                      {/* New Email Subscription Section */}

          {/* <div className=" px-3 mb-10 w-full">

            <h2 className="font-poppins font-bold text-lg tracking-tight underline">Email Subscription</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="font-poppins font-semibold text-md tracking-tight">{isSubscribed ? "Subscribed" : "Unsubscribed"}</span>
              <button className="flex items-center justify-center px-3" onClick={handleSubscriptionToggle}>
                {isSubscribed ? <BsToggleOn className="text-green-500 text-3xl" /> : <BsToggleOff className="text-gray-400 text-3xl" />}
              </button>
            </div>
            <div className="flex gap-4">
              <input type="email" placeholder="Enter your email" className=" w-[400px] mt-2 px-3 py-2 border border-gray-300 rounded-md  font-poppins" value={email} onChange={handleEmailChange} />
            </div>

            <div className="flex mt-3 gap-1 flex-col ">
              <div className="flex items-center gap-2">
                <label htmlFor="" className="font-poppins tracking-tight font-semibold">
                 Set time period for report
                </label>
                <CustomTooltip text="This is the time frequency for the report to be sent to your email.">
                  <FaInfoCircle className="text-green-800" />
                </CustomTooltip>
              </div>
              <SelectField triggerClass="w-[400px] font-poppins tracking-tight" data={Duration} />
            </div>
            <button className="mt-3 px-4 py-2 bg-green-800 text-sm text-white rounded-lg font-poppins" onClick={() => showAlert(`Email ${isSubscribed ? "subscribed" : "unsubscribed"}: ${email}`, "green")}>
                Submit
              </button>
          </div> */}
          
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <div className={`absolute top-36 right-8 bg-${alertColor}-600 text-white px-4 py-2 rounded-lg`}>
          <p className="font-poppins tracking-tight">{alertMessage}</p>
        </div>
      )}
    </div>
  );
};

export default Preferences;

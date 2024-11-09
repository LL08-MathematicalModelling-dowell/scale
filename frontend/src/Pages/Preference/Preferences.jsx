import Navbar from "@/components/Navbar/Navbar";
import {useCurrentUserContext} from "@/contexts/CurrentUserContext";
import {workspaceNamesForLikert, workspaceNamesForNPS} from "@/data/Constants";
import {getAvailablePreferences, getUserScales} from "@/services/api.services";
import {decodeToken} from "@/utils/tokenUtils";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {BsPersonWorkspace} from "react-icons/bs";
import {IoCopy, IoScale} from "react-icons/io5";
import {Separator} from "@/components/ui/separator";
import {MdAccessTimeFilled, MdProductionQuantityLimits, MdWork} from "react-icons/md";
import {FaCircleQuestion} from "react-icons/fa6";
import {CircularProgress} from "@mui/material";

const Preferences = () => {
  const {defaultScaleOfUser, setDefaultScaleOfUser} = useCurrentUserContext();
  const [scaleId, setScaleId] = useState("");
  const [alert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertColor, setAlertColor] = useState("green");
  const [accessKey, setAccessKey] = useState({});
  const [loading, setLoading] = useState(false);
  const [preferenceData, setPreferenceData] = useState([]);
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
        } catch (error) {
          showAlert("Error fetching user scales", "red");
          return error;
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
            showAlert("User preferences fetched successfully", "green");
          } else {
            showAlert("No preference data found", "yellow");
            navigate("/voc/create-preference");
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
      )
  }
  return (
    <div className="max-w-full min-h-screen">
      <Navbar />
      <div className="flex flex-col px-4 py-5  relative">
        {/* Alert */}
        {alert && (
          <div className={`absolute top-4 right-8 bg-${alertColor}-600 text-white px-4 py-2 rounded-lg`}>
            <p className="font-poppins tracking-tight">{alertMessage}</p>
          </div>
        )}

        {/* Card */}
        <h1 className="text-3xl font-bold font-poppins tracking-tight text-gray-800">My Preferences</h1>
        {loading ? (
          <div className="flex justify-center items-center flex-col py-12">
            <CircularProgress />
            <h2 className="font-poppins font-bold text-3xl tracking-tight mt-4">Loading...</h2>
            <p className="font-poppins tracking-tight">Please wait while fetching your preference</p>
          </div>
        ) : (
          <div className="flex flex-col w-[450px] h-[440px] mt-5 px-3 py-4 border border-b-gray-400 rounded-lg">
            <div className="flex flex-col gap-3 ">
              <h2 className="font-poppins font-bold text-lg tracking-tight underline">Workspace Details</h2>
              <p className="flex gap-3 font-poppins font-semibold text-md tracking-tight items-center">
                <BsPersonWorkspace className="size-5 text-gray-700" />
                Workspace ID:
                <span className="font-normal flex items-center gap-3">
                  {preferenceData.workspaceId} <IoCopy className="size-4 cursor-pointer" onClick={() => handleCopy(preferenceData.workspaceId)} />
                </span>
              </p>
              <p className="flex gap-3 font-poppins font-semibold text-md tracking-tight items-center">
                <IoScale className="size-5 text-gray-700" />
                Scale Type:{" "}
                <span className="font-normal flex items-center gap-3">
                  {preferenceData.scaleTypePreference} <IoCopy className="size-4 cursor-pointer" onClick={() => handleCopy(preferenceData.scaleTypePreference)} />
                </span>
              </p>
              <Separator />
              <h2 className="font-poppins font-bold text-lg tracking-tight underline">Preference Details</h2>
              <p className="flex gap-3 font-poppins font-semibold text-md tracking-tight items-center">
                <MdWork className="size-5 text-gray-700" />
                Brand Name:{" "}
                <span className="font-normal flex items-center gap-3">
                  {preferenceData.brandName} <IoCopy className="size-4 cursor-pointer" onClick={()=> handleCopy(preferenceData.brandName)} />
                </span>
              </p>
              <p className="flex gap-3 font-poppins font-semibold text-md tracking-tight items-center">
                <MdProductionQuantityLimits className="size-5 text-gray-700" />
                Product Name:{" "}
                <span className="font-normal flex items-center gap-3">
                  {preferenceData.productName} <IoCopy className="size-4 cursor-pointer" onClick={() => handleCopy(preferenceData.productName)} />
                </span>
              </p>
              <div className="flex flex-col gap-1">
                <p className="flex gap-3 font-poppins font-semibold text-md tracking-tight items-center">
                  <FaCircleQuestion className="size-5 text-gray-700" /> Question Displayed:
                </p>
                <span className="font-normal flex items-center gap-3 ml-7">( {preferenceData.questionToDisplay} )</span>
              </div>
              <Separator />
              <p className="flex gap-3 font-poppins font-semibold text-md tracking-tight items-center">
                <MdAccessTimeFilled className="size-5 text-gray-700" /> Created:
                <span className="font-normal flex items-center gap-3">
                  {formatDate(preferenceData.createdAt)} 
                </span>
              </p>
              {preferenceData.createdAt !== preferenceData.updatedAt && (
                <p className="flex gap-3 font-poppins font-semibold text-md tracking-tight items-center">
                  <MdAccessTimeFilled className="size-5 text-gray-700" /> Last Updated:
                  <span className="font-normal flex items-center gap-3">
                    {formatDate(preferenceData.updatedAt)}
                  </span>
                </p>
              )}
            </div>
            <div className="mt-8 mb-10 text-right">
              <button className="font-poppins py-2 px-4 bg-green-800 text-white rounded-lg md:text-md text-sm">Update Preference</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Preferences;

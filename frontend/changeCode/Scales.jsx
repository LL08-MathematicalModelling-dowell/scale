import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import npsScale from "../../assets/nps-scale.png";
import npsImage from "../../assets/npsImageNew.svg";
import {
  getAvailablePreferences,
  getUserScales,
  saveLocationData,
  scaleResponse,
} from "../../services/api.services";
import LikertScale from "../LikertScale/LikertScale";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import { useCurrentUserContext } from "@/contexts/CurrentUserContext";
import {
  workspaceNamesForLikert,
  workspaceNamesForNPS,
} from "@/data/Constants";
import { decodeToken } from "@/utils/tokenUtils";

export default function Scales() {
  const [submitted, setSubmitted] = useState(-1);
  const hasLocationDataBeenSaved = useRef(false);
  const { defaultScaleOfUser, setDefaultScaleOfUser } = useCurrentUserContext();
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
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const workspace_id = searchParams.get("workspace_id");
  const username = searchParams.get("username");
  const scale_id = searchParams.get("scale_id");
  const channel = searchParams.get("channel");
  const instance = searchParams.get("instance_name");
  const scaleType = searchParams.get("scale_type");
  console.log("scale type ", scaleType);
  const [openModal, setOpenModal] = useState(false);

  const allParamsPresent =
    workspace_id && username && scale_id && channel && instance;

  const buttons = Array.from({ length: 11 }, (_, i) => i);

  useEffect(() => {
    if (!hasLocationDataBeenSaved.current && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        const locationData = {
          latitude,
          longitude,
          workspaceId: workspace_id,
          event: "scanned",
          scaleId: scale_id,
        };

        try {
          await saveLocationData(locationData);
          hasLocationDataBeenSaved.current = true; // Mark as saved
          console.log("locationData saved", locationData);
        } catch (error) {
          console.error("Failed to save location data", error);
        }
      });
    }
  }, [workspace_id, scale_id]);

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
      if (
        workspaceNamesForNPS.includes(
          decodedTokenForWorkspaceName.workspace_owner_name
        )
      ) {
        setDefaultScaleOfUser("nps");
      } else if (
        workspaceNamesForLikert.includes(
          decodedTokenForWorkspaceName.workspace_owner_name
        )
      ) {
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
          const response = await getAvailablePreferences(
            accessKey.workspace_id,
            accessKey.portfolio_username
          );
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

  async function handleClick(index) {
    setSubmitted(index);
    console.log("here is the index", index);
    if (!allParamsPresent) {
      return;
    }
    // const url = `https://100035.pythonanywhere.com/addons/create-response/v3/?user=True&scale_type=${scaleType}&channel=${channel}&instance=${instance}&workspace_id=${workspace_id}&username=${username}&scale_id=${scale_id}&item=${scaleType == "nps" ? index : index + 1}`;

    // window.location.href = url;
    try {
      const response = await scaleResponse(
        false,
        scaleType,
        channel,
        instance,
        workspace_id,
        username,
        scale_id,
        index
      );
      console.log("API Response:", response.data);
      setOpenModal(true);
    } catch (error) {
      console.error("Failed to fetch scale response:", error);
      alert("Unable to submit your response. Please try again.");
    }
  }

  const handleClose = () => {
    setOpenModal(false);
    window.location.href = "https://dowellresearch.sg/";
  };

  if (!allParamsPresent) {
    return (
      <div className="h-full w-screen flex flex-col justify-center items-center p-4 bg-gray-50">
        <div className="flex flex-col items-center bg-red-100 p-8 rounded-lg shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-14 h-14 text-red-600 mb-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 8v4M12 16h.01M21.9 10.18a10 10 0 1 1-1.8-1.8M12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20z"></path>
          </svg>
          <p className="text-2xl font-bold text-red-700">Unauthorized Access</p>
          <p className="text-lg text-red-600 mt-2 text-center">
            You do not have the necessary permissions to view this page.
          </p>
        </div>
      </div>
    );
  }

  return scaleType == "nps" ? (
    <div className="h-full w-screen relative pb-16 pt-5">
      <div className="w-full flex flex-col justify-center items-center p-2">
        <img
          className="w-[100px]"
          src="https://dowellfileuploader.uxlivinglab.online/hr/logo-2-min-min.png"
          alt="Dowell Logo"
        />
      </div>
      <div>
        <div className="flex flex-col justify-center items-center p-2 mt-10 sm:mt-0 gap-4">
          <img
            src={npsImage}
            alt="NPS Scale"
            className="w-[250px] sm:w-[350px]"
          />
          {/* Default Question */}
          <p className="font-bold text-red-500 sm:text-[25px] text-[18px] text-center">
            {preferenceData.questionType}
          </p>
          <p className="sm:text-[18px] text-[14px] text-center">
            Tell us what you think using the scale below!
          </p>
        </div>
      </div>

      <div className="flex justify-center items-center gap-1 md:gap-3 mt-12 sm:m-5">
        <style>
          {`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
            
            .loader {
              display: inline-block;
              width: 20px;
              height: 20px;
              border: 3px solid rgba(255, 255, 255, 0.3);
              border-radius: 50%;
              border-top-color: #fff;
              animation: spin 1s linear infinite;
            }
          `}
        </style>
        {buttons.map((button, index) => (
          <button
            key={index}
            className={`sm:px-5 sm:p-2 p-[2px] px-[8px] rounded-full font-bold text-[14px] md:text-[20px]
              hover:bg-blue-600 transition-colors ${
                submitted === index
                  ? "bg-blue-600 text-white flex justify-center items-center"
                  : "bg-[#ffa3a3]"
              }`}
            onClick={() => handleClick(index)}
            disabled={submitted !== -1}
          >
            {submitted === index ? <div className="loader"></div> : button}
          </button>
        ))}
      </div>
      {/* {scaleType === "likert" && (<div className="flex w-full items-center justify-center my-8">
        <p>{'1- Won\'t Recommend'}</p>
        <p className="ml-4 sm:ml-28">{'5- Highly Recommend'}</p>
      </div>)} */}
      <p className="w-full absolute bottom-0 mt-4 flex justify-center items-center text-[12px] sm:text-[14px]">
        Powered by uxlivinglab
      </p>
      <Dialog open={openModal} onClose={handleClose}>
        <DialogTitle>Thank You!</DialogTitle>
        <DialogContent>
          <p>Thank you for your response.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  ) : (
    <LikertScale />
  );
}

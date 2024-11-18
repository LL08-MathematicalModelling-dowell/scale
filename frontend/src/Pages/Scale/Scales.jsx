import {useState, useEffect, useRef} from "react";
import {useLocation, useNavigate} from "react-router-dom";
// import npsScale from "../../assets/nps-scale.png";
import npsImage from "../../assets/npsImageNew.svg"
import {getAvailablePreferences, getUserScales, saveLocationData, scaleResponse} from "../../services/api.services";
import LikertScale from "../LikertScale/LikertScale";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import { useCurrentUserContext } from "@/contexts/CurrentUserContext";
import { workspaceNamesForLikert, workspaceNamesForNPS } from "@/data/Constants";
import { decodeToken } from "@/utils/tokenUtils";

const  LikertScales = () => {
  const [submitted, setSubmitted] = useState(-1);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const hasLocationDataBeenSaved = useRef(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const workspace_id = searchParams.get("workspace_id");
  const username = searchParams.get("username");
  const scale_id = searchParams.get("scale_id");
  const channel = searchParams.get("channel");
  const instance = searchParams.get("instance_name");
  const scaleType = searchParams.get("scale_type");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const allParamsPresent =
    workspace_id && username && scale_id && channel && instance;

  useEffect(() => {
    if (!hasLocationDataBeenSaved.current && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        setLongitude(longitude);
        setLatitude(latitude);

        const locationData = {
          latitude,
          longitude,
          workspaceId: workspace_id,
          event: "scanned",
          scaleId: scale_id,
        };

        try {
          await saveLocationData(locationData);
          hasLocationDataBeenSaved.current = true;
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

  // useEffect(() => {
  //   if (!accessToken || !refreshToken) {
  //     navigate("/voc");
  //   } else {
  //     const decodedTokenForWorkspaceName = decodeToken(accessToken);
  //     if (workspaceNamesForNPS.includes(decodedTokenForWorkspaceName.workspace_owner_name)) {
  //       setDefaultScaleOfUser("nps");
  //     } else if (workspaceNamesForLikert.includes(decodedTokenForWorkspaceName.workspace_owner_name)) {
  //       setDefaultScaleOfUser("likert");
  //     }
  //   }
  // }, [accessToken, refreshToken, navigate, setDefaultScaleOfUser]);

  // useEffect(() => {
  //   const fetchScaleId = async () => {
  //     let scale_id = localStorage.getItem("scale_id");
  //     if (!scale_id && defaultScaleOfUser) {
  //       try {
  //         const decodedToken = decodeToken(accessToken);
  //         const response = await getUserScales({
  //           workspace_id: decodedToken.workspace_id,
  //           portfolio: decodedToken.portfolio,
  //           type_of_scale: defaultScaleOfUser,
  //           accessToken,
  //         });
  //         scale_id = response?.data?.response[0]?.scale_id;
  //         setScaleId(scale_id);
  //         return scaleId
  //       } catch (error) {
  //         showAlert("Error fetching user scales", "red");
  //         console.log(error);
  //       }
  //     } else {
  //       setScaleId(scale_id);
  //     }
  //   };

  //   if (defaultScaleOfUser) fetchScaleId();
  // }, [defaultScaleOfUser, accessToken]);

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
            console.log(response.data.response)
            showAlert("User preferences fetched successfully", "green");
          } else {
            showAlert("No preference data found", "yellow")

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
        showAlert("Access key not found") 
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

    try {
      const response = await scaleResponse(
        false,
        scaleType,
        channel,
        instance,
        workspace_id,
        username,
        scale_id,
        submitted
      );
      console.log("API Response:", response.data);
    } catch (error) {
      console.error("Failed to fetch scale response:", error);
      alert("Unable to submit your response. Please try again.");
    }
  };

  const handleCancel = () => {
    setFeedback("");
    setName("");
    setEmail("");
  };

  const handleSubmit = async () => {
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    setLoadingSubmit(true);
    try {
      if (submitted !== -1) {
        await sendEmail({
          message: feedback,
          email,
          scale_name: scaleType,
          score: submitted,
          channel,
          instance,
          username: name || username,
        });
        console.log("Email sent successfully.");

        const currentDate = new Date();

        const year = currentDate.getFullYear();
        const month = currentDate.toLocaleString("default", { month: "long" });
        const day = currentDate.getDate().toString().padStart(2, "0");
        const hours = currentDate.getHours().toString().padStart(2, "0");
        const minutes = currentDate.getMinutes().toString().padStart(2, "0");

        const formattedDate = `${year}-${month} ${day} ${hours}:${minutes}`;

        const payload = {
          workspaceId: workspace_id,
          customerName: name || "Anonymous User",
          customerEmail: email || "Anonymous Email",
          location: "",
          latitude,
          longitude,
          scaleResponse: submitted,
          description: feedback,
          type: getInstanceDisplayName(window.location.href),
          formattedDate: formattedDate,
        };

        await sendFeedbackEmail(payload);
        console.log("feedback sent successfully.");

        setOpenModal(true);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Unable to send the email. Please try again.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleClose = () => {
    setOpenModal(false);
    window.location.href = "https://dowellresearch.sg/";
  };

  const getInstanceDisplayName = (url) => {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    const instanceDisplayName = params.get("instance_display_name");
    return decodeURIComponent(instanceDisplayName);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 overflow-x-hidden">
      <div className="flex flex-col items-center w-full max-w-full p-4 rounded-lg bg-card md:max-w-lg">
        <h2 className="text-xl md:text-3xl font-bold text-[#FD4704] mb-4 text-center">
          Are you satisfied with our service?
        </h2>
        <div className="flex items-center mt-4 space-x-2 justify-evenly sm:space-x-4">
          {[voc1, voc2, voc3, voc4, voc5].map((emoji, index) => (
            <div className="relative" key={index}>
              <img
                src={emoji}
                onClick={() => setSubmitted(index + 1)}
                className={`cursor-pointer 
                                        ${
                                          submitted === index + 1
                                            ? `border-2 ${
                                                submitted == 1
                                                  ? "border-red-500"
                                                  : submitted == 2
                                                  ? "border-orange-500"
                                                  : submitted == 3
                                                  ? "border-yellow-400"
                                                  : submitted == 4
                                                  ? "border-[#acd91a]"
                                                  : "border-green-700"
                                              } rounded`
                                            : ""
                                        }`}
                alt={`emoji-${index + 1}`}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return scaleType == "nps" ? (
    <div className="h-full w-screen relative pb-16 pt-5">
      <div className="w-full flex flex-col justify-center items-center p-2">
        <img className="w-[100px]" src="https://dowellfileuploader.uxlivinglab.online/hr/logo-2-min-min.png" alt="Dowell Logo" />
      </div>
      <div>
      <div className="flex flex-col justify-center items-center p-2 mt-10 sm:mt-0 gap-4">
        <img src={npsImage} alt="NPS Scale" className="w-[250px] sm:w-[350px]" />
        {/* Default Question */}
        <p className="font-bold text-red-500 sm:text-[25px] text-[18px] text-center">{preferenceData.questionType}</p>
        <p className="sm:text-[18px] text-[14px] text-center">Tell us what you think using the scale below!</p>
      </div>
      </div>

        <div className="flex items-center justify-between w-full mb-4">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="text-sm text-[#5f5f5f]">Powered by</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>

        <div className="flex flex-row items-center justify-between w-full">
          <img
            src={voc}
            className="h-[60px] w-[60px] md:h-[80px] md:w-[80px]"
          />
          <footer className="text-sm text-center text-muted-foreground">
            <strong className="text-[#5f5f5f] text-lg md:text-xl">
              DoWell Voice of Customers
            </strong>
            <p className="text-[#8d6364] text-xs md:text-sm">
              Innovating from people’s minds
            </p>
            <a
              href="mailto:dowell@dowellresearch.sg"
              className="text-[#5f5f5f] text-xs md:text-sm"
            >
              dowell@dowellresearch.sg
            </a>
          </footer>
          <a href="https://l.ead.me/meetuxlivinglab" target="blank">
            <img
              src={helpMe}
              className="h-[60px] w-[60px] md:h-[80px] md:w-[80px] cursor-pointer"
            />
          </a>
        </div>

        <p className="text-xs text-red-400">
          {getInstanceDisplayName(window.location.href)}
        </p>
      </div>

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
  );
};

export default LikertScale;

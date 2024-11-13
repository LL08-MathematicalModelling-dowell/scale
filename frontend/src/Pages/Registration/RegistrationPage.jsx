import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import Logo from "../../assets/VOC.png";
import CircularProgress from "@mui/material/CircularProgress";
import {sendOtpServices, validateOtpServices, emailServiceForUserDetails} from "../../services/api.services";
import Pattern  from "../../assets/Pattern.png"

const Registration = () => {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValidated, setOtpValidated] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  let workspaceName = queryParams.get("workspace_name");

  if (!workspaceName) {
    workspaceName = "VOCABC";
  }

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.log("Error getting location:", error);
          setStatusMessage("Failed to get location. Please ensure location services are enabled.");
          setIsSuccess(false);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleUserIdChange = (e) => setUserId(e.target.value);
  const handleOtpChange = (e) => setOtp(e.target.value);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await sendOtpServices(email, userId);
      if (response.data.success) {
        setStatusMessage(response.data.message);
        setIsSuccess(true);
        setOtpSent(true);
      } else {
        setStatusMessage(response.data.message || "Failed to send OTP. Please try again.");
        setIsSuccess(false);
      }
    } catch (error) {
      console.log(error);

      setStatusMessage("Failed to send OTP. Please try again.");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await validateOtpServices(email, userId, otp);
      if (response.data.success) {
        setStatusMessage("OTP validated successfully.");
        setIsSuccess(true);
        setOtpValidated(true);
      } else {
        setStatusMessage(response.data.message || "Failed to validate OTP. Please try again.");
        setIsSuccess(false);
      }
    } catch (error) {
      console.log(error);

      setStatusMessage("Failed to validate OTP. Please try again.");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await emailServiceForUserDetails(email, userId, latitude, longitude, workspaceName);
      if (response.data.success) {
        setStatusMessage(response.data.message);
        setIsSuccess(true);
        const timeoutId = setTimeout(() => {
          navigate("/voc");
        }, 2000);

        // Clear timeout if component unmounts
        return () => clearTimeout(timeoutId);
      } else {
        setStatusMessage(response.data.message);
        setIsSuccess(false);
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.message;
      setStatusMessage(errorMessage);
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleHome = () => navigate("/voc");

  return (
    <div className="min-h-screen max-w-full flex">
      {/* Left */}
      <div className="w-1/2 bg-white  flex justify-center items-center"   style={{
          backgroundImage: `url(${Pattern})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}>

      </div>


      {/* right */}
      <div className="w-1/2  flex flex-col justify-center items-center">
      <img src={Logo} className="w-48 h-auto mb-8" alt="VOC Logo" />
      <form className="w-full max-w-sm flex flex-col gap-4 items-center" onSubmit={otpValidated ? handleSendEmail : otpSent ? handleValidateOtp : handleSendOtp}>
        <input type="text" name="userId" placeholder="Enter your User ID" className="bg-white border border-gray-300 w-full p-2.5 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500" required value={userId} onChange={handleUserIdChange} />
        <input type="email" name="email" placeholder="Enter your email" className="bg-white border border-gray-300 w-full p-2.5 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500" required value={email} onChange={handleEmailChange} />

        {otpSent && !otpValidated && <input type="text" name="otp" placeholder="Enter the OTP" className="bg-white border border-gray-300 w-full p-2.5 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500" required value={otp} onChange={handleOtpChange} />}

        <div className="w-full flex gap-4">
          <button type="button" className="w-full py-2 text-sm font-semibold rounded-md bg-gray-300 hover:bg-gray-400 text-gray-800 transition-colors duration-300" onClick={handleHome}>
            Cancel
          </button>
          <button type="submit" className={`w-full py-2 text-sm font-semibold rounded-md transition-colors duration-300 ${loading ? "bg-blue-300 cursor-not-allowed text-gray-700" : "bg-blue-600 hover:bg-blue-700 text-white"}`} disabled={loading}>
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <CircularProgress color="inherit" size={20} />
                {otpValidated ? "Sending Email..." : otpSent ? "Verifying OTP..." : "Sending OTP..."}
              </div>
            ) : otpValidated ? (
              "Submit"
            ) : otpSent ? (
              "Verify OTP"
            ) : (
              "Send OTP"
            )}
          </button>
        </div>

        {statusMessage && <p className={`mt-2 text-center font-semibold ${isSuccess ? "text-green-600" : "text-red-600"}`}>{statusMessage}</p>}
      </form>
      </div>
    </div>
  );
};

export default Registration;

/* eslint-disable react/no-unescaped-entities */
// import { Separator } from "@/components/ui/separator";
import CircularProgress from "@mui/material/CircularProgress";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../../assets/VOC.png";
import {
  createPreferenceApi,
  getAPIServerStatus,
  getAvailablePreferences,
  getUserCredentialsByPin,
  getUserLogin,
} from "../../services/api.services";
import { decodeToken } from "@/utils/tokenUtils";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const [loginType, setLoginType] = useState("");
  const [longitude, setLongitude] = useState(null);

  const [formData, setFormData] = useState({
    workspace_name: "",
    portfolio: "",
    password: "",
    pin: ["", "", "", ""],
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [isReadOnly, setIsReadOnly] = useState({
    workspace_name: false,
    portfolio: false,
    password: false,
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const workspaceName = queryParams.get("workspace_name");
    const portfolio = queryParams.get("portfolio");
    const password = queryParams.get("password");

    if (workspaceName) {
      setIsOpen(false);
      setFormData((prevData) => ({
        ...prevData,
        workspace_name: workspaceName,
      }));
      setIsReadOnly((prevReadOnly) => ({
        ...prevReadOnly,
        workspace_name: true,
      }));
    }

    if (portfolio === "VOCABC10001") {
      setFormData((prevData) => ({
        ...prevData,
        portfolio: portfolio,
        password: "VocaB0090*",
      }));
      setIsReadOnly((prevReadOnly) => ({
        ...prevReadOnly,
        portfolio: true,
        password: true,
      }));
    }
    if (portfolio) {
      setFormData((prevData) => ({
        ...prevData,
        portfolio: portfolio,
      }));
      setIsReadOnly((prevReadOnly) => ({
        ...prevReadOnly,
        portfolio: true,
        password: true,
      }));
    }

    if (password) {
      setFormData((prevData) => ({
        ...prevData,
        password: password,
      }));
      setIsReadOnly((prevReadOnly) => ({
        ...prevReadOnly,
        portfolio: true,
        password: true,
      }));
    }

    checkServerHealth();
    getLocation();
  }, [location.search]);

  const checkServerHealth = async () => {
    try {
      const response = await getAPIServerStatus();
      setHealthStatus(response.data.success ? "healthy" : "Unhealthy");
    } catch (error) {
      console.log(error);
      setHealthStatus("Unhealthy");
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          setStatusMessage("Unable to retrieve location.");
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setStatusMessage("Geolocation is not supported by this browser.");
    }
  };

  const getPinAsString = () => formData.pin.join("");

  const login = async (credentials) => {
    try {
      const response = await getUserLogin(credentials);
      if (response.status === 200 && response.data.success) {
        const result = response.data;
        localStorage.setItem("refreshToken", result.refresh_token);
        localStorage.setItem("accessToken", result.access_token);
        localStorage.setItem("workspaceName", credentials.workspace_name);
        checkAvailablePreference()
        return result;
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      if (error.response) {
        // Server responded with a status other than 200 range
        console.error("Login error - Server response:", error.response.data);
        if (error.response.status === 500) {
          setStatusMessage("Server error. Please try again later.");
        } else if (error.response.status === 400) {
          setStatusMessage(
            "Invalid credentials. Please check your login details."
          );
        } else {
          setStatusMessage("An error occurred. Please try again.");
        }
      } else if (error.request) {
        // Request was made but no response was received
        console.error("Login error - No response received:", error.request);
        setStatusMessage(
          "Network error. Please check your internet connection."
        );
      } else {
        // Something else caused an error
        console.error("Login error:", error.message);
        setStatusMessage("An unexpected error occurred. Please try again.");
      }
      throw error;
    }
  };


useEffect(()=>{

})

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    let credentials = {
      workspace_name: formData.workspace_name,
      portfolio: formData.portfolio,
      password: formData.password,
      latitude,
      longitude,
    };

    try {
      if (loginType === "PIN") {
        const completePin = getPinAsString();
        const pinResponse = await getUserCredentialsByPin(completePin);

        // Assign the credentials from the API response
        if (pinResponse.status === 200) {
          const pinCredentials = pinResponse.data.response;
          console.log(pinCredentials[0].user_id);

          credentials = {
            workspace_name: pinCredentials[0].product_id,
            portfolio: pinCredentials[0].customer_id,
            password: pinCredentials[0].password,
            latitude,
            longitude,
          };
        } else {
          throw new Error("Failed to retrieve credentials with pin.");
        }
      }

      const loginResponse = await login(credentials);
      if (loginResponse.success) {
        navigate("/voc/reports");
      } else {
        setStatusMessage("Login failed.");
        console.error("Login failed:", loginResponse);
      }
    } catch (error) {
      if (error.message.includes("<!DOCTYPE")) {
        setStatusMessage(
          "Received HTML instead of JSON. Possible server issue."
        );
        console.error("Received HTML instead of JSON. Possible server issue.");
      } else {
        setStatusMessage("Error during login.");
        console.error("Error during login:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleChecked = () => {
    setIsOpen(true);
  };
  const handleUnChecked = () => {
    setIsOpen(false);
  };

  // here
  const handlePinChange = (e, index) => {
    const value = e.target.value;
    const keyPressed = e.nativeEvent.inputType; // Detect the type of input action
    const newPinArray = [...formData.pin];

    console.log(keyPressed);

    // Handle backspace
    if (keyPressed === "deleteContentBackward") {
      newPinArray[index] = ""; // Clear the current pin slot
      setFormData((prev) => ({
        ...prev,
        pin: newPinArray,
      }));

      // If it's not the first input, move focus to the previous input
      if (index > 0) {
        document.getElementById(`pin-${index - 1}`).focus();
      }
      return;
    }

    // Only allow numeric input (0-9)
    if (!/^\d*$/.test(value)) return;

    newPinArray[index] = value;

    // Update formData with the new pin value
    setFormData((prev) => ({
      ...prev,
      pin: newPinArray,
    }));

    // If a valid digit is entered, move focus to the next input unless it's the last pin input
    if (value && index < 3) {
      document.getElementById(`pin-${index + 1}`).focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);

    const newPinArray = [...formData.pin];
    for (let i = 0; i < pastedData.length; i++) {
      if (i < 4) {
        newPinArray[i] = pastedData[i];
      }
    }

    setFormData((prev) => ({
      ...prev,
      pin: newPinArray,
    }));

    // Focus the next empty input or the last input
    const nextEmptyIndex = newPinArray.findIndex((val) => !val);
    if (nextEmptyIndex !== -1 && nextEmptyIndex < 4) {
      document.getElementById(`pin-${nextEmptyIndex}`).focus();
    } else {
      document.getElementById("pin-3").focus();
    }
  };

  const handleRegister = () => {
    const queryParams = new URLSearchParams(location.search);
    const workspaceName = queryParams.get("workspace_name");
    console.log(workspaceName);
    if (!workspaceName) {
      navigate(`/voc/register`);
    } else {
      navigate(`/voc/register/?workspace_name=${workspaceName}`);
    }
  };


const checkAvailablePreference = async () => {
   const token = localStorage.getItem("accessToken")
   console.log(token)
   if(token) {
    const decodeToken2 = decodeToken(token)
    console.log(decodeToken2)
  try {
        const response = await getAvailablePreferences(decodeToken2.workspace_id, decodeToken2.portfolio_username)
        console.log(response)
        if (response.status !== 200 || response.status === 400){
          const payload = {
            "workspaceId": decodeToken2.workspace_id,
            "workspaceName": decodeToken2.workspace_owner_name,
            "portfolio": decodeToken2.portfolio,
            "userId": decodeToken2.portfolio_username,
            "scaleTypePreference": "nps",
            "scaleDesignPreference": [
              {
                "scaleType": "nps",
                "scaleId": "66b867423eac0042917104ba",
                "design": "default"
              }
            ],
            "notificationDuration": "biweekly",
            "dataType": "Real_Data",
            "productType": "voice_of_customer",
            "brandName": "default brand Name",
            "productName": "default Product Name",
            "questionToDisplay": "Default question to display"
          }          
          try {
              const createResponse = await createPreferenceApi(payload)
            console.log(createResponse)
            console.log(payload)
          } catch (error) {
            console.log(error)
          }
        }
  }catch(error) {
    console.log(error)
  }
}
}
  return (
    <div className="max-h-screen flex flex-col relative">
      <div className="flex flex-col gap-1 justify-center items-center mt-10">
        <div className="fixed right-8 top-5">
          {healthStatus && (
            <div
              className={`w-6 h-6 rounded-full ${
                healthStatus === "healthy"
                  ? "bg-green-500 animate-pulse"
                  : "bg-red-500 animate-pulse"
              }`}
              title={`Server status: ${healthStatus}`}
            />
          )}
        </div>
        <img src={Logo} width={250} height={250} alt="Dowell Logo" />
        <form
          className="md:w-[320px] min-w-64 flex flex-col gap-4 items-center"
          onSubmit={handleSubmit}
        >
          {isOpen ? null : (
            <div className="w-full gap-4 flex flex-col">
              <input
                type="text"
                name="workspace_name"
                placeholder="Enter Product ID"
                className="cursor-pointer bg-white border border-gray-300 flex font-poppins tracking-tight items-center justify-between font-medium p-2.5 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"
                required
                value={formData.workspace_name}
                onChange={handleChange}
                readOnly={isReadOnly.workspace_name}
              />
              <input
                type="text"
                name="portfolio"
                placeholder="Enter User ID"
                className="cursor-pointer bg-white border font-poppins tracking-tight border-gray-300 flex items-center justify-between font-medium p-2.5 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"
                required
                value={formData.portfolio}
                onChange={handleChange}
                readOnly={isReadOnly.portfolio}
              />
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                className="cursor-pointer bg-white border font-poppins tracking-tight border-gray-300 flex items-center justify-between font-medium p-2.5 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"
                required
                value={formData.password}
                onChange={handleChange}
                readOnly={isReadOnly.password}
              />
              <div className="flex justify-center items-center gap-2">
              <button
                    type="button"
                    className="w-40 py-2 text-sm font-semibold rounded-md bg-gray-300 hover:bg-gray-400 text-gray-800 transition-colors duration-300"
                    onClick={() =>
                      window.open("https://dowellresearch.sg/", "_blank")
                    }
                  >
                    Cancel
                  </button>
                <button
                  type="submit"
                  className={`w-40 py-2 text-sm font-semibold rounded-md transition-colors duration-300 ${
                    loading
                      ? "bg-blue-300 cursor-not-allowed text-gray-700"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <CircularProgress color="inherit" size={20} />
                      Loading...
                    </div>
                  ) : (
                    "Login"
                  )}
                </button>
              </div>
              <div className="flex gap-2 items-center justify-center">
                <p className="text-[16px] font-poppins font-normal">
                  Login with Pin ?
                </p>
                <button
                  type="button"
                  className="text-[16px] font-poppins font-semibold text-blue-800 underline cursor-pointer"
                  onClick={handleChecked}
                >
                  Click Here
                </button>
              </div>
            </div>
          )}

          {/* Pin login */}
          <div className="flex flex-col gap-4 w-full  ">
            {isOpen && (
              <div className="flex gap-6 flex-col items-center justify-center">
                <h2 className="text-[16px] font-poppins font-normal">
                  Login with PIN
                </h2>
                {/* <input
                  type="text"
                  name="pin"
                  placeholder="Enter the pin you have received via email"
                  className="cursor-pointer bg-white border border-gray-300 p-2.5 font-poppins text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"
                  value={formData.pin}
                  onChange={handleChange}
                /> */}
                <div className="flex flex-col items-center">
                  <div className="flex gap-2">
                    {formData.pin.map((value, index) => (
                      <input
                        key={index}
                        required
                        id={`pin-${index}`}
                        type="text"
                        maxLength="1"
                        value={value}
                        onChange={(e) => handlePinChange(e, index)}
                        onPaste={handlePaste}
                        className="cursor-pointer bg-white border border-gray-300 p-2.5 font-poppins text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 text-center w-12"
                      />
                    ))}
                  </div>
                  <span className="mt-2 text-gray-600 text-xs">
                    Please enter the 4 digit PIN received in your email.
                  </span>
                </div>
                <div className="flex justify-center items-center gap-2">
                  <button
                    type="button"
                    className="w-40 py-2 text-sm font-semibold rounded-md bg-gray-300 hover:bg-gray-400 text-gray-800 transition-colors duration-300"
                    onClick={() =>
                      window.open("https://dowellresearch.sg/", "_blank")
                    }
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setLoginType("PIN")}
                    type="submit"
                    className={`w-40 py-2 text-sm font-semibold rounded-md transition-colors duration-300 ${
                      loading
                        ? "bg-blue-300 cursor-not-allowed text-gray-700"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <CircularProgress color="inherit" size={20} />
                        Loading...
                      </div>
                    ) : (
                      "Login"
                    )}
                  </button>{" "}
                </div>
                <div className="flex gap-2">
                  <p className="text-[16px] font-poppins font-normal">
                    Login with Credentials ?
                  </p>
                  <button
                    type="button"
                    className="text-[16px] font-poppins font-semibold text-blue-800 underline cursor-pointer"
                    onClick={handleUnChecked}
                  >
                    Click Here
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <p className="text-[16px] font-poppins font-normal">
              Don't have an account?
            </p>
            <button
              type="button"
              className="text-[16px] font-poppins font-semibold text-blue-800 underline"
              onClick={handleRegister}
            >
              Register
            </button>
          </div>
          <button
            className="bg-[#27C65E] text-white w-32 py-1 rounded-lg transition-colors"
            onClick={() =>
              window.open("https://youtube.com/shorts/CjNZ8-wnyxQ?feature=share", "_blank")
            }
          >
            Help
          </button>
          {statusMessage && (
            <p className="mt-2 text-center text-red-600">{statusMessage}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;

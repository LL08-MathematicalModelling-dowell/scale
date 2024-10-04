import CircularProgress from "@mui/material/CircularProgress";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAPIServerStatus, getUserLogin } from "../../../services/api.services";

const LLXLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [formData, setFormData] = useState({
    workspace_name: "",
    portfolio: "",
    password: "",
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

    if (workspaceName) {
      setFormData((prevData) => ({
        ...prevData,
        workspace_name: workspaceName,
      }));
      setIsReadOnly((prevReadOnly) => ({
        ...prevReadOnly,
        workspace_name: true,
      }));
    }

    if (portfolio) {
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

  const login = async (credentials) => {
    try {
      const response = await getUserLogin(credentials);
      if (response.status === 200 && response.data.success) {
        const result = response.data;
        localStorage.setItem("refreshToken", result.refresh_token);
        localStorage.setItem("accessToken", result.access_token);
        localStorage.setItem("workspaceName", credentials.workspace_name);
        return result;
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const credentials = {
      workspace_name: formData.workspace_name,
      portfolio: formData.portfolio,
      password: formData.password,
      latitude,
      longitude,
    };

    try {
      const loginResponse = await login(credentials);
      if (loginResponse.success) {
        navigate("/llx/reports");
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

  const handleRegister = () => {
    const queryParams = new URLSearchParams(location.search);
    const workspaceName = queryParams.get("workspace_name")
    console.log(workspaceName);
    if (!workspaceName) {
      navigate(`/voc/register`);
    } else {
      navigate(`/voc/register/?workspace_name=${workspaceName}`);
    }
  };

  return (
    <div className="relative flex flex-col max-h-screen">
      <div className="flex flex-col items-center justify-center gap-1 mt-10">
        <div className="fixed right-8 top-5">
          {healthStatus && (
            <div
              className={`w-6 h-6 rounded-full ${healthStatus === "healthy"
                  ? "bg-green-500 animate-pulse"
                  : "bg-red-500 animate-pulse"
                }`}
              title={`Server status: ${healthStatus}`}
            />
          )}
        </div>
        <img src="https://dowellfileuploader.uxlivinglab.online/hr/logo-2-min-min.png" width={200} height={200} alt="Dowell Logo" />
        <h1 className="text-2xl font-bold text-red-800 mt-4 mb-2">
              DoWell Learning Level Index
        </h1>
        <form
          className="md:w-[320px] min-w-64 flex flex-col gap-4 items-center"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            name="workspace_name"
            placeholder="Enter Product ID"
            className="cursor-pointer bg-white border border-gray-300 flex items-center justify-between font-medium p-2.5 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"
            required
            value={formData.workspace_name}
            onChange={handleChange}
            readOnly={isReadOnly.workspace_name}
          />
          <input
            type="text"
            name="portfolio"
            placeholder="Enter User ID"
            className="cursor-pointer bg-white border border-gray-300 flex items-center justify-between font-medium p-2.5 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"
            required
            value={formData.portfolio}
            onChange={handleChange}
            readOnly={isReadOnly.portfolio}
          />
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            className="cursor-pointer bg-white border border-gray-300 flex items-center justify-between font-medium p-2.5 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"
            required
            value={formData.password}
            onChange={handleChange}
            readOnly={isReadOnly.password}
          />
          <button
            type="submit"
            className={`w-40 py-2 text-sm font-semibold rounded-md transition-colors duration-300 ${loading
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
          <div className="flex gap-2">
            <p className="text-[16px] font-poppins font-normal">Dont have an account? </p>
            <button
              type="button"
              className="text-[16px] font-poppins font-semibold text-blue-800 underline"
              onClick={handleRegister}
            >
              Register
            </button>
          </div>
          {statusMessage && (
            <p className="mt-2 text-center text-red-600">{statusMessage}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default LLXLoginPage;

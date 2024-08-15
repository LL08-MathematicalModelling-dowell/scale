import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../../assets/VOC.png";
import CircularProgress from "@mui/material/CircularProgress";
import { getUserLogin,getAPIServerStatus } from "../../services/api.services";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);
  const [formData, setFormData] = useState({
    workspace_name: "", 
    portfolio: "",
    password: "",
  });
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    // Extract query parameters from the URL
    const queryParams = new URLSearchParams(location.search);
    const workspaceName = queryParams.get('workspace_name');
  
    if (workspaceName) {
      setFormData(prevData => ({
        ...prevData,
        workspace_name: workspaceName
      }));
    }
  
    checkServerHealth();
  }, [location.search]);

  const checkServerHealth = async () => {
    try {
      const response = await getAPIServerStatus();
      setHealthStatus(response.data.success ? "healthy" : "Unhealthy");
    } catch (error) {
      setHealthStatus("Unhealthy");
    }
  };

  const login = async (credentials) => {
    try {
      const response = await getUserLogin(credentials); // Assuming getUserLogin uses axios
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
    };

    try {
      const loginResponse = await login(credentials);
      if (loginResponse.success) {
        navigate("/voc/reports");
      } else {
        setStatusMessage("Login failed.");
        console.error("Login failed:", loginResponse);
      }
    } catch (error) {
      if (error.message.includes("<!DOCTYPE")) {
        setStatusMessage("Received HTML instead of JSON. Possible server issue.");
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
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

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
              title={`Server status: ${healthStatus}`}  // Add a tooltip for better UX
            />
          )}
        </div>
        <img src={Logo} width={300} height={300} alt="Dowell Logo" />
        <form
          className="md:w-[320px] min-w-64 flex flex-col gap-4 items-center"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            name="workspace_name"
            placeholder="Enter Workspace Name"
            className="cursor-pointer bg-gray-100 border flex items-center justify-between font-medium p-2.5 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            required
            value={formData.workspace_name}
            onChange={handleChange}
            readOnly={!!formData.workspace_name}  // Make input read-only if workspace_name is present
          />
          <input
            type="text"
            name="portfolio"
            placeholder="Enter Portfolio ID"
            className="cursor-pointer bg-gray-100 border flex items-center justify-between font-medium p-2.5 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            required
            value={formData.portfolio}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            className="cursor-pointer bg-gray-100 border flex items-center justify-between font-medium p-2.5 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            required
            value={formData.password}
            onChange={handleChange}
          />
          <button
            type="submit"
            className={`w-40 py-2 text-sm font-semibold rounded-md ${
              loading
                ? "bg-lightblue cursor-not-allowed text-black"
                : "bg-deepblue"
            } text-white`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <CircularProgress color="success" size={20} />
                Loading...
              </div>
            ) : (
              "Confirm"
            )}
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

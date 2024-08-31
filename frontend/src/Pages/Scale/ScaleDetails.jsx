import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import QRCodeCard from "../../components/QRCodeCard/QRCodeCard";
import { FaCirclePlus } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { decodeToken } from "../../utils/tokenUtils";
import { getUserScales, saveScaleDetails, saveScaleDetailsType } from "../../services/api.services";
import { useCurrentUserContext } from "@/contexts/CurrentUserContext";

function getInstanceDisplayName(url) {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    return params.has("instance_display_name")
      ? params.get("instance_display_name")
      : null;
  } catch (error) {
    console.log(error.message);
    return null;
  }
}

const ScaleDetails = () => {
  const { defaultScaleOfUser } = useCurrentUserContext();
  const [qrCodes, setQrCodes] = useState([]);
  const [alert, setAlert] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedScaleType, setSelectedScaleType] = useState(defaultScaleOfUser == 'nps' ? 'nps' : 'likert'); // Default scale type
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentScaleType, setCurrentScaleType] = useState("");
  const [isCreateScaleLoading, setIsCreateScaleLoading] = useState(false);
  const [isNoScaleFound, setIsNoScaleFound] = useState(false);

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleScaleChange = (e) => {
    console.log('value', e.target.value);
    setCurrentScaleType(e.target.value);
  };

  const scaleOptions = [
    { value: "nps", label: "NPS" },
    { value: "nps_lite", label: "NPS Lite" },
    { value: "stapel", label: "Stapel" },
    { value: "likert", label: "Likert" },
    { value: "percent", label: "Percent" },
    { value: "percent_sum", label: "Percent Sum" },
  ];

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      navigate("/voc/");
    }
  }, [accessToken, refreshToken, navigate]);

  useEffect(() => {
    const fetchScaleDetails = async () => {
      if (!accessToken) {
        console.error("No access token found.");
        return;
      }

      setLoading(true);
      setIsNoScaleFound(false)
      try {
        const decodedPayload = decodeToken(accessToken);
        const workspaceId = decodedPayload.workspace_id;
        const portfolio = decodedPayload.portfolio;

        const response = await getUserScales({
          workspace_id: workspaceId,
          portfolio,
          type_of_scale: selectedScaleType, // Fetch data based on selected scale type
          accessToken,
        });

        const data = response.data;
        console.log("Scale Details Response:", data);

        if (data.success && data.response.length > 0) {
          setQrCodes(data.response);
          const scaleId = data.response[0].scale_id;
          localStorage.setItem("scale_id", scaleId);
        } else {
          setIsNoScaleFound(true);
          setAlert("No scale found. Please create a scale for yourself.");
        }
      } catch (error) {
        console.error("Error fetching scale details:", error);
        setAlert("Error fetching scale details.");
      } finally {
        setLoading(false);
      }
    };

    fetchScaleDetails();
  }, [accessToken, selectedScaleType, navigate]); // Re-fetch data when selected scale type changes

  const handleScaleTypeChange = (event) => {
    setSelectedScaleType(event.target.value);
  };

  const handleButtonClick = async () => {
    if (!accessToken) {
      console.error("No access token found.");
      return;
    }

    // setLoading(true);
    try {
      setIsCreateScaleLoading(true);
      const decodedPayload = decodeToken(accessToken);
      const workspaceId = decodedPayload.workspace_id;
      const portfolio = decodedPayload.portfolio;
      const hardCodedData = {
        workspace_id: workspaceId,
        username: decodedPayload.workspace_owner_name,
        portfolio,
        portfolio_username: decodedPayload.portfolio_username,
      };

      if (currentScaleType !== "nps") {
        hardCodedData.type_of_scale = currentScaleType;
      }

      console.log('>>>>>>>>>>', hardCodedData, currentScaleType);

      const response = currentScaleType === "nps"
        ? await saveScaleDetails({ hardCodedData, accessToken })
        : await saveScaleDetailsType({ hardCodedData, accessToken });
      console.log('resss>>', response);

      const data = response.data;
      console.log("Create Scale Response:", data);

      if (response.status === 200) {
        const newId = qrCodes.length ? qrCodes[qrCodes.length - 1].id + 1 : 1;
        setQrCodes([
          ...qrCodes,
          {
            id: newId,
            imageSrc: "path_to_default_image",
            qrDetails: data.qrDetails || `QR Code ${newId}`,
            scaleDetails: data.scaleDetails || "Scale Details",
          },
        ]);
        setAlert("QR Code card created successfully!");
        localStorage.setItem("scale_id", data.scale_id);
      } else {
        setAlert(data.message || "Failed to create card.");
      }
    } catch (error) {
      console.error("Error creating card:", error);
      if (error.response.status === 400) {
        setAlert(error?.response?.data?.message);
      }

    } finally {
      // setLoading(false);
      setIsCreateScaleLoading(false);
    }
  };

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [alert]);

  return (
    <div className="max-h-screen max-w-full relative">
      <Navbar />
      <div className="flex justify-end p-6 items-center gap-4">
        <label htmlFor="scale-type" className="text-lg font-semibold">
          Choose a scale type:
        </label>
        <select
          value={selectedScaleType}
          onChange={handleScaleTypeChange}
          className="p-2 border rounded"
        >
          {scaleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-col flex">
        <div className="flex mt-2 flex-col md:flex-row flex-wrap md:gap-4 p-6 gap-4">
          {loading ? (
            <div className="flex justify-center items-center w-full h-full">
              <p>Loading...</p>
            </div>
          ) : (
            isNoScaleFound ?
              <p className="w-full text-center text-lg font-semibold text-red-600 p-4">
                No scale found. Please create a scale for yourself.
              </p>
              :
              <div className="flex justify-center flex-col md:flex-row flex-wrap md:gap-4 p-1 gap-4">
                {qrCodes.map((qrCode) => (
                  <div key={qrCode._id} className="flex flex-col gap-6">
                    <div className="flex-col flex gap-2">
                      <h1 className="text-[25px] font-bold font-poppins">
                        Scale Details
                      </h1>
                      <div className="flex flex-col md:flex-row gap-6 flex-wrap">
                        {qrCode.links_details?.map((link, idx) => (
                          <QRCodeCard
                            key={idx}
                            imageSrc={link.qrcode_image_url}
                            instanceName={getInstanceDisplayName(link.scale_link)}
                            scaleLink={link.scale_link}
                            qrCodeLink={qrCode.report_link.qrcode_image_url}
                            type="scale"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex-col flex gap-2">
                      <h1 className="text-[25px] font-bold font-poppins">
                        Report Details
                      </h1>
                      <div className="flex flex-col md:flex-row gap-6">
                        <QRCodeCard
                          imageSrc={qrCode.report_link.qrcode_image_url}
                          instanceName={qrCode.username}
                          type="report"
                          qrCodeLink={qrCode.report_link.qrcode_image_url}
                          reportLink={qrCode.report_link.report_link}
                        />
                      </div>
                    </div>
                    <div className="flex-col flex gap-2">
                      <h1 className="text-[25px] font-bold font-poppins">
                        Login Details
                      </h1>
                      <div className="flex flex-col md:flex-row gap-6">
                        {qrCode.login && (
                          <QRCodeCard
                            imageSrc={qrCode.login.qrcode_image_url}
                            instanceName={qrCode.username}
                            type="login"
                            qrCodeLink={qrCode.login.qrcode_image_url}
                            loginLink={qrCode.login.login_link}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleClick}
                  className="bg-deepblue text-white shadow-xl px-2 py-2 rounded-full mt-4 md:mt-0 fixed md:bottom-[90px] bottom-[50px] md:right-12 right-8 z-10"
                >
                  <FaCirclePlus className="text-xl" />
                </button>
                {isModalOpen && (
                  <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg mx-4 md:mx-0">
                      <h2 className="text-xl font-semibold text-gray-700 mb-6 text-center">
                        Select Scale Type
                      </h2>
                      <div className="mb-6">
                        <label htmlFor="scaleType" className="block text-sm font-medium text-gray-600 mb-2">
                          Scale Type
                        </label>
                        <select
                          id="scaleType"
                          value={currentScaleType}
                          onChange={handleScaleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">-- Select Scale Type --</option>
                          {scaleOptions.map((type, index) => (
                            <option key={index} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex justify-between items-center">
                        <button
                          onClick={handleButtonClick}
                          className="bg-indigo-600 text-white px-5 py-2 rounded-md shadow-lg hover:bg-indigo-700 transition-colors"
                        >
                          {isCreateScaleLoading ? 'Loading...' : 'Create'}
                        </button>
                        <button
                          onClick={handleCloseModal}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
          )}
        </div>
      </div>
      {alert && (
        <div
          className="fixed top-24 right-4 flex items-center p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400"
          role="alert"
          style={{ zIndex: 9999 }}
        >
          <svg
            className="flex-shrink-0 inline w-4 h-4 me-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
          <span className="sr-only">Info</span>
          <div>
            <span className="font-medium">{alert}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScaleDetails;

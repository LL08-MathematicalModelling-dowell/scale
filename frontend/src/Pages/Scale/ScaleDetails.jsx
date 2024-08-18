import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import QRCodeCard from "../../components/QRCodeCard/QRCodeCard"
import { FaCirclePlus } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { decodeToken } from "../../utils/tokenUtils";
import {getUserScales, saveScaleDetails} from '../../services/api.services'

function getInstanceDisplayName(url) {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    return params.has('instance_display_name') ? params.get('instance_display_name') : null;
  } catch (error) {
    console.log(error.message);
    return null;
  }
}

const ScaleDetails = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [alert, setAlert] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateButton, setShowCreateButton] = useState(false);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

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
      try {
        const decodedPayload = decodeToken(accessToken);
        const workspaceId = decodedPayload.workspace_id;
        const portfolio = decodedPayload.portfolio;

const response = await getUserScales({workspace_id: workspaceId, portfolio, accessToken})

        const data = response.data;
        console.log("Scale Details Response:", data);

        if (data.success && data.response.length > 0) {
          setQrCodes(data.response);
          const scaleId = data.response[0].scale_id;
          localStorage.setItem("scale_id", scaleId);
        } else {
          setAlert("No scale found. Please create a scale for yourself.");
          setShowCreateButton(true);
        }
      } catch (error) {
        console.error("Error fetching scale details:", error.message);
        setAlert("Error fetching scale details.");
      } finally {
        setLoading(false);
      }
    };

    fetchScaleDetails();
  }, [accessToken, navigate]);

  const handleButtonClick = async () => {
    if (!accessToken) {
      console.error("No access token found.");
      return;
    }

    setLoading(true);
    try {
      const decodedPayload = decodeToken(accessToken);
      const workspaceId = decodedPayload.workspace_id;
      const portfolio = decodedPayload.portfolio;
      const hardCodedData = {
        workspace_id: workspaceId,
        username: decodedPayload.workspace_owner_name,
        portfolio,
        portfolio_username: decodedPayload.portfolio_username
      };

      const response = await saveScaleDetails({hardCodedData, accessToken})

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
        setShowCreateButton(false); 
      } else {
        setAlert(data.message || "Failed to create card.");
      }
    } catch (error) {
      console.error("Error creating card:", error);
      setAlert("Error creating card.");
    } finally {
      setLoading(false);
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
      <div className="flex-col flex">
        <div className="flex mt-2 flex-col md:flex-row flex-wrap md:gap-4 p-6 gap-4">
          {loading ? (
            <div className="flex justify-center items-center w-full h-full">
              <p>Loading...</p>
            </div>
          ) : (
            <div className="flex justify-center flex-col md:flex-row flex-wrap md:gap-4 p-1 gap-4">
              {qrCodes.map((qrCode) => (
                <div key={qrCode._id} className="flex flex-col gap-6">
                  <div className="flex-col flex gap-2">
                    <h1 className="text-[25px] font-bold font-poppins">Scale Details</h1>
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
                    <h1 className="text-[25px] font-bold font-poppins">Report Details</h1>
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
                    <h1 className="text-[25px] font-bold font-poppins">Login Details</h1>
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
              {showCreateButton && (
                <button
                  onClick={handleButtonClick}
                  className="bg-deepblue text-white shadow-xl px-2 py-2 rounded-full mt-4 md:mt-0 fixed md:bottom-[90px] bottom-[50px] md:right-12 right-8 z-10"
                >
                  <FaCirclePlus className="text-xl" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {alert && (
        <div
          className="fixed top-24 right-4 flex items-center p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400"
          role="alert"
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
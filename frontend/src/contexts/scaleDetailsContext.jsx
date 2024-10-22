import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserLLXScales } from "@/services/api.services";
import { decodeToken } from "@/utils/tokenUtils";
import PropTypes from 'prop-types'

const scaleDetailsContext = createContext();

export const useScaleDetailsContext = () => useContext(scaleDetailsContext);

function getParams(url) {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    const instanceDisplayName = params.get("instance_display_name");
    const channelDisplayName = params.get("channel_display_name");
    const channel = params.get("channel");
    const instanceName = params.get("instance_name");
    return {
      instanceDisplayName: instanceDisplayName ? instanceDisplayName.split(",")[0] : null,
      channelDisplayName: channelDisplayName || null,
      channel: channel || null,
      instanceName: instanceName || null,
    };

    
  } catch (error) {
    console.log(error.message);
    return null;
  }
}

export const fetchScaleDetails = async (accessToken, setSessionData, setReportUrl, setLoginUrl, setIsNoScaleFound, setAlert, setLoading, setChannelsReport ) => {
  if (!accessToken) {
    console.error("No access token found.");
    return;
  }

  setLoading(true);
  setIsNoScaleFound(false);

  try {
    const decodedPayload = decodeToken(accessToken);
    const workspaceId = decodedPayload.workspace_id;
    const portfolio = decodedPayload.portfolio;

    const response = await getUserLLXScales({
      workspace_id: workspaceId,
      portfolio,
      type_of_scale: "learning_index",
      accessToken,
    });

    const data = response.data;
    console.log("Scale Details Response:", data);

    if (data.success && data.response.length > 0) {
      const reportLinks = data.response.flatMap((item) => item.report_link || []);
      setReportUrl(reportLinks);

      const loginLinks = data.response.flatMap((item) => item.login || []);
      setLoginUrl(loginLinks);

      const instancesBySession = {};
      const channelsAndInstances = [];

      data.response.forEach((item) => {
        item.links_details.forEach((link) => {
          const { channel, instanceName, channelDisplayName, instanceDisplayName } = getParams(link.scale_link);
          if (channel && instanceName) {
            channelsAndInstances.push({ channel, instanceName });
          }

          if (channelDisplayName) {
            if (!instancesBySession[channelDisplayName]) {
              instancesBySession[channelDisplayName] = [];
            }
            instancesBySession[channelDisplayName].push({
              channel,
              instanceName,
              instanceDisplayName,
              qrcode: link.qrcode_image_url,
              scaleLink: link.scale_link,
              qrcodeImageUrl: link.qrcode_image_url,
            });
          }
        });
      });

 
     
      setChannelsReport(channelsAndInstances); 
      setSessionData(instancesBySession);
      console.log("Channels and instances:", instancesBySession);

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

export const ScaleDetailsProvider = ({ children }) => {
  const accessToken = localStorage.getItem("accessToken");
  const [sessionData, setSessionData] = useState({});
  const [reportUrl, setReportUrl] = useState([]);
  const [LoginUrl, setLoginUrl] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState("");
  const [isNoScaleFound, setIsNoScaleFound] = useState(false);
  const navigate = useNavigate();
  const [channelsReport, setChannelsReport] = useState([]);

  useEffect(() => {
    fetchScaleDetails(
      accessToken,
      setSessionData,
      setReportUrl,
      setLoginUrl,
      setIsNoScaleFound,
      setAlert,
      setLoading,
      setChannelsReport
    );
  }, [accessToken, navigate]);

  return (
    <scaleDetailsContext.Provider
      value={{
        accessToken,
        sessionData,
        setSessionData,
        reportUrl,
        setReportUrl,
        LoginUrl,
        loading,
        alert,
        isNoScaleFound,
        channelsReport,
      }}
    >
      {children}
    </scaleDetailsContext.Provider>
  );
};

ScaleDetailsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

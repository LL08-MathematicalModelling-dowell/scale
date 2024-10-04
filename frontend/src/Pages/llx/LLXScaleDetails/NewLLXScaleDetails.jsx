import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LLXNavbar from "../LLXNavBar/LLXNavBar";
import LLXCard from "@/components/LLXCard/LLXCard";
import { Separator } from "@/components/ui/separator";
import { useCurrentUserContext } from "@/contexts/CurrentUserContext";
import { decodeToken } from "@/utils/tokenUtils";
import { getUserLLXScales } from "@/services/api.services";

function getParams(url) {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    const instanceDisplayName = params.get("instance_display_name");
    const channelDisplayName = params.get("channel_display_name");
    return {
      instanceDisplayName: instanceDisplayName ? instanceDisplayName.split(",")[0] : null,
      channelDisplayName: channelDisplayName || null,
    };
  } catch (error) {
    console.log(error.message);
    return null;
  }
}

const NewLLXScaleDetails = () => {
  const { defaultScaleOfUser } = useCurrentUserContext();
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const [alert, setAlert] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNoScaleFound, setIsNoScaleFound] = useState(false);
  const [selectedScaleType, setSelectedScaleType] = useState(defaultScaleOfUser === "nps" ? "nps" : "likert");
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionData, setSessionData] = useState({});
  const [reportUrl, setReportUrl] = useState([]);
  const [LoginUrl, setLoginUrl] = useState([]);

  useEffect(() => {
    const storedSessions = localStorage.getItem("sessionData");
    if (storedSessions) {
      setSessionData(JSON.parse(storedSessions));
      console.log("Loaded sessionData from localStorage:", JSON.parse(storedSessions));
    } else {
      console.log("No stored session data found in localStorage.");
    }
  }, []);

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      navigate("/llx/");
    }
  }, [accessToken, refreshToken, navigate]);

  useEffect(() => {
    const fetchScaleDetails = async () => {
      if (!accessToken) {
        console.error("No access token found.");
        return;
      }

      if (Object.keys(sessionData).length > 0) {
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

          const LoginLinks = data.response.flatMap((item) => item.login || []);
          setLoginUrl(LoginLinks);

          const instancesBySession = {};
          data.response.forEach((item) => {
            item.links_details.forEach((link) => {
              const { channelDisplayName, instanceDisplayName } = getParams(link.scale_link);
              if (channelDisplayName) {
                if (!instancesBySession[channelDisplayName]) {
                  instancesBySession[channelDisplayName] = [];
                }
                instancesBySession[channelDisplayName].push({
                  instanceDisplayName,
                  qrcode: link.qrcode_image_url,
                  scaleLink: link.scale_link,
                  qrcodeImageUrl: link.qrcode_image_url,
                });
              }
            });
          });

          console.log("Instances by Session:", instancesBySession);
          setSessionData(instancesBySession);
          localStorage.setItem("sessionData", JSON.stringify(instancesBySession));
          console.log("Saved sessionData to localStorage:", instancesBySession);
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
  }, [accessToken, navigate]);

  const handleScaleTypeChange = (event) => {
    setSelectedScaleType(event.target.value);
  };

  const filteredSessions = Object.keys(sessionData).filter((sessionName) =>
    sessionName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen max-w-full relative">
      <LLXNavbar />
      <div className="flex flex-col py-8 px-4 gap-9 relative">
        <div className="flex w-full justify-between items-center md:flex-row flex-col">
          <div>
            <input
              type="text"
              placeholder="Search for sessions"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-[10px] border-gray-400 border px-2 rounded-md w-[400px] font-poppins text-[14px] tracking-tight"
            />
          </div>
          <div className="flex justify-end p-6 items-center gap-4">
            <label htmlFor="scale-type" className="text-lg font-semibold">
              Choose a scale type:
            </label>
            <select
              id="scale-type"
              value={selectedScaleType}
              onChange={handleScaleTypeChange}
              className="p-2 border rounded"
            >
              <option defaultValue="learning Index" value="Learning Index">
                Learning Index
              </option>
            </select>
          </div>
        </div>
        <Separator />
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : isNoScaleFound ? (
          <div className="text-center text-gray-500">{alert}</div>
        ) : filteredSessions.length > 0 ? (
          filteredSessions.map((sessionName) => (
            <div key={sessionName} className="w-full">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h1
                    className="font-bold tracking-tight text-md md:text-2xl font-poppins mb-2"
                    style={{ lineHeight: "1" }}
                  >
                    {sessionName}
                  </h1>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-10 gap-2 md:gap-1">
                {sessionData[sessionName].map((instance, index) => (
                  <LLXCard
                    key={index}
                    instance={instance.instanceDisplayName}
                    qrcode={instance.qrcode}
                    scaleLink={instance.scaleLink}
                    type="session"
                    qrcodeImageUrl={instance.qrcodeImageUrl}
                  />
                ))}
              </div>
              <Separator className="mt-10" />
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">No sessions found</div>
        )}

        <div className="flex flex-col">
          <h1 className="font-bold tracking-tight text-md md:text-2xl font-poppins mb-2">Report Link</h1>
          <div className="grid md:grid-cols-10 grid-cols-1 gap-2 md:gap-1">
            {reportUrl.map((item, idx) => (
              <LLXCard key={idx} qrcodeImageUrl={item.qrcode_image_url} reportLink={item.report_link} type="report" qrcode={item.qrcode_image_url} />
            ))}
          </div>
        </div>
        <Separator />

        <div className="flex flex-col">
          <h1 className="font-bold tracking-tight text-md md:text-2xl font-poppins mb-2">Login Link</h1>
          <div className="grid md:grid-cols-10 grid-cols-1 gap-2 md:gap-1">
            {LoginUrl.map((item, idx) => (
              <LLXCard key={idx} qrcodeImageUrl={item.qrcode_image_url} LoginLink={item.login_link} type="login" qrcode={item.qrcode_image_url} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewLLXScaleDetails;

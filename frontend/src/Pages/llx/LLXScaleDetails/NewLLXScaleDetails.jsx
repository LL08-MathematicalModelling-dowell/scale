import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LLXNavbar from "../LLXNavBar/LLXNavBar";
import LLXCard from "@/components/LLXCard/LLXCard";
import { HiMiniPencilSquare } from "react-icons/hi2";
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
    const channel = params.get("channel"); // Extract channel
    const instanceName = params.get("instance_name"); // Extract instance_name

    return {
      instanceDisplayName: instanceDisplayName ? instanceDisplayName.split(",")[0] : null,
      channelDisplayName: channelDisplayName || null,
      channel: channel || null, // Return the channel
      instanceName: instanceName || null, // Return the instance_name
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
  const [editedSessions, setEditedSessions] = useState(new Set()); 

  // Load session data from localStorage on initial render
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
          const extractedParamsArray = []; // Array to store channel and instance_name

          data.response.forEach((item) => {
            item.links_details.forEach((link) => {
              const { channelDisplayName, instanceDisplayName, channel, instanceName } = getParams(link.scale_link);
  
              if (channel && instanceName) {
                extractedParamsArray.push({ channel, instanceName }); // Store channel and instance_name
              }
  
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
  
          // Save the extracted array to localStorage
          localStorage.setItem("scaleParams", JSON.stringify(extractedParamsArray));
          const scaleParams = JSON.parse(localStorage.getItem("scaleParams"));
console.log(scaleParams);
          console.log("Saved scale parameters to localStorage:", extractedParamsArray);

          data.response.forEach((item) => {
            item.links_details.forEach((link) => {
              const { channelDisplayName, instanceDisplayName } = getParams(link.scale_link);
              if (channelDisplayName) {
                if (!instancesBySession[channelDisplayName]) {
                  instancesBySession[channelDisplayName] = [];
                }
               console.log(channelDisplayName)
                instancesBySession[channelDisplayName].push({
                  instanceDisplayName,
                  qrcode: link.qrcode_image_url,
                  scaleLink: link.scale_link,
                  qrcodeImageUrl: link.qrcode_image_url,
                });
              }
            });
          });

          
          // const storedSessions = localStorage.getItem("sessionData");
          // let localSessionData = storedSessions ? JSON.parse(storedSessions) : {};

          
          const mergedSessions = { ...instancesBySession };
          Object.keys(localSessionData).forEach((key) => {
            if (localSessionData[key]) {

              mergedSessions[key] = localSessionData[key];
            }
          });

          setSessionData(mergedSessions);
          localStorage.setItem("sessionData", JSON.stringify(mergedSessions));
          console.log("Merged sessionData stored in localStorage:", mergedSessions);
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

  const [editSession, setEditSession] = useState(null);
  const [newSessionName, setNewSessionName] = useState("");

  const handleSessionNameClick = (sessionName) => {
    setEditSession(sessionName);
    setNewSessionName(sessionName);
  };

  const handleSessionInputChange = (e) => {
    setNewSessionName(e.target.value);
  };

  const handleSessionNameSave = (oldSessionName) => {
    if (newSessionName.trim() === "") {
      setEditSession(null);
      return;
    }

    
    if (newSessionName !== oldSessionName && sessionData[newSessionName]) {
      alert("A session with this name already exists. Please choose a different name.");
      return;
    }

    
    if (newSessionName !== oldSessionName) {
      const updatedSessions = { ...sessionData };

      
      updatedSessions[newSessionName] = updatedSessions[oldSessionName];
      delete updatedSessions[oldSessionName]; 


      setEditedSessions((prev) => new Set(prev).add(newSessionName));


      setSessionData(updatedSessions);
      localStorage.setItem("sessionData", JSON.stringify(updatedSessions));
      console.log("Updated sessionData in localStorage:", updatedSessions);
    }

    setEditSession(null); 
  };

  const handleInstanceNameChange = (sessionName, oldInstanceName, newInstanceName) => {
    if (newInstanceName.trim() === "") {
      alert("Instance name cannot be empty.");
      return;
    }

    const updatedSessions = { ...sessionData };
    const instances = updatedSessions[sessionName].map((instance) => {
      if (instance.instanceDisplayName === oldInstanceName) {
        return { ...instance, instanceDisplayName: newInstanceName };
      }
      return instance;
    });

    updatedSessions[sessionName] = instances;
    setSessionData(updatedSessions);
    localStorage.setItem("sessionData", JSON.stringify(updatedSessions));
    console.log("Updated instance name in localStorage:", updatedSessions);
  };


  const filteredSessions = Object.keys(sessionData)
    .filter((sessionName) => sessionName.toLowerCase().includes(searchTerm.toLowerCase()));

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
            <select id="scale-type" value={selectedScaleType} onChange={handleScaleTypeChange} className="p-2 border rounded">
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
                {editSession === sessionName ? (
                  <input
                    type="text"
                    value={newSessionName}
                    onChange={handleSessionInputChange}
                    onBlur={() => handleSessionNameSave(sessionName)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSessionNameSave(sessionName);
                    }}
                    className="border-b border-gray-400 focus:outline-none text-md md:text-xl font-poppins py-1"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold tracking-tight text-md md:text-2xl font-poppins mb-2" style={{ lineHeight: "1" }}>
                      {sessionName}
                      {editedSessions.has(sessionName) && <span className="ml-2 text-red-500 text-xs">*</span>} {/* Red dot */}
                    </h1>
                    <HiMiniPencilSquare className="cursor-pointer" onClick={() => handleSessionNameClick(sessionName)} />
                  </div>
                )}
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
                    onInstanceNameChange={(newInstanceName) => handleInstanceNameChange(sessionName, instance.instanceDisplayName, newInstanceName)}
                  />
                ))}
              </div>
              <Separator className="mt-10" />
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 md:text-[16px]">No sessions found</div>
        )}

        <div className="flex flex-col">
          <h1 className={`font-bold tracking-tight text-md md:text-2xl font-poppins mb-2 ${loading ? "hidden" : "block"}`}>Report Link</h1>
          <div className="grid md:grid-cols-10 grid-cols-1 gap-2 md:gap-1">
            {reportUrl.map((item, idx) => (
              <LLXCard key={idx} qrcodeImageUrl={item.qrcode_image_url} reportLink={item.report_link} type="report" qrcode={item.qrcode_image_url} />
            ))}
          </div>
        </div>
        <Separator />

        <div className="flex flex-col">
          <h1 className={`font-bold tracking-tight text-md md:text-2xl font-poppins mb-2 ${loading ? "hidden" : "block"}`}>Login Link</h1>
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

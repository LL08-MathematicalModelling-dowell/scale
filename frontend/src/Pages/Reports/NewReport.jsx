import LineGraph from "@/components/Graph/LineGraph";
import Navbar from "@/components/Navbar/Navbar";
// import Navbar from "@/components/Navbar/Navbar";
import SelectField from "@/components/SelectField/SelectField";
import {useCurrentUserContext} from "@/contexts/CurrentUserContext";
import {workspaceNamesForLikert, workspaceNamesForNPS} from "@/data/Constants";
import { getllxReportPayload, getUserScales, getVocReport} from "@/services/api.services";
import {decodeToken} from "@/utils/tokenUtils";
import {CircularProgress} from "@mui/material";
import PropTypes from "prop-types";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import LikertReport from "../LikertReport/LikertReport";

const RectangleDiv = ({className = "", scores, type, maximumScore, npsDistribution}) => {
  if (npsDistribution) {
    const {promoter, detractor, passive} = npsDistribution;
    return (
      <div className="flex flex-col">
        <div className={`relative flex w-full h-6 rounded-full overflow-hidden ${className}`}>
          <div className="flex items-center justify-center px-2 font-bold text-white bg-red-600" style={{width: `${detractor}%`}}>
            <p>{detractor}%</p>
          </div>
          <div className="flex items-center justify-center px-2 font-bold text-black bg-yellow-500" style={{width: `${passive}%`}}>
            <p>{passive}%</p>
          </div>
          <div className="flex items-center justify-center px-2 font-bold text-white bg-green-600" style={{width: `${promoter}%`}}>
            <p>{promoter}%</p>
          </div>
        </div>
      </div>
    );
  } else {
    const constrainedYellowPercent = scores;
    const greenPercent = 100 - constrainedYellowPercent;
    console.log(maximumScore);

    return (
      <div className="flex flex-col">
        <div className={`relative flex w-full h-6 rounded-full overflow-hidden ${className}`}>
          <div className="flex items-center justify-center px-4 font-bold text-black bg-yellow-500 " style={{width: `${constrainedYellowPercent + 100}%`}}>
            <p> {constrainedYellowPercent}</p>
          </div>
          <div className="flex items-center justify-center font-bold text-black border-2 border-gray-200" style={{width: `${greenPercent}%`}}>
            {"    "}
          </div>
        </div>
        {/* Labels */}
        <div className="flex justify-between w-full gap-y-2">
          <p className="text-sm font-medium font-poppins">0</p>
          <p className="text-sm font-medium font-poppins"> {type === "averageScore" ? "5" : maximumScore}</p>
        </div>
      </div>
    );
  }
};

RectangleDiv.propTypes = {
  className: PropTypes.string,
  scores: PropTypes.number,
  type: PropTypes.string,
  maximumScore: PropTypes.number,
  npsDistribution: PropTypes.object,
};

const NewReport = () => {
  // const [normalizedData, setNormalizedData] = useState([]);
  // const [channelName, setChannelName] = useState([]);
  // const [instanceName, setInstanceName] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  // const [averageScore, setAverageScore] = useState(0);
  // const [reportData, setReportData] = useState([]);
  const [displayData, setDisplayData] = useState(true);
  const [alert, setAlert] = useState(false);
  const [message, setMessage] = useState(" ");
  const [totalResponse, setTotalResponse] = useState(0);
  const [dailyCountsData, setDailyCountsData] = useState({
    labels: [],
    datasets: [],
  });
  const [duration, setDuration] = useState(null);
  const [instanceValue, setInstanceValue] = useState(null);
  const [channelValue, setChannelValue] = useState(null);
  const [instanceLoading, setInstanceLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [maxScore, setMaxScore] = useState(0);
  const [npsScore, setNpsScore] = useState(0);
  const [npsDistribution, setNpsDistribution] = useState({});
  const [channelData, setChannelData] = useState([]);
  const [instanceData, setInstanceData] = useState([]);
  const [scaleId, setScaleId] = useState("");
  const [scaleType, setScaleType] = useState(" ")
  // const [workspaceId, setWorkspaceId] = useState("");
  const [dayWise, setDayWise] = useState({
    labels: [],
    datasets: [],
  });
  const {defaultScaleOfUser, setDefaultScaleOfUser} = useCurrentUserContext();

  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  useEffect(() => {
    if (!accessToken || !refreshToken) {
      navigate("/voc");
    } else {
      const decodedTokenForWorkspaceName = decodeToken(accessToken);
      if (workspaceNamesForNPS.some((workspaceName) => workspaceName == decodedTokenForWorkspaceName.workspace_owner_name)) {
        console.log("contains");
        setDefaultScaleOfUser("nps");
      } else if (workspaceNamesForLikert.some((workspaceName) => workspaceName == decodedTokenForWorkspaceName.workspace_owner_name)) {
        setDefaultScaleOfUser("likert");
      }
    }
  }, [accessToken, refreshToken, navigate]);



  

  useEffect(() => {

    const fetchPayload = async () => {  
      let scale_id = localStorage.getItem("scale_id");
  
      if (!scale_id) {
        try {
          const decodedToken = decodeToken(accessToken);
          const response = await getUserScales({
            workspace_id: decodedToken.workspace_id,
            portfolio: decodedToken.portfolio,
            type_of_scale: defaultScaleOfUser,
            accessToken,
          });

  
          scale_id = response?.data?.response[0]?.scale_id;
          setScaleId(scale_id);
        } catch (error) {
          console.error("Error fetching user scales:", error);
          setLoading(false); 
          return;
        }
      } else {
        setScaleId(scale_id);
      }
  
      const decodedToken = decodeToken(accessToken);
      const payload = {
        workspace_id: decodedToken.workspace_id,
        scale_id: scale_id, // Use local `scale_id`
      };
      console.log(payload);
  
      try {
        setLoading(true); 
        setAlert()
        const responseList = await getllxReportPayload(payload);
        console.log(responseList);
        
        if (responseList.status === 201) {
          const responseData = responseList.data;
       const reportScaleType = responseData.data.scale_details[0].scale_type
                 console.log(responseData)
                 console.log(reportScaleType)
           setScaleType(reportScaleType);
          const getChannels = responseData.data.scale_details.flatMap((scale) =>
            scale.channel_instance_details.map((channel) => ({
              label: channel.channel_display_name,
              value: channel.channel_name,
              instances: channel.instances_details.map((instance) => ({
                label: instance.instance_display_name,
                value: instance.instance_name,
              })),
            }))
          );
          setChannelData(getChannels);
  
          const allInstances = getChannels
            .flatMap((channel) => channel.instances)
            .filter((instance, index, self) => index === self.findIndex((i) => i.value === instance.value));
          setInstanceData(allInstances);
        } else {
          setAlert(true);
          setMessage("Failed to fetch the Likert Scale Report");
        }
      } catch (error) {
        console.log("Error while fetching payload:", error);
        setAlert(true);
        setMessage("An error occurred while fetching data.");
      } finally {
        setLoading(false); // Ensure loading is set to false after all operations
      }
    };
  
    if (accessToken && refreshToken) {
      fetchPayload();
    }
  }, [accessToken, refreshToken, defaultScaleOfUser]);

  const fetchVocReport = async () => {
    let scale_id;
    const LocalStorageScaleId = localStorage.getItem("scale_id");

    if (LocalStorageScaleId != null) {
      scale_id = LocalStorageScaleId;
      setScaleId(scale_id);
    } else {
      try {
        const decodedToken = decodeToken(accessToken);
        const response = await getUserScales({
          workspace_id: decodedToken.workspace_id,
          portfolio: decodedToken.portfolio,
          type_of_scale: defaultScaleOfUser,
          accessToken,
        });
        scale_id = response?.data?.response[0]?.scale_id;
        console.log(scale_id);
      } catch (error) {
        console.error("Error fetching user scales:", error);
      }
    }
    console.log(scale_id);

    const payload = {
      scale_id: scaleId,
      channel_names: channelValue === "all" ? channelName.map((ch) => ch.value).filter((val) => val !== "all") : [`${channelValue}`],
      instance_names: [`${instanceValue}`],
      period: `${duration}`,
    };

    
    try {
      setLoading(true)
          setDisplayData(false);
          setMessage("Loading...");
        setAlert(true)
      const reportResponse = await getVocReport(payload, scaleType);
      console.log("Report Response Status:", reportResponse);
      if (reportResponse.status === 201) {
        setDisplayData(true);
        setLoading(false);
        const reportResult = reportResponse.data;
        console.log("Report Result:", reportResult);
        setTotalResponse(reportResult?.data.no_of_responses);
        setNpsScore(reportResult?.data.nps);
        const npsCount =  reportResult?.data.nps_category_distribution
        console.log(npsCount)
        const roundNps = {
          promoter: parseFloat(npsCount.promoter.toFixed(2)),
          detractor: parseFloat(npsCount.detractor.toFixed(2)),
          passive: parseFloat(npsCount.passive.toFixed(2))
        }
        console.log(roundNps)
        setNpsDistribution(roundNps);
        console.log(npsDistribution)
        const totalScoreString = reportResult?.data.total_score;
        console.log(totalScoreString);
        const maximumScore = parseInt(totalScoreString.split("/")[1], 10);
        const score = parseInt(totalScoreString.split("/")[0], 10);
        setTotalScore(score);
        setMaxScore(maximumScore || 0);
        console.log(totalScore || 0);
        console.log(maxScore || 0);

        const dailyCounts = reportResult?.data?.daily_counts || [];
        const labels = Object.keys(dailyCounts);
        const detractorData = labels.map((date) => dailyCounts[date].detractor);
        const promoterData = labels.map((date) => dailyCounts[date].promoter);
        const passiveData = labels.map((date) => dailyCounts[date].passive);
        const npsData = labels.map((date) => dailyCounts[date].nps);

        setDailyCountsData({
          labels,
          datasets: [
            {
              label: "Detractor",
              data: detractorData,
              borderColor: "#ff0000",
              backgroundColor: "rgba(255, 0, 0, 0.5)",
              fill: true,
            },
            {
              label: "Promoter",
              data: promoterData,
              borderColor: "#008000",
              backgroundColor: "#008000",
              fill: true,
            },
            {
              label: "Passive",
              data: passiveData,
              borderColor: "#EAB308",
              backgroundColor: "#EAB308",
              fill: true,
            },
          ],
        });
        setDayWise({
          labels,
          datasets: [
            {
              label: "NPS",
              data: npsData,
              borderColor: "#ff0000",
              backgroundColor: "rgba(255, 0, 0, 0.5)",
              fill: true,
            },
          ],
        });
  
      } else {
        console.log("Non-200/404 Response:", reportResponse);
        setAlert(true);
        setMessage("Failed to fetch NPS Report data");
      }
    } catch (error) {
      console.log("Catch Error: Failed to fetch Likert report data", error?.response);
      if (error.response.status === 400) {
        console.log("404 Error: Report not found:", error?.response.data?.message);
        setAlert(true);

        setMessage("NO RESPONSES FOUND");
        setDisplayData(false);
        setTotalResponse(0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (channelValue && instanceValue && duration) {
      setLoading(true)
      fetchVocReport();
    }
  }, [channelValue, instanceValue, duration]);

  const handleInputChange = (value) => {
    if (value.startsWith("ins")) {
      setInstanceValue(value);
    }
    if (value.startsWith("c")) {
      setChannelValue(value);
    }

    if (value.endsWith("days")) {
      setDuration(value);
    }
  };

  const Duration = [
    {label: "7 days", value: "seven_days"},
    {label: "15 days", value: "fifteen_days"},
    {label: "30 days", value: "thirty_days"},
    {label: "90 days", value: "ninety_days"},
  ];

  const totalScoreYellowPercent = totalScore;
  // const averageScoreYellowPercent = averageScore;

  return (
    <div className="relative max-w-full min-h-screen overflow-hidden">
      <Navbar />
      <div>
        {defaultScaleOfUser == 'nps' ? (
          <div>
            <div className=" my-3 ">
        <div className="flex  items-center justify-center">
          <h1 className="font-poppins tracking-tight text-2xl mb-4 font-bold">NET PROMOTER SCORE</h1>
        </div>
        <div className="flex flex-col items-center justify-center gap-10">
          <div className="flex flex-col justify-center gap-5 md:flex-row">
            <SelectField handleInputChange={handleInputChange} triggerClass="w-80 h-10 outline-none focus:ring-1 focus:ring-dowellLiteGreen font-medium font-poppins" placeholder="Select Channel Name" data={channelData} />
            <SelectField handleInputChange={handleInputChange} triggerClass="w-80 h-10 outline-none focus:ring-1 focus:ring-dowellLiteGreen font-medium font-poppins" placeholder="Select Instances" data={instanceData} />
            <SelectField handleInputChange={handleInputChange} triggerClass="w-80 h-10 outline-none focus:ring-1 focus:ring-dowellLiteGreen font-medium font-poppins" placeholder="Duration" data={Duration} />
          </div>

          <div className="flex gap-8">
            <h2 className="text-xl font-bold tracking-tight font-montserrat">
              Total Response: <span className="text-xl text-green-800 font-poppins">{totalResponse}</span>
            </h2>
            <h2 className="text-xl font-bold tracking-tight font-montserrat">
              NPS: <span className="text-xl text-green-800 font-poppins">{npsScore}</span>
            </h2>
          </div>
        </div>

        {displayData === false && alert === true && (
          <div className="flex items-center text-center justify-center mt-40 gap-x-3">
            <div className="">
              {loading ? <CircularProgress /> : null}
              <h3 className="text-2xl font-bold tracking-tight text-gray-500 font-poppins">{message}</h3>
              <p className="font-poppins text-gray-800 text-[15px] tracking-tight mt-1">{loading ? "Please wait while we fetching the data" : "No data response."}</p>
            </div>
          </div>
        )}
        {displayData && (
          <div className="flex flex-col items-center justify-between gap-10 mx-8 mt-8 text-center md:flex-row md:gap-10">
            {/* First Chart */}
            <div className="flex flex-col w-screen gap-2 md:w-3/5 px-7">
              <p className="font-poppins tracking-tight text-[18px] font-medium">Total Score </p>
              <RectangleDiv scores={totalScoreYellowPercent} maximumScore={maxScore} />
              <div className="mt-8">
                <p className="font-poppins text-[13px] font-medium">Response insight by</p>
                <LineGraph
                  options={{
                    scales: {
                      y: {},
                    },
                  }}
                  data={dailyCountsData}
                />
              </div>
            </div>
            {/* Second Chart */}
            <div className="flex flex-col w-screen gap-2 md:w-3/5 px-7">
              <p className="font-poppins tracking-tight text-[18px] font-medium">NPS Distribution Score</p>
              <RectangleDiv className="rounded-lg" npsDistribution={npsDistribution} type="averageScore" />
              <div className="mt-8">
                <p className="font-poppins text-[13px] font-medium">DayWise NPS</p>
                <LineGraph
                  data={dayWise}
                  options={{
                    scales: {
                      y: {
                        min: -100,
                        max: 100,
                        ticks: {
                          stepSize: 25,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      {instanceLoading == true ? (
        <div className="absolute top-0 right-0 flex items-center justify-center w-full min-h-screen bg-gray-100 ">
          <p className="text-xl font-semibold tracking-tight text-green-800 font-poppins">Please wait, while fetching VOC your report...</p>
        </div>
      ) : null}
          </div>
        ): (
          <div>
            <LikertReport/>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewReport;

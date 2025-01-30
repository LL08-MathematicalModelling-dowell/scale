
import LineGraph from "@/components/Graph/LineGraph";
// import Navbar from "@/components/Navbar/Navbar";
import SelectField from "@/components/SelectField/SelectField";
import { useCurrentUserContext } from "@/contexts/CurrentUserContext";
import { workspaceNamesForLikert, workspaceNamesForNPS } from "@/data/Constants";
import {getLikertChannelsInstances, getLikertReport, getUserScales} from "@/services/api.services";
import { decodeToken } from "@/utils/tokenUtils";
import {CircularProgress} from "@mui/material";
import PropTypes from "prop-types";
import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
// import LikertMapReport from "./likertMapReport";


const RectangleDiv = ({className = "", scores, type, maximumScore}) => {
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
};

RectangleDiv.propTypes = {
  className: PropTypes.string,
  scores: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
};

const LikertReport = () => {

  const [normalizedData, setNormalizedData] = useState([]);
  const [channelName, setChannelName] = useState([]);
  const [instanceName, setInstanceName] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [reportData, setReportData] = useState([]);
  const [displayData, setDisplayData] = useState(true);
  const [alert, setAlert] = useState(false);
  const [message, setMessage] = useState(" ");
  const [totalResponse, setTotalResponse] = useState(0);
  const [dailyCountsData, setDailyCountsData] = useState([]);
  const [channelValue, setChannelValue] = useState("channel_1");
  const [instanceValue, setInstanceValue] = useState("instance_5");
  const [duration, setDuration] = useState("ninety_days");
  const [instanceLoading, setInstanceLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [maxScore, setMaxScore] = useState(0);
  const [hasFetchedInitialReport, setHasFetchedInitialReport] = useState(false);
  const [scaleId, setScaleId] = useState("")
  const {defaultScaleOfUser, setDefaultScaleOfUser} = useCurrentUserContext();
  // const [scaleId, setScaleId] = useState("");
  // const [alert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertColor, setAlertColor] = useState("green");
  // const [accessKey, setAccessKey] = useState({});

  const [overallScoreData, setOverallScoreData] = useState({
    labels: [],
    datasets: [],
  });

  // const locations = [
  //   { lat: 7.377536, lng: -3.94704, name: "Location A" },
  //   { lat: 7.443845, lng: 3.911397, name: "Location B" },
  //   { lat: 12.98582, lng: 77.76463, name: "Location C" },
  // ];



  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  const showAlert = (message, color) => {
    setAlertMessage(message);
    setAlertColor(color);
    setAlert(true);
    setTimeout(() => {
      setAlert(false);
    }, 3000);
  };

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      navigate("/voc");
    } else {
      const decodedTokenForWorkspaceName = decodeToken(accessToken);
      if (workspaceNamesForNPS.includes(decodedTokenForWorkspaceName.workspace_owner_name)) {
        setDefaultScaleOfUser("nps");
      } else if (workspaceNamesForLikert.includes(decodedTokenForWorkspaceName.workspace_owner_name)) {
        setDefaultScaleOfUser("likert");
      }
    }
  }, [accessToken, refreshToken, navigate, setDefaultScaleOfUser]);


  useEffect(() => {
    const fetchScaleId = async () => {
      let scale_id = localStorage.getItem("scale_id");
      if (!scale_id && defaultScaleOfUser) {
        try {
          const decodedToken = decodeToken(accessToken);
          const response = await getUserScales({
            workspace_id: decodedToken.workspace_id,
            portfolio: decodedToken.portfolio,
            type_of_scale: defaultScaleOfUser,
            accessToken,
          });
          scale_id = response?.data?.response[0]?.scale_id;
          console.log(scale_id)
          setScaleId(scale_id);
          return scaleId;
        } catch (error) {
          showAlert("Error fetching user scales", "red");
          console.log(error);
        }
      } else {
        setScaleId(scale_id);
      }
    };

    if (defaultScaleOfUser) fetchScaleId();
  }, [defaultScaleOfUser, accessToken]);



  useEffect(() => {
    if (scaleId) {
      fetchLikertChannelInstances();
      fetchLikertReport();
    }
  }, [scaleId]);

  const fetchLikertChannelInstances = async () => {
  const  scale_id = scaleId
    setInstanceLoading(true);
    try {
      const channelDetailsResponse = await getLikertChannelsInstances(scale_id);
      if (channelDetailsResponse.status === 200) {
        const data = channelDetailsResponse.data;
        console.log(data)
        const channels = data?.scale_data?.channel_instance_details.map((item) => ({
          label: item.channel_display_name,
          value: item.channel_name,
        }));

         setScaleId(data?.scale_data?.scale_id)
         console.log(scaleId)

        const instances = data?.scale_data?.channel_instance_details.flatMap((item) =>
          item.instances_details.map((instance) => ({
            label: instance.instance_display_name,
            value: instance.instance_name,
          }))
        );
        setInstanceName(instances);
        setChannelName(channels);

       setChannelValue(channels[0]?.value || "channel_1");
       setInstanceValue(instances[0]?.value || "instance_5");
      } else {
        console.log("Channel API call was not successful:", channelDetailsResponse);
        setAlert(true);
        setMessage("Failed to fetch channel instances.");
      }
    } catch (error) {
      console.log("Failed to fetch Likert report data", error);
      setAlert(true);
      setMessage("An error occurred while fetching channel instances.");
    } finally {
      setInstanceLoading(false); 
    }
  };





  const fetchLikertReport = async () => {
    if (!channelValue || !instanceValue || !duration) return;

    const payload = {
      scale_id: scaleId,
      channel_names: [`${channelValue}`],
      instance_names: [`${instanceValue}`],
      period: `${duration}`,
    };

    
    setLoading(true);
    setDisplayData(false);
    setMessage("Loading...");
    try {
      const reportResponse = await getLikertReport(payload);
      console.log("Report Response Status:", reportResponse.status);

      if (reportResponse.status === 200) {
        setDisplayData(true);
        const reportResult = reportResponse.data;
        console.log("Report Result:", reportResult);

        setReportData(reportResult);

        setTotalResponse(reportResult?.report.no_of_responses);
        const totalScoreString = reportResult?.report?.total_score;
        console.log(totalScoreString);
        const maximumScore = parseInt(totalScoreString.split("/")[1], 10);
        const score = parseInt(totalScoreString.split("/")[0], 10);
        setTotalScore(score);
        setMaxScore(maximumScore || 0);
        console.log(totalScore || 0);
        console.log(maxScore || 0);

        const reportAverageScore = reportResult?.report?.average_score;
        const roundedAverageScore = parseFloat(reportAverageScore.toFixed(2));
        setAverageScore(roundedAverageScore);

        const dailyCounts = reportResult?.report?.daily_counts;
        console.log("Array of Daily Counts:", dailyCounts);

        const dailyLabels = dailyCounts ? Object.keys(dailyCounts) : [];
        const dailyDatasets = [1, 2, 3, 4, 5].map((count) => ({
          label: `${count}`,
          data: dailyLabels.map((date) => dailyCounts[date]?.[count] || 0),
          borderColor: `hsl(${count * 72}, 70%, 50%)`,
        }));

        console.log(dailyDatasets);

        setDailyCountsData({
          labels: dailyLabels,
          datasets: dailyDatasets,
        });

        const normalized = normalizeDatasets(dailyDatasets);
        setNormalizedData(normalized);

        const overallDistribution = reportResponse?.data?.report?.overall_score_distribution;
        console.log("Overall Score Distribution:", overallDistribution);

        const overallLabels = overallDistribution ? Object.keys(overallDistribution) : [];
        const overallDataset = [
          {
            label: " ",
            data: overallLabels.map((score) => overallDistribution[score] || 0),
            borderColor: "rgb(34,197,94)",
          },
        ];
        setOverallScoreData({labels: overallLabels, datasets: overallDataset});
        setHasFetchedInitialReport(true);
      } else {
        console.log("Non-200/404 Response:", reportResponse);
        setAlert(true);
        setMessage("Failed to fetch Likert Scale Report");
      }
    } catch (error) {
      console.log("Catch Error: Failed to fetch Likert report data", error?.response);
      if (error?.response.status === 404) {
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

  // useEffect(() => {
  //   fetchLikertChannelInstances();
  //   fetchLikertReport();
  // }, []);  

  useEffect(() => {
    if (hasFetchedInitialReport) {
      fetchLikertReport(); 
    }
  }, [channelValue, instanceValue, duration,]);

  const normalizeDatasets = (datasets) => {
    return datasets.map((dataset) => ({
      ...dataset,
      data: dataset.data.map((value) => value),
    }));
  };
  const optionsWithPercentage = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value + " %";
          },
        },
        title: {
          display: true,
          text: "Percentage",
          font: {
            size: 15,
            weight: "bold",
            family: "poppins",
          },
          color: "#005734",
        },
      },
      x: {
        title: {
          display: true,
          text: "Score",
          font: {
            size: 15,
            weight: "bold",
            family: "poppins",
          },
          color: "#005734",
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            return context.dataset.label + ": " + context.raw + " %";
          },
        },
      },
    },
  };

  const optionsWithoutPercentage = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value;
          },
        },
        title: {
          display: true,
          text: "Count",
          font: {
            size: 15,
            weight: "bold",
            family: "poppins",
          },
          color: "#005734",
        },
      },
      x: {
        title: {
          display: true,
          text: "Days",
          font: {
            size: 16,
            weight: "bold",
            family: "poppins",
          },
          color: "#005734",
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            return context.dataset.label + ": " + context.raw;
          },
        },
      },
    },
  };

  const lineChartDataTwo = overallScoreData;

  const handleInputChange = (value) => {
    if (value.startsWith("ins")) {
      setInstanceValue(value);
    }
    if (value.startsWith("c")) {
      setChannelValue(value);
    }

    if (value.endsWith("days")) {
      setDuration(value || "ninety_days");
    }
  }
  const Duration = [
    {label: "7 days", value: "seven_days"},
    {label: "15 days", value: "fifteen_days"},
    {label: "30 days", value: "thirty_days"},
    {label: "90 days", value: "ninety_days"},
  ];

  const totalScoreYellowPercent = totalScore;
  const averageScoreYellowPercent = averageScore;

  return (
    <div className="relative max-w-full min-h-screen">
      <div className="mx-8 my-12 ">
        <div className="flex flex-col items-center justify-center gap-10">
          <div className="flex flex-col justify-center gap-5 md:flex-row">
            <SelectField handleInputChange={handleInputChange} triggerClass="w-80 h-10 outline-none focus:ring-1 focus:ring-dowellLiteGreen font-medium font-poppins" placeholder="Select Channel Name" data={channelName} defaultValue={channelValue} />
            <SelectField handleInputChange={handleInputChange} triggerClass="w-80 h-10 outline-none focus:ring-1 focus:ring-dowellLiteGreen font-medium font-poppins" placeholder="Select Instances" data={instanceName} defaultValue={instanceValue} />
            <SelectField handleInputChange={handleInputChange} triggerClass="w-80 h-10 outline-none focus:ring-1 focus:ring-dowellLiteGreen font-medium font-poppins" placeholder="Duration" data={Duration} defaultValue={duration} />
          </div>

          <h2 className="text-xl font-bold tracking-tight font-montserrat">
            Total Response: <span className="text-xl text-green-800 font-poppins">{totalResponse}</span>
          </h2>
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
         <div>
           <div className="flex flex-col items-center justify-between gap-10 mx-12 mt-8 text-center md:flex-row md:gap-16">
            {/* First Chart */}
            <div className="flex flex-col w-screen gap-2 md:w-3/5 px-7">
              <p className="font-poppins tracking-tight text-[18px] font-medium">Total Score </p>
              <RectangleDiv scores={totalScoreYellowPercent} maximumScore={maxScore} />
              <div className="mt-8">
                <p className="font-poppins text-[13px] font-medium">Daywise Response Insights</p>
                <LineGraph options={optionsWithoutPercentage} data={{labels: dailyCountsData.labels, datasets: normalizedData}} />
              </div>
            </div>
            {/* Second Chart */}
            <div className="flex flex-col w-screen gap-2 md:w-3/5 px-7">
              <p className="font-poppins tracking-tight text-[18px] font-medium">Average Score</p>
              <RectangleDiv className="rounded-lg" scores={averageScoreYellowPercent} type="averageScore" />
              <div className="mt-8">
                <p className="font-poppins text-[13px] font-medium">Overall Score Distribution</p>
                <LineGraph options={optionsWithPercentage} data={lineChartDataTwo} />
              </div>
            </div>
       
          </div>
          {/* // <div className="flex flex-col space-y-4 mt-16">
          // <h1 className="font-poppins text-2xl tracking-tight text-center">GeoLocation Report</h1>
          // <div className="w-full rounded-xl">
          // <LikertMapReport locations={locations}/>
          // </div> */}
         {/* </div> */}
         </div>
          
        )}


      </div>

     
      {instanceLoading == true ? (
        <div className="absolute top-0 right-0 flex items-center justify-center w-full min-h-screen bg-gray-100 ">
          <p className="text-xl font-semibold tracking-tight text-green-800 font-poppins">Please wait, while fetching your report...</p>
        </div>
      ) : null}


     

    </div>
  );
};

export default LikertReport;

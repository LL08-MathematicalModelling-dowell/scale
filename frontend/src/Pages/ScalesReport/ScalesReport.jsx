import CustomHeader from "@/components/CustomHeader/CustomHeader";
import LineGraph from "@/components/Graph/LineGraph";
import SelectField from "@/components/ScaleReport/SelectField";
import {getScaleChannels, getScaleReport} from "@/services/api.services";
import Lottie from "lottie-react";
import {useEffect, useState} from "react";
import {AiFillWechat} from "react-icons/ai";
import {FaCalendar, FaClock} from "react-icons/fa";
import {GiVibratingShield} from "react-icons/gi";
import {HiMiniUsers} from "react-icons/hi2";
import {ResponsiveContainer} from "recharts";
import Animation from "../../assets/Animation.json";
import NotFound from "../../assets/NotFound.jpg";
import {CircularProgress} from "@mui/material";

const ScalesReport = () => {
  const [eDate, setDate] = useState(" ");
  const [time, setTime] = useState(" ");
  const [normalizedData, setNormalizedData] = useState([]);
  const [channelsName, setChannelName] = useState([]);
  const [instanceValue, setInstanceValue] = useState(" ");
  const [channelValue, setChannelValue] = useState(" ");
  const [durationValue, setDurationValue] = useState(" ");
  const [instances, setInstances] = useState([]);
  const [totalResponse, setTotalResponse] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [reportAlert, setReportAlert] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [dailyCountsData, setDailyCountsData] = useState([]);
  const [overallScoreData, setOverallScoreData] = useState({
    labels: [],
    datasets: [],
  });
  const [displayData, setDisplayData] = useState(false);
  const [channelMsg, setChannelMsg] = useState(" ");
  const [reportMsg, setReportMsg] = useState(" ");
  const [alert, setAlert] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [fetchChannelLoading, setFetchChannelLoading] = useState(true);

  // For Last Updated State.
  useEffect(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    const formattedTime = `${hours}:${minutes}`;
    setDate(formattedDate);
    setTime(formattedTime);
  }, []);

  // First Step
  const fetchChannel = async () => {
    let scaleId;
    
    const scale_id = "66c9d21e9090b1529d108a63";

    try {
      const channelResponse = await getScaleChannels(scale_id);
      if (channelResponse.status === 200) {
        setFetchChannelLoading(false);
        const channelData = channelResponse.data;

        // Setup channels
        const channels = channelData?.scale_data.channel_instance_details.map((item) => ({
          label: item.channel_display_name,
          value: item.channel_name,
        }));
        setChannelName(channels);

        // Setup instances

        const instance = channelData?.scale_data.channel_instance_details.flatMap((item) =>
          item.instances_details.map((instances) => ({
            label: instances.instance_display_name,
            value: instances.instance_name,
          }))
        );
        console.log(instance);
        setInstances(instance);
      } else {
        setAlert(true);
        setChannelMsg("Failed to fetch channel instances");
        setDisplayData(false);
      }
    } catch (error) {
      console.log(error);
      setFetchChannelLoading(false);
      setChannelMsg("An error occured while fetching channel instances");
      setAlert(true);
    } finally {
      setFetchChannelLoading(false);
    }
  };

  useEffect(() => {
    fetchChannel();
  }, []);

  const handleSelectChange = (value) => {
    value.startsWith("ins") ? setInstanceValue(value) : null;
    value.startsWith("c") ? setChannelValue(value) : null;
    value.endsWith("days") ? setDurationValue(value) : null;
  };

  const payload = {
    scale_id: "66c9d21e9090b1529d108a63",
    channel_names: [`${channelValue}`],
    instance_names: [`${instanceValue}`],
    period: `${durationValue}`,
  };

  const fetchChannelReports = async () => {
    setReportMsg("Loading...");
    setReportLoading(true);
    setDisplayData(false);
    try {
      const reportResponse = await getScaleReport(payload);
      if (reportResponse.status === 200) {
        setReportLoading(false);
        setDisplayData(true);

        const reportResult = reportResponse?.data.report;
        setReportData(reportResult);
        console.log(reportResult);

        //  Total Response
        const responseCount = reportResult?.no_of_responses;
        setTotalResponse(responseCount);
        //  Average Score
        const averageCount = reportResult?.average_score;
        setAverageScore(averageCount);
        // Total score
        const scoreString = reportResult?.total_score;
        const firstNum = parseInt(scoreString.split("/")[0], 10);
        const secondNum = parseInt(scoreString.split("/")[1], 10);
        setMinScore(firstNum);
        setMaxScore(secondNum);

        // dailyCounts
        const dailyCounts = reportResult?.daily_counts;
        console.log("Array of daily Counts", dailyCounts);

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
        // Daily Distrubution
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
        setReportAlert(false);
      } else {
        setAlert(true);
        setReportMsg("Failed to fetch Likert Scale Report");
      }
    } catch (error) {
      console.log("Catch Error: Failed to fetch Likert report data", error?.response);
      setChannelMsg("An error occured while fetching channel instances");
      if (error?.response.status === 404) {
        console.log("404 Error: Report not found:", error?.response.data?.message);

        setReportMsg("REPORT NOT FOUND");
        setReportAlert(true);
        setDisplayData(false);
      }
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    fetchChannelReports();
  }, [channelValue, instanceValue, durationValue]);

  const normalizeDatasets = (datasets) => {
    return datasets.map((dataset) => ({
      ...dataset,
      data: dataset.data.map((value) => value),
    }));
  };

  const lineChartDataTwo = overallScoreData;

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

  const dateDuration = [
    {
      label: "24 hours",
      value: "twenty_four_hours",
    },
    {
      label: "7 days",
      value: "seven_days",
    },
    {
      label: "30 days",
      value: "thirty_days",
    },
    {
      label: "90 days",
      value: "ninety_days",
    },
  ];
  const reportScaleVersion = ["Version 1", "Version 2", "Version 3"];
  const reportScaleLocation = ["Nigeria", "Ghana", "Kenya", "Tanzania", "Uganda", "India", "Pakistan", "Bangladesh", "Sri Lanka"];

  if (fetchChannelLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center flex-col">
        <div className="flex items-center justify-center">
          <Lottie animationData={Animation} className="w-64" />
        </div>
        <p className="font-poppins tracking-tight font-medium">Inhale... Exhale... Your report will appear soon.</p>
      </div>
    );
  }

  if (alert) {
    return (
      <div className="flex items-center justify-center w-full h-screen md:flex-row flex-col md:px-5 px-2 text-center">
        <div className="flex flex-col gap-3 ml-4 mt-12 text-center md:text-left">
          <h2 className="font-poppins tracking-tight font-medium md:text-2xl text-xl text-gray-700">{channelMsg}</h2>
          <p className="md:text-[17px] text-[15px] font-poppins tracking-tight font-medium text-gray-500">Please contact the admin, if error persists</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full min-h-screen bg-gray-100">
      <CustomHeader />
      <div className="w-full py-12 ">
        {/* For time upated */}
        <div className="px-16">
          <p className="font-poppins font-medium tracking-tight text-sm flex gap-3 text-dowellDeepGreen">
            Last Updated:{" "}
            <span className="flex items-center gap-2 text-gray-700">
              <FaCalendar />
              {eDate}
            </span>{" "}
            <span className="flex items-center gap-2 text-gray-700">
              <FaClock />
              {time}
            </span>
          </p>
        </div>

        {/* For selection */}
        <div className="flex flex-wrap md:flex-row flex-col gap-4  md:gap-6 my-8 w-full md:px-16 px-4">
          <SelectField data={dateDuration} placeholder="Select duration" handleSelectChange={handleSelectChange} />
          <SelectField data={reportScaleVersion} placeholder="Select scale version" handleSelectChange={handleSelectChange} />
          <SelectField data={reportScaleLocation} placeholder="Select location" handleSelectChange={handleSelectChange} />
          <SelectField data={channelsName} placeholder="Select channel" handleSelectChange={handleSelectChange} />
          <SelectField data={instances} placeholder="Select instance" handleSelectChange={handleSelectChange} />
        </div>
        {/* For display cards */}
        <div className="grid md:grid-cols-3 grid-cols-1 gap-8 mt-4 md:px-16 px-4">
          <div className="py-12 px-9 bg-white rounded-xl flex items-center justify-between">
            <div>
              <h2 className="text-md font-poppins font-medium text-gray-700 tracking-tight mb-4">Total Responses</h2>
              <p className="font-bold font-poppins text-3xl text-gray-700">{totalResponse}</p>
            </div>
            <GiVibratingShield className="size-20 h-20 w-20 bg-green-100 text-green-400 p-2 rounded-full" />
          </div>
          <div className="py-12 px-9 bg-white rounded-xl flex items-center justify-between">
            <div>
              <h2 className="text-md font-poppins font-medium text-gray-700 tracking-tight mb-4">Total Score</h2>
              <p className="font-bold font-poppins text-3xl text-gray-700">
                {minScore} <span className="text-sm font-medium">/ {maxScore}</span>
              </p>
            </div>
            <HiMiniUsers className="size-20 h-20 w-20 bg-orange-100 text-orange-400 p-2 rounded-full" />
          </div>
          <div className="py-12 px-9 bg-white rounded-xl flex items-center justify-between">
            <div>
              <h2 className="text-md font-poppins font-medium text-gray-700 tracking-tight mb-4">Average Score</h2>
              <p className="font-bold font-poppins text-3xl text-gray-700">{averageScore}</p>
            </div>
            <AiFillWechat className="size-20 h-20 w-20 bg-yellow-100 text-yellow-400 p-2 rounded-full" />
          </div>
        </div>
        {/* For Errors */}
        {(reportAlert || reportLoading) && (
          <div className="flex justify-center items-center gap-4 md:px-16 px-4 mt-20 text-center">
            <div className="flex flex-col  ml-4 justify-center items-center gap-2  text-center md:text-center ">
              {reportLoading ? <CircularProgress /> : null}
              <h2 className="font-poppins tracking-tight font-bold md:text-2xl text-xl text-gray-700">{reportMsg}</h2>
              <p className="md:text-[17px] text-[15px] font-poppins tracking-tight font-medium text-gray-500">{reportLoading ? "Please wait while fetching your data" : "Please contact the admin, if error persists"}</p>
            </div>
          </div>
        )}

        {/* {reportLoading && (
          <div className="flex items-center justify-center mt-20 flex-col">
            <h2 className="font-bold text-xl md:text-2xl font-poppins tracking-tight text-gray-700">Loading...</h2>
            <p className="font-medium text-sm md:text-md font-poppins tracking-tight text-gray-700 ml-4">Please wait while fetching your data</p>
          </div>
        )} */}
        {/* For charts */}
        {displayData === true ? (
          <div className="flex md:flex-row flex-col w-full md:gap-6 gap-2 md:px-16 px-4">
            <div className="mt-16 w-full bg-white rounded-xl py-8">
              <h2 className="text-xl font-poppins font-semibold text-gray-700 tracking-tight px-12">Daywise Response Insights</h2>
              <div className="md:px-3 mt-8">
                <div>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineGraph options={optionsWithoutPercentage} data={{labels: dailyCountsData.labels, datasets: normalizedData}} />
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="mt-16 w-full bg-white rounded-xl py-8">
              <h2 className="text-xl font-poppins font-semibold text-gray-700 tracking-tight px-12">Overall Score Distribution</h2>
              <div className="md:px-3 mt-8">
                <div>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineGraph options={optionsWithPercentage} data={lineChartDataTwo} />
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ScalesReport;

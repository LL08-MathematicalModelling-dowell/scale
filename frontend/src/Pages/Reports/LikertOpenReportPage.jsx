import LineGraph from "@/components/Graph/LineGraph";
import SelectField from "@/components/SelectField/SelectField";
import { getLikertChannelsInstances, getLikertReport } from "@/services/api.services";
import { CircularProgress } from "@mui/material";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";

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

const LikertReport = ({scaleId}) => {
  const [normalizedData, setNormalizedData] = useState([]);
  const [channelName, setChannelName] = useState([]);
  const [instanceName, setInstanceName] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [reportData, setReportData] = useState([]);
  const [displayData, setDisplayData] = useState(false);
  const [alert, setAlert] = useState(false);
  const [message, setMessage] = useState(" ");
  const [totalResponse, setTotalResponse] = useState(0);
  const [dailyCountsData, setDailyCountsData] = useState([]);
  const [duration, setDuration] = useState(null);
  const [instanceValue, setInstanceValue] = useState(null);
  const [channelValue, setChannelValue] = useState(null);
  const [instanceLoading, setInstanceLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [maxScore, setMaxScore] = useState(0);
  const [overallScoreData, setOverallScoreData] = useState({
    labels: [],
    datasets: [],
  });

  const fetchLikertChannelInstances = async () => {
    const scale_id = scaleId;
    setInstanceLoading(true);
    try {
      const channelDetailsResponse = await getLikertChannelsInstances(scale_id);
      if (channelDetailsResponse.status === 200) {
        const data = channelDetailsResponse.data;
        const channels = data?.scale_data?.channel_instance_details.map((item) => ({
          label: item.channel_display_name,
          value: item.channel_name,
        }));
        setChannelName(channels);

        const instances = data?.scale_data?.channel_instance_details.flatMap((item) =>
          item.instances_details.map((instance) => ({
            label: instance.instance_display_name,
            value: instance.instance_name,
          }))
        );
        setInstanceName(instances);
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
      setInstanceLoading(false); // End loading
    }
  };

  useEffect(() => {
    fetchLikertChannelInstances();
  }, []);

  const payload = {
    scale_id: scaleId,
    channel_names: [`${channelValue}`],
    instance_names: [`${instanceValue}`],
    period: `${duration}`,
  };

  const fetchLikertReport = async () => {
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
        setMaxScore(maximumScore);
        console.log(totalScore);
        console.log(maxScore);

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
        setMessage("REPORT NOT FOUND");
        setDisplayData(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (channelValue && instanceValue && duration) {
      fetchLikertReport();
    }
  }, [channelValue, instanceValue, duration]);

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
  const averageScoreYellowPercent = averageScore;

  return (
    <div className="relative max-w-full min-h-screen">
      <h1 className="my-4 text-2xl font-bold text-center">DoWell Voice of Customer</h1>
      <div className="mx-8 my-12 ">
        <div className="flex flex-col items-center justify-center gap-10">
          <div className="flex flex-col justify-center gap-5 md:flex-row">
            <SelectField handleInputChange={handleInputChange} triggerClass="w-80 h-10 outline-none focus:ring-1 focus:ring-dowellLiteGreen font-medium font-poppins" placeholder="Select Channel Name" data={channelName} />
            <SelectField handleInputChange={handleInputChange} triggerClass="w-80 h-10 outline-none focus:ring-1 focus:ring-dowellLiteGreen font-medium font-poppins" placeholder="Select Instances" data={instanceName} />
            <SelectField handleInputChange={handleInputChange} triggerClass="w-80 h-10 outline-none focus:ring-1 focus:ring-dowellLiteGreen font-medium font-poppins" placeholder="Duration" data={Duration} />
          </div>

          <h2 className="text-xl font-bold tracking-tight font-montserrat">
            Total Response: <span className="text-xl text-green-800 font-poppins">{totalResponse}</span>
          </h2>
        </div>

        {displayData === false && alert === true && (
          <div className="flex items-center justify-center mt-40 text-center gap-x-3">
            <div className="">
              {loading ? <CircularProgress /> : null}
              <h3 className="text-2xl font-bold tracking-tight text-gray-500 font-poppins">{message}</h3>
              <p className="font-poppins text-gray-800 text-[15px] tracking-tight mt-1">{loading ? "Please wait while we fetching the data" : "Please contact admin if possibly you have this report"}</p>
            </div>
          </div>
        )}
        {displayData && (
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

import LineGraph from "@/components/Graph/LineGraph";
import Navbar from "@/components/Navbar/Navbar";
import SelectField from "@/components/SelectField/SelectField";
import {getLikertChannelsInstances, getLikertReport} from "@/services/api.services";
import PropTypes from "prop-types";
import {useState, useEffect} from "react";
import NotFound from "../../assets/NotFound.jpg";

const RectangleDiv = ({className = " ", scores, type}) => {
  const constrainedYellowPercent = scores;
  const greenPercent = 100 - constrainedYellowPercent;

  return (
    <div className="flex flex-col">
      <div className={`relative flex w-full h-6 rounded-full overflow-hidden ${className}`}>
        <div className="bg-yellow-500 flex justify-center items-center text-black font-bold px-4 " style={{width: `${constrainedYellowPercent + 100}%`}}>
          <p> {constrainedYellowPercent}</p>
        </div>
        <div className="border-gray-200 border-2 flex justify-center items-center text-black font-bold" style={{width: `${greenPercent}%`}}>
          {"    "}
        </div>
      </div>
      {/* Labels */}
      <div className="flex justify-between w-full gap-y-2">
        <p className="font-poppins font-medium text-sm">0</p>
        <p className="font-poppins font-medium text-sm"> {type === "averageScore" ? "5" : "30"}</p>
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
  const [overallScoreData, setOverallScoreData] = useState({
    labels: [],
    datasets: [],
  });

  const fetchLikertChannelInstances = async () => {
    const scale_id = "66c9d22a8739f31401f29fd5";
    setInstanceLoading(true); // Start loading
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
    scale_id: "66c9d22a8739f31401f29fd5",
    channel_names: [`${channelValue}`],
    instance_names: [`${instanceValue}`],
    period: `${duration}`,
  };

  const fetchLikertReport = async () => {
    setLoading(true);

    try {
      const reportResponse = await getLikertReport(payload);
      console.log("Report Response Status:", reportResponse.status); // Log the response status

      if (reportResponse.status === 200) {
        setDisplayData(true);
        const reportResult = reportResponse.data;
        console.log("Report Result:", reportResult);
        setReportData(reportResult);
        setTotalResponse(reportResult?.report.no_of_responses);
        const totalScoreString = reportResult?.report?.total_score;

        const score = parseInt(totalScoreString.split("/")[0], 10);
        setTotalScore(score);

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
            return value + " %"; // Append '%' to y-axis labels
          },
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            return context.dataset.label + ": " + context.raw + " %"; // Append '%' to tooltip labels
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
            return value + " "; // Append '%' to y-axis labels
          },
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            return context.dataset.label + ": " + context.raw + " "; // No '%' symbol
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
    <div className="min-h-screen max-w-full relative">
      <Navbar />
      <div className="my-12 mx-8 ">
        <div className="flex flex-col justify-center items-center gap-10">
          <div className="flex justify-center gap-5 flex-col md:flex-row">
            <SelectField handleInputChange={handleInputChange} triggerClass="w-80 h-10 outline-none focus:ring-1 focus:ring-dowellLiteGreen font-medium font-poppins" placeholder="Select Channel Name" data={channelName} />
            <SelectField handleInputChange={handleInputChange} triggerClass="w-80 h-10 outline-none focus:ring-1 focus:ring-dowellLiteGreen font-medium font-poppins" placeholder="Select Instances" data={instanceName} />
            <SelectField handleInputChange={handleInputChange} triggerClass="w-80 h-10 outline-none focus:ring-1 focus:ring-dowellLiteGreen font-medium font-poppins" placeholder="Duration" data={Duration} />
          </div>
   

          <h2 className="font-montserrat tracking-tight text-xl font-bold">
            Total Response: <span className="font-poppins text-xl text-green-800">{totalResponse}</span>
          </h2>
        </div>
        {displayData === false && alert === true && (
              <div className="flex items-center justify-center mt-12  gap-x-3">
                <img src={NotFound} alt="" className="w-64"/>
           <div className="">
           <h3 className="font-bold text-2xl tracking-tight font-poppins text-gray-500">{message}</h3>
           <p className="font-poppins text-gray-800 text-[15px] tracking-tight mt-1">Please contact admin if possibly you have this report</p>
           </div>
            </div>
        )
          }
        {displayData && (
          <div className="flex justify-between items-center md:flex-row flex-col md:gap-16 gap-10 text-center mx-12 mt-8">
            {/* First Chart */}
            <div className="flex flex-col gap-2 md:w-3/5 w-screen px-7">
              <p className="font-poppins tracking-tight text-[18px] font-medium">Total Score </p>
              <RectangleDiv scores={totalScoreYellowPercent} />
              <div className="mt-8">
                <p className="font-poppins text-[13px] font-medium">Daywise Response Insights</p>
                <LineGraph options={optionsWithoutPercentage} data={{labels: dailyCountsData.labels, datasets: normalizedData}} />
              </div>
            </div>
            {/* Second Chart */}
            <div className="flex flex-col md:w-3/5 w-screen gap-2 px-7">
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
        <div
          className="bg-gray-100 min-h-screen w-full absolute flex items-center justify-center  top-0 right-0 " >
      <p className="font-poppins text-xl text-green-800 font-semibold tracking-tight">Please wait,  while fetching your report...</p>
        </div>
      ) : null}
    </div>
  );
};

export default LikertReport;

import LineGraph from "@/components/Graph/LineGraph";
import Navbar from "@/components/Navbar/Navbar";
import SelectField from "@/components/SelectField/SelectField";
import {getLikertReport} from "@/services/api.services";
import PropTypes from "prop-types";
import {useState, useEffect} from "react";
import {report} from "@/data/likertReport";

const RectangleDiv = ({className = " ", scores}) => {
  const constrainedYellowPercent = scores;
  const greenPercent = 100 - constrainedYellowPercent;

  return (
    <div className="flex flex-col">
      <div className={`relative flex w-full h-6 rounded-full overflow-hidden ${className}`}>
        <div className="bg-yellow-500 flex justify-center items-center text-black font-bold px-4 " style={{width: `${constrainedYellowPercent}%`}}>
          <p> {constrainedYellowPercent}%</p>
        </div>
        <div className="bg-green-500 flex justify-center items-center text-black font-bold" style={{width: `${greenPercent}%`}}>
          {"    "}
        </div>
      </div>
      {/* Labels */}
      <div className="flex justify-between w-full gap-y-2">
        <p className="font-poppins font-medium text-sm">0</p>
        <p className="font-poppins font-medium text-sm">50</p>
        <p className="font-poppins font-medium text-sm">100</p>
      </div>
    </div>
  );
};

RectangleDiv.propTypes = {
  className: PropTypes.string,
  scores: PropTypes.number.isRequired,
};

const LikertReport = () => {
  const [normalizedData, setNormalizedData] = useState([]);
  const [likertData, setLikertData] = useState([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [score, setScore] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [dailyCountsData, setDailyCountsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overallScoreData, setOverallScoreData] = useState({
    labels: [],
    datasets: [],
  });

  const fetchLikertReportData = async () => {
    const scale_id = "66c9d22a8739f31401f29fd5";
    try {
      const response = await getLikertReport(scale_id);
      const data = response?.data;
      if (data.success === "true") {
        setTotalResponses(data.total_no_of_responses);
        const maxScore = data.total_no_of_responses * 5;
        setScore(maxScore);
        const totalScoresAvailable = data.data.map((item) => item.score);
        // console.log(totalScoresAvailable.length);

        const AddScores = data.data.reduce((sum, item) => sum + item.score, 0);
        const averageScore = AddScores / totalScoresAvailable.length;
        setAverageScore(Math.round(averageScore, 1));
        // console.log(averageScore);
        setLikertData(data?.data);
    

        setLoading(false);

        // My first step: Extracting the daily counts
        const dailyCounts = data.data.map(item => item.current_response_count)
        console.log("This is the array of daily counts", dailyCounts);
        
        const dailyLabels = Object.keys(dailyCounts);
        const dailyDatasets = [1, 2, 3, 4, 5].map((count) => ({
          label: `${count}`,
          data: dailyLabels.map((date) => dailyCounts[date][count] || 0),
          borderColor: `hsl(${count * 72}, 70%, 50%)`,
        }));
        setDailyCountsData({
          labels: dailyLabels,
          datasets: dailyDatasets,
        });
        const normalized = normalizeDatasets(dailyDatasets);
        setNormalizedData(normalized);
        // My second step: Extracting the overall score distribution
        const overallDistribution = report?.report?.overall_score_distribution;
        const overallLabels = Object.keys(overallDistribution);
        const overallDataset = [
          {
            label: "Score Distribution",
            data: overallLabels.map((score) => overallDistribution[score]),
            borderColor: "rgb(34,197,94)",
          },
        ];
        setOverallScoreData({labels: overallLabels, datasets: overallDataset});
      }
    } catch (error) {
      console.log("Failed to fetch Likert report data", error);
    }
  };

  const normalizeDatasets = (datasets) => {
    let maxValue = Math.max(...datasets.flatMap((dataset) => dataset.data));
    let maxPercentage = maxValue <= 100 ? 100 : 200;

    return datasets.map((dataset) => ({
      ...dataset,
      data: dataset.data.map((value) => (value / maxValue) * maxPercentage),
    }));
  };

  // useEffect(() => {

  // }, []);

  useEffect(() => {
    fetchLikertReportData();
  }, [ ]);

  const modifiedChannelName = likertData
    .map((item) => ({
      label: "Channel One",
      value: item.channel_name,
    }))
    .filter((value, index, self) => index === self.findIndex((t) => t.value === value.value));

  const uniqueInstances = [];
  const uniqueDisplayNames = new Set();

  likertData.forEach((item) => {
    if (!uniqueDisplayNames.has(item.instance_display_name)) {
      uniqueDisplayNames.add(item.instance_display_name);
      uniqueInstances.push(item);
    }
  });

  const instanceModifiedData = uniqueInstances.map((item) => ({
    label: item.instance_display_name,
    value: item.instance_display_name,
  }));

  const optionsWithPercentage = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value + "%"; // Append '%' to y-axis labels
          },
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            return context.dataset.label + ": " + context.raw + "%"; // Append '%' to tooltip labels
          },
        },
      },
    },
  };

  const optionsWithoutPercentage = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            return context.dataset.label + ": " + context.raw; // No '%' symbol
          },
        },
      },
    },
  };

  const lineChartDataTwo = overallScoreData;

  const handleInputChange = (value) => {
    console.log(value);
  };

  const Duration = [
    {label: "24 hours", value: "1"},
    {label: "7 days", value: "2"},
    {label: "30 days", value: "3"},
  ];

  const totalScoreYellowPercent = score;
  const averageScoreYellowPercent = averageScore;

  return (
    <div className="min-h-screen max-w-full">
      <Navbar />
      <div className="my-12 mx-8">
        <div className="flex flex-col justify-center items-center gap-10">
          <div className="flex justify-center gap-5 flex-col md:flex-row">
            <SelectField handleInputChange={handleInputChange} triggerClass="w-80 h-10 outline-none focus:ring-1 focus:ring-dowellLiteGreen font-medium font-poppins" placeholder="Select Channel Name" data={modifiedChannelName} />
            <SelectField handleInputChange={handleInputChange} triggerClass="w-80 h-10 outline-none focus:ring-1 focus:ring-dowellLiteGreen font-medium font-poppins" placeholder="Select Instances" data={instanceModifiedData} />
            <SelectField handleInputChange={handleInputChange} triggerClass="w-80 h-10 outline-none focus:ring-1 focus:ring-dowellLiteGreen font-medium font-poppins" placeholder="Duration" data={Duration} />
          </div>
          <h2 className="font-montserrat tracking-tight text-xl font-bold">
            Total Response: <span className="font-poppins text-xl text-green-800">{totalResponses}</span>
          </h2>
        </div>

        <div className="flex justify-between items-center md:flex-row flex-col md:gap-16 gap-10 text-center mx-12 mt-8">
          {/* First Chart */}
          <div className="flex flex-col gap-2 md:w-3/5 w-screen px-7">
            <p className="font-poppins tracking-tight text-[18px] font-medium">Total Score</p>
            <RectangleDiv scores={totalScoreYellowPercent} />
            <div className="mt-8">
              <LineGraph options={optionsWithPercentage} data={{labels: dailyCountsData.labels, datasets: normalizedData}} />
            </div>
          </div>
          {/* Second Chart */}
          <div className="flex flex-col md:w-3/5 w-screen gap-2 px-7">
            <p className="font-poppins tracking-tight text-[18px] font-medium">Average Score</p>
            <RectangleDiv className="rounded-lg" scores={averageScoreYellowPercent} />
            <div className="mt-8">
              <LineGraph options={optionsWithoutPercentage} data={lineChartDataTwo} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LikertReport;

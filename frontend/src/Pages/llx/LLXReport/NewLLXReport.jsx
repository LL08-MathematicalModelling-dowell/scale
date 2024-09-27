import LineGraph from "@/components/Graph/LineGraph";
import LLXSelectField from "@/components/LLXSelectField/LLXSelectField";
import {getLLXReport} from "@/services/api.services";
import {useEffect, useState} from "react";
import {ResponsiveContainer} from "recharts";

const NewLLXReport = () => {
  const [channelNames, setChannelNames] = useState([]);
  const [instanceNames, setInstanceNames] = useState([]);
  const [reading, setReading] = useState(0);
  const [understanding, setUnderstanding] = useState(0);
  const [explaining, setExplaining] = useState(0);
  const [evaluating, setEvaluating] = useState(0);
  const [applying, setApplying] = useState(0);
  const [elearningIndex, setLearningIndex] = useState(0);
  const [learningStages, setLearningStages] = useState(" ");
  const [learningLevelData, setLearningLevelData] = useState([]);
  const [dateWiseData, setDateWiseData] = useState({});

  const fetchLLXReport = async () => {
    const scale_id = "6687e18aa74d1fcdca15fde3";
    try {
      const llxResponse = await getLLXReport(scale_id);
      if (llxResponse.status === 200) {
        const llxResult = llxResponse.data;
        console.log(llxResult);
        // For channels
        if (llxResult && Array.isArray(llxResult.data)) {
          const allChannels = llxResult?.data.map((item) => item.channel);
          const uniqueChannel = [...new Set(allChannels)];
          const channel = uniqueChannel.map((channelName) => ({
            label: channelName,
            value: channelName,
          }));
          setChannelNames(channel);
        } else {
          console.log("No data available or data is not an array.");
        }
// For Instance
        if (llxResult && Array.isArray(llxResult.data)) {
          const allInstances = llxResult?.data.map((item) => item.instance);
          const uniqueInstance = [...new Set(allInstances)];
          const instances = uniqueInstance.map((instanceName) => ({
            label: instanceName,
            value: instanceName,
          }));
          setInstanceNames(instances);
        } else {
          console.log("No data available or data is not an array");
        }

        const getLastLearningData = (data) => {
          const groupedByDate = data.reduce((acc, item) => {
            const date = item.date_created.split(" ")[0];
            if (!acc[date]) {
              acc[date] = [];
            }
            acc[date].push(item);
            return acc;
          }, {});

          const lastDataByDate = Object.keys(groupedByDate).reduce((acc, date) => {
            const sortedResponses = groupedByDate[date].sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
            const lastResponse = sortedResponses[0];
            acc[date] = {
              percentages: lastResponse.learning_index_data.learning_level_percentages,
              stage: lastResponse.learning_index_data.learning_stage,
            };
            return acc;
          }, {});

          return lastDataByDate;
        };

        const learningDataResult = getLastLearningData(llxResult.data);
        console.log(learningDataResult);

        const mostRecentDate = Object.keys(learningDataResult).sort((a, b) => new Date(b) - new Date(a))[0];
        const mostRecentData = learningDataResult[mostRecentDate];

        if (mostRecentData) {
          setLearningStages(mostRecentData.stage);
          setLearningIndex(llxResult.data[0]?.learning_index_data?.control_group_size ?? 0);
          setReading(Math.round(mostRecentData.percentages.reading || 0, 2));
          setUnderstanding(Math.round(mostRecentData.percentages.understanding || 0, 2));
          setEvaluating(Math.round(mostRecentData.percentages.evaluating || 0, 2));
          setExplaining(Math.round(mostRecentData.percentages.explaining || 0, 2));
          setApplying(Math.round(mostRecentData.percentages.applying || 0, 2));
        }

        if (llxResult && Array.isArray(llxResult.data)) {
          // Data for chart learning index
          const formattedData = llxResult?.data?.map((item) => ({
            date: item?.date_created?.split(" ")[0] || "Unknown",
            learningIndex: item?.learning_index_data?.learning_level_index || 0,
          }));
          console.log(formattedData);
          setLearningLevelData(formattedData);
        }

        const responsesByDate = llxResult.data.reduce((acc, item) => {
          const date = item.date_created.split(" ")[0];
          if (!acc[date]) {
            acc[date] = {totalResponses: 0, attendance: 50};
          }
          acc[date].totalResponses += 1;
          return acc;
        }, {});

        Object.keys(responsesByDate).forEach((date) => {
          responsesByDate[date].responsePercentage = ((responsesByDate[date].totalResponses / responsesByDate[date].attendance) * 100).toFixed(2);
        });

        setDateWiseData(responsesByDate);
      } else {
        console.log("Error in getting LLX report");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchLLXReport();
  }, []);

  const Duration = [
    {label: "7 days", value: "seven_days"},
    {label: "15 days", value: "fifteen_days"},
    {label: "30 days", value: "thirty_days"},
    {label: "90 days", value: "ninety_days"},
  ];

  const data = {
    labels: learningLevelData.length > 0 ? learningLevelData.map((d) => d.date) : [],
    datasets: [
      {
        label: "Learning Level Index",
        data: learningLevelData.length > 0 ? learningLevelData.map((d) => d.learningIndex) : [],
        borderColor: "rgba(75,192,192,1)",
        fill: false,
      },
    ],
  };

  const rightChartData = {
    labels: Object.keys(dateWiseData), 
    datasets: [
      {
        label: "Total Responses",
        data: Object.values(dateWiseData).map((item) => item.totalResponses),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderWidth: 1,
      },
      {
        label: "Attendance",
        data: Object.values(dateWiseData).map((item) => item.attendance),
        backgroundColor: "rgba(255, 159, 64, 0.6)",
        borderWidth: 1,
      },
      {
        label: "Response Percentage",
        data: Object.values(dateWiseData).map((item) => item.responsePercentage),
        backgroundColor: "rgba(255, 206, 86, 0.6)",
        borderWidth: 1,
      },
    ],
  };
  return (
    <div className="relative min-h-screen max-w-full bg-gray-100">
      <div className="mx-8 py-12">
        <div className="flex flex-col items-center justify-center gap-10">
          <div className="flex flex-col justify-center gap-5 md:flex-row">
            <LLXSelectField data={channelNames} triggerClass={"w-80 h-10 outline-none focus:ring-1 focus:ring-dowellLiteGreen font-medium font-poppins"} placeholder="Select Channel Name" />
            <LLXSelectField data={instanceNames} triggerClass={"w-80 h-10 outline-none focus:ring-1 focus:ring-dowellLiteGreen font-medium font-poppins"} placeholder="Select Instance Name" />
            <LLXSelectField data={Duration} triggerClass={"w-80 h-10 outline-none focus:ring-1 focus:ring-dowellLiteGreen font-medium font-poppins"} placeholder="Select Duration" />
          </div>
        </div>
        <div className="mt-14 flex items-center justify-center gap-14">
          <p className="font-poppins font-bold text-md md:text-md text-green-800 tracking-tight">Learning Index: {elearningIndex}</p>
          <p className="font-poppins font-bold text-md md:text-md text-green-800 tracking-tight ">Learning Stage: {learningStages}</p>
        </div>

        <div className="mt-12">
          <h2 className="font-poppins tracking-tight text-sm md:text-xl text-green-800 font-bold">Learning Funnel</h2>
          <div className="bg-white px-8 py-12 rounded-lg shadow-md mt-4 flex flex-col gap-8">
            {/* Line one */}
            <div className="flex flex-col w-full">
              <div className="flex justify-between items-center w-full text-center">
                <div></div>
                <p className="font-poppins font-medium text-sm md:text-md text-gray-600 tracking-tight flex flex-col">
                  Do you need more reading or explanation on the topic? <span className="font-medium text-[15px]">Remembering Phase: {reading} </span>
                </p>
                <p className="font-poppins font-medium text-sm md:text-md text-green-800 tracking-tight">{reading}%</p>
              </div>
              <div className="w-[100%] h-2 bg-gray-200 rounded-full mt-2">
                <div style={{width: `${reading}%`}} className=" h-full bg-red-500 rounded-full"></div>
              </div>
            </div>
            {/* Line Two */}
            <div className="flex flex-col w-full">
              <div className="flex justify-between items-center w-full text-center">
                <div></div>
                <p className="font-poppins font-medium text-sm md:text-md text-gray-600 tracking-tight flex flex-col">
                  Did you understand the topic well? <span className="font-medium text-[15px]">Understanding Phase: {understanding}</span>
                </p>
                <p className="font-poppins font-medium text-sm md:text-md text-green-800 tracking-tight">{understanding}%</p>
              </div>
              <div className="w-[100%] h-2 bg-gray-200 rounded-full mt-2">
                <div style={{width: `${understanding}%`}} className="  h-full bg-orange-500 rounded-full"></div>
              </div>
            </div>
            {/* Line Three */}
            <div className="flex flex-col w-full">
              <div className="flex justify-between items-center w-full text-center">
                <div></div>
                <p className="font-poppins font-medium text-sm md:text-md text-gray-600 tracking-tight flex flex-col">
                  Did you feel confident explaining the topic to your friends/classmates? <span className="font-medium text-[15px]">Explanation Phase: {explaining}</span>
                </p>
                <p className="font-poppins font-medium text-sm md:text-md text-green-800 tracking-tight">{explaining}%</p>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                <div style={{width: `${explaining}%`}} className="  h-full bg-yellow-500 rounded-full"></div>
              </div>
            </div>
            {/* Line Four */}
            <div className="flex flex-col w-full">
              <div className="flex justify-between items-center w-full text-center">
                <div></div>
                <p className="font-poppins font-medium text-sm md:text-md text-gray-600 tracking-tight flex flex-col">
                  Can you evaluate others explanation on the topic? <span className="font-medium text-[15px]">Evaluation Phase: {evaluating}</span>
                </p>
                <p className="font-poppins font-medium text-sm md:text-md text-green-800 tracking-tight">0%</p>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                <div style={{width: `${evaluating}%`}} className="  h-full bg-green-400 rounded-full"></div>
              </div>
            </div>
            {/* Line Five */}
            <div className="flex flex-col w-full">
              <div className="flex justify-between items-center w-full text-center">
                <div></div>
                <p className="font-poppins font-medium text-sm md:text-md text-gray-600 tracking-tight flex flex-col">
                  Can you apply what you understood from the topic in real life or role plays? <span className="font-medium text-[15px]">(Creating Phase): {applying}</span>
                </p>
                <p className="font-poppins font-medium text-sm md:text-md text-green-800 tracking-tight">{applying}%</p>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                <div style={{width: `${applying}%`}} className="  h-full bg-green-400 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="">
            <div className="flex md:flex-row flex-col w-full md:gap-6 gap-2">
              <div className="mt-16 w-full bg-white rounded-xl py-8">
                <h2 className="text-xl font-poppins font-semibold text-gray-700 tracking-tight px-12">Daywise LLX Response Insights</h2>
                <div className="md:px-3 mt-8">
                  <div>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineGraph data={data} />
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="mt-16 w-full bg-white rounded-xl py-8">
                <h2 className="text-xl font-poppins font-semibold text-gray-700 tracking-tight px-12">Overall Score Distribution</h2>
                <div className="md:px-3 mt-8">
                  <div>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineGraph data={rightChartData} />
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewLLXReport;

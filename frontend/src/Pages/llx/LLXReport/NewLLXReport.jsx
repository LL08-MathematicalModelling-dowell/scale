import LineGraph from "@/components/Graph/LineGraph";
import LLXSelectField from "@/components/LLXSelectField/LLXSelectField";
import { getLLXReport } from "@/services/api.services";
import {fetchScaleDetails, useScaleDetailsContext } from "@/contexts/scaleDetailsContext"; 
import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { ResponsiveContainer } from "recharts";
import NotFound from "../../../assets/dataNotFound.png";
import LLXNavbar from "../LLXNavBar/LLXNavBar";

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
  const [customChannel, setCustomChannels] = useState("");
  const [customInstance, setCustomInstance] = useState("");
  const [customDuration, setCustomDuration] = useState("");
  const [reportDisplayData, setReportDisplayData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(" ");
  const [error, setError] = useState(false);
  const [channelData, setChannelData] = useState([]);
  const [instanceData, setInstanceData] = useState([]);
  const {   channelsReport } = useScaleDetailsContext();
  

  
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
  
    const fetchDetails = async () => {
      if (accessToken) {
        await fetchScaleDetails();
      }
    };
  
    fetchDetails();
  }, []); 


  useEffect(() => {
    const scaleParams = channelsReport || [];
    if (scaleParams.length > 0) {
      const uniqueChannels = Array.from(
        new Set(scaleParams.map((item) => item.channel))
      ).map((channel, index) => ({
        label: `Session ${index + 1}`,
        value: channel,
      }));
  
      const uniqueInstances = Array.from(
        new Set(scaleParams.map((item) => item.instanceName))
      ).map((instance, index) => ({
        label: `Topic ${index + 1}`, 
        value: instance,
      }));
  
      setChannelData(uniqueChannels);
      setInstanceData(uniqueInstances);
    }
  }, [channelsReport]);

  const durationData = [
    {label: "Last 7 Days", value: "seven_days"},
    {label: "30 days", value: "thirty_days"},
    {label: "90 Days", value: "ninety_days"},
  ];

  const handleInputChange = (value) => {
    {
      value.startsWith("ins") ? setCustomInstance(value) : null;
    }
    {
      value.startsWith("cha") ? setCustomChannels(value) : null;
    }
    {
      value.endsWith("days") ? setCustomDuration(value) : null;
    }
  };

  useEffect(() => {
    console.log(customChannel);
    console.log(customInstance);
    console.log(customDuration);
  });

  const fetchLLXReport = async () => {
    const payload = {
    scale_id: "66ec3f23081ae0eb638ce059",
      channel_names: [`${customChannel}`],
      instance_names: [`${customInstance}`],
      period: `${customDuration}`,
    };

    try {
      setLoading(true);
      setReportDisplayData(false);
      setError(false);
      const llxResponse = await getLLXReport(payload);
      console.log(llxResponse);
      if (llxResponse.status === 201) {
        const llxResult = llxResponse.data?.data;
        console.log(llxResult);

        const allChannels = llxResult.map((item) => item.channel);
        const uniqueChannel = [...new Set(allChannels)];
        const channel = uniqueChannel.map((channelName) => ({
          label: channelName,
          value: channelName,
        }));
        const mappedChannel = channel.map((item) => item.value);
        setChannelNames(mappedChannel.join(" ,"));
        console.log(channelNames);

        const allInstances = llxResult.map((item) => item.instance);
        const uniqueInstance = [...new Set(allInstances)];
        const instances = uniqueInstance.map((instanceName) => ({
          label: instanceName,
          value: instanceName,
        }));

        const mappedInstance = instances.map((item) => item.value);
        setInstanceNames(mappedInstance.join(" ,"));
        console.log(instanceNames);

        if (mappedChannel.includes(customChannel) && mappedInstance.includes(customInstance)) {
          setLoading(false);
          setError(false);
          const getLastLearningData = (data) => {
            const groupedByDate = data.reduce((acc, item) => {
              const date = item.date_created.split(" ")[0];
              if (!acc[date]) {
                acc[date] = [];
              }
              acc[date].push(item);
              console.log(acc);
              return acc;
            }, {});

            const lastDataByDate = Object.keys(groupedByDate).reduce((acc, date) => {
              const sortedResponses = groupedByDate[date].sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
              console.log(sortedResponses);
              const lastResponse = sortedResponses[0];
              console.log(lastResponse);
              acc[date] = {
                percentages: lastResponse.learning_index_data.learning_level_percentages,
                stage: lastResponse.learning_index_data.learning_stage,
              };
              console.log(acc);
              return acc;
            }, {});

            return lastDataByDate;
          };

          const learningDataResult = getLastLearningData(llxResult);
          console.log(learningDataResult);

          const mostRecentDate = Object.keys(learningDataResult).sort((a, b) => new Date(b) - new Date(a))[0];
          console.log(mostRecentDate);
          const mostRecentData = learningDataResult[mostRecentDate];

          console.log(mostRecentData);

          if (mostRecentData) {
            setLearningStages(mostRecentData.stage);
            setLearningIndex(llxResult[0]?.learning_index_data?.control_group_size ?? 0);
            setReading(Math.round(mostRecentData.percentages.reading || 0, 2));
            setUnderstanding(Math.round(mostRecentData.percentages.understanding || 0, 2));
            setEvaluating(Math.round(mostRecentData.percentages.evaluating || 0, 2));
            setExplaining(Math.round(mostRecentData.percentages.explaining || 0, 2));
            setApplying(Math.round(mostRecentData.percentages.applying || 0, 2));
          }

          console.log(reading);

          if (llxResult && Array.isArray(llxResult)) {
            const formattedData = llxResult.map((item) => ({
              date: item?.date_created?.split(" ")[0] || "Unknown",
              learningIndex: item?.learning_index_data?.learning_level_index || 0,
            }));
            console.log(formattedData);
            setLearningLevelData(formattedData);
          }

          const responsesByDate = llxResult.reduce((acc, item) => {
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
        }

        setReportDisplayData(true);
      } else {
        console.log("Error in getting LLX report");
      }
    } catch (error) {
      if (error.response.status === 400) {
        setError(true);
        setErrorMsg("Data Not Found");
        console.log("Data Not Found");
      }
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customChannel && customInstance && customDuration) {
      fetchLLXReport();
    }
  }, [customChannel, customInstance, customDuration]);

  useEffect(() => {

  }, [channelNames, instanceNames]);

  const learningLevelValues = learningLevelData.length > 0 ? learningLevelData.map((d) => d.learningIndex) : [];

const maxLearningLevelValue = Math.max(...learningLevelValues);
const extendedLearningLevelValues = [...learningLevelValues, maxLearningLevelValue + 0.2];

const data = {
  labels: learningLevelData.length > 0 ? learningLevelData.map((d) => d.date) : [],
  datasets: [
    {
      label: "Learning Level Index",
      data: extendedLearningLevelValues,
      borderColor: "rgba(217,0,1)",
      fill: false,
    },
  ],
};


const totalResponses = Object.values(dateWiseData).map((item) => item.totalResponses);
const attendance = Object.values(dateWiseData).map((item) => item.attendance);
const responsePercentage = Object.values(dateWiseData).map((item) => item.responsePercentage);

const maxTotalResponses = Math.max(...totalResponses);
const maxAttendance = Math.max(...attendance);
const maxResponsePercentage = Math.max(...responsePercentage);

const newMaxValue = Math.max(maxTotalResponses, maxAttendance, maxResponsePercentage) + 0;

const rightChartData = {
  labels: Object.keys(dateWiseData),
  datasets: [
    {
      label: "Total Responses",
      data: [...totalResponses, newMaxValue], 
      backgroundColor: "rgba(13,29,71, 0.7)",
      borderWidth: 1,
    },
    {
      label: "Attendance",
      data: [...attendance, newMaxValue], 
      backgroundColor: "rgba(255, 206, 86, 0.9)",
      borderWidth: 1,
    },
    {
      label: "Response Percentage",
      data: [...responsePercentage, newMaxValue], 
      backgroundColor: "rgba(0, 100, 0, 0.6)",
      borderWidth: 1,
    },
  ],
};


  return (
    <div className="relative min-h-screen max-w-full bg-gray-100">
      <LLXNavbar/>
      <div className="mx-8 py-12">
        <div className="flex flex-col items-center justify-center gap-10">
          <div className="flex flex-col justify-center gap-5 md:flex-row">
            <LLXSelectField handleInputChange={handleInputChange} data={channelData} triggerClass={"w-80 h-10 outline-none focus:ring-1 focus:ring-dowellLiteGreen font-medium font-poppins"} placeholder="Select Channel Name" />
            <LLXSelectField handleInputChange={handleInputChange} data={instanceData} triggerClass={"w-80 h-10 outline-none focus:ring-1 focus:ring-dowellLiteGreen font-medium font-poppins"} placeholder="Select Instance Name" />
            <LLXSelectField handleInputChange={handleInputChange} data={durationData} triggerClass={"w-80 h-10 outline-none focus:ring-1 focus:ring-dowellLiteGreen font-medium font-poppins"} placeholder="Select Duration" />
          </div>
        </div>
        <div className="mt-14 flex items-center justify-center gap-14">
          <p className="font-poppins font-bold text-md md:text-md text-green-800 tracking-tight">Learning Index: {elearningIndex}</p>
          <p className="font-poppins font-bold text-md md:text-md text-green-800 tracking-tight ">Learning Stage: {learningStages}</p>
        </div>

        {loading && (
          <div className="w-full h-full flex flex-col gap-2 items-center justify-center mt-32">
            <CircularProgress />
            <h2 className="text-xl font-poppins font-bold text-green-800">Loading...</h2>
            <p className="font-poppins md:text-md text-sm tracking-tight font-medium text-gray-600">Please wait while fetching your report</p>
          </div>
        )}

        {error && (
          <div className="w-full h-full flex flex-col  items-center justify-center mt-14">
            <img src={NotFound} alt="" className="w-72 rounded-full" />
            <h2 className="text-xl font-poppins font-bold text-red-500">Sorry !</h2>
            <p className="font-poppins md:text-lg text-sm tracking-tight font-medium text-gray-600">{errorMsg}</p>
          </div>
        )}



        {reportDisplayData ? (
          <div className="mt-12 flex flex-col ">
            <div className="order-2 md:order-1 mt-12 md:mt-0">
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
                  <p className="font-poppins font-medium text-sm md:text-md text-green-800 tracking-tight">{evaluating}%</p>
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
            </div>

            <div className="order-1 md:order-2 ">
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
        ) : null}
      </div>
    </div>
  );
};

export default NewLLXReport;

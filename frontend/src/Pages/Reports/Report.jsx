import Navbar from '../../components/Navbar/Navbar'
import { useNavigate } from "react-router-dom";
import { useState, useEffect, React, Children } from "react";
import { Select, MenuItem, CircularProgress, Grid, Typography, Box } from "@mui/material";
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
import { getUserReport, getUserScales } from "../../services/api.services";
import { getIndividualCounts, initialScoreData, channelNames, allChannelsNameTag, instanceNames } from "../../utils/helper";
import { processData, filterDataWithinDays, transformData, pickSevenKeys } from "../../utils/helper";
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);
import { workspaceNamesForLikert, workspaceNamesForNPS } from '@/data/Constants';
import { useCurrentUserContext } from '@/contexts/CurrentUserContext';
import { decodeToken } from '@/utils/tokenUtils';
import LikertReport from '../LikertReport/LikertReport';

const Report = () => {
  const { defaultScaleOfUser, setDefaultScaleOfUser } = useCurrentUserContext();
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  useEffect(() => {
    if (!accessToken || !refreshToken) {
      navigate("/voc/");
    } else {
      const decodedTokenForWorkspaceName = decodeToken(accessToken);
      if (workspaceNamesForNPS.some(workspaceName => workspaceName == decodedTokenForWorkspaceName.workspace_owner_name)) {
        console.log('contains');
        setDefaultScaleOfUser('nps');
      } else if (workspaceNamesForLikert.some(workspaceName => workspaceName == decodedTokenForWorkspaceName.workspace_owner_name)) {
        setDefaultScaleOfUser('likert');
      }
    }
  }, [accessToken, refreshToken, navigate]);

  const [options, setOptions] = useState({});
  const [responseData, setResponseData] = useState([]);
  const [channels, setChannels] = useState([]);
  const [instances, setInstances] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [selectedInstance, setSelectedInstance] = useState("");
  const [scores, setScores] = useState(initialScoreData);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dataForChart, setDataForChart] = useState({
    labels: [],
    datasets: [],
  });
  const [npsDataForChart, setNpsDataForChart] = useState({
    labels: [],
    datasets: [],
  });
  const [displayDataForAllSelection, setDisplayDataForAllSelection] = useState([]);
  const [dateIndexPair, setDateCountPair] = useState({});
  const [err, setErr] = useState(false);
  const [msg, setMsg] = useState(false);
  const [selectedDays, setSelectedDays] = useState(7);
  const [npsOptionData, setNpsOptionData] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [mountloading, setMountLoading] = useState(false);
  useEffect(() => {
    fetchData();
    setMountLoading(true);
  }, []);

  useEffect(() => {
    if (selectedChannel.length == 0 || selectedInstance.length == 0 || selectedChannel == allChannelsNameTag) {
      if (selectedInstance.length == 0 && selectedChannel == allChannelsNameTag) setTotalScore(0);
      return;
    }
    const filteredData = responseData.filter((item) => item.instance_name.trim() === selectedInstance && item.channel_name === selectedChannel);
    const arr = filterDataWithinDays(filteredData, selectedDays);
    if (arr.length == 0) {
      const scorePercentages = {
        Detractor: {
          count: 0,
          percentage: 0,
        },
        Passive: {
          count: 0,
          percentage: 0,
        },
        Promoter: {
          count: 0,
          percentage: 0,
        },
      };

      setScores(scorePercentages);
      setTotalCount(0);
      setDataForChart({
        labels: [1, 2, 3, 4, 5],
        datasets: [
          {
            label: "Detractor",
            data: [0, 0, 0, 0, 0],
            borderColor: "red",
            backgroundColor: "red",
          },
          {
            label: "Promoter",
            data: [0, 0, 0, 0, 0],
            borderColor: "green",
            backgroundColor: "green",
          },
          {
            label: "Passive",
            data: [0, 0, 0, 0, 0],
            borderColor: "yellow",
            backgroundColor: "yellow",
          },
        ],
      });
      setNpsDataForChart({
        labels: [1, 2, 3, 4, 5],
        datasets: [
          {
            label: "NPS",
            data: [0, 0, 0, 0, 0],
            borderColor: "red",
            backgroundColor: "red",
          },
        ],
      });
      setMsg(true);
      return;
    }

    setMsg(false);
    let scoreCounts = {
      detractor: 0,
      passive: 0,
      promoter: 0,
    };
    let score = 0;
    arr.forEach((res) => {
      scoreCounts[res.category] += 1;
      score += res.score;
    });
    setTotalScore(score);

    const totalResponses = arr.length;

    let percentages = {
      Detractor: (scoreCounts.detractor / totalResponses) * 100,
      Passive: (scoreCounts.passive / totalResponses) * 100,
      Promoter: (scoreCounts.promoter / totalResponses) * 100,
    };

    const scorePercentages = {
      Detractor: {
        count: scoreCounts["detractor"],
        percentage: percentages["Detractor"],
      },
      Passive: {
        count: scoreCounts["passive"],
        percentage: percentages["Passive"],
      },
      Promoter: {
        count: scoreCounts["promoter"],
        percentage: percentages["Promoter"],
      },
    };

    const processedData = processData(arr);

    const transData = transformData(processedData, selectedDays);

    const objectPair = pickSevenKeys(transData);
    setTotalCount(totalResponses);
    setDateCountPair(objectPair);

    setScores(scorePercentages);
    let labels, datasetsInfo, options, npsOptions;
    let detractorCounts = [],
      passiveCounts = [],
      promoterCounts = [],
      npsCounts = [];
    if (!objectPair || !arr || arr.length == 0) {
      (labels = [1, 2, 3, 4, 5]),
        (datasetsInfo = [0, 0, 0, 0, 0]),
        (options = npsOptions =
        {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              min: 0,
              max: 5,
              ticks: {
                stepSize: 1,
              },
              beginAtZero: true,
            },
            x: {
              type: "linear",
              position: "bottom",
              min: 0,
              max: 5,
              ticks: {
                stepSize: 1,
              },
              beginAtZero: true,
            },
          },
        });
    } else {
      const isSmallScreen = window.innerWidth < 600;
      labels = Object.keys(objectPair);
      datasetsInfo = Object.values(objectPair);

      let obj = getIndividualCounts(datasetsInfo);
      detractorCounts = obj.detractorCounts;
      promoterCounts = obj.promoterCounts;
      passiveCounts = obj.passiveCounts;
      const arr = [...detractorCounts, ...passiveCounts, ...promoterCounts];
      for (let i = 0; i < detractorCounts.length; i++) {
        const val = detractorCounts[i] + promoterCounts[i] + passiveCounts[i];
        if (val == 0) npsCounts[i] = 0;
        else npsCounts[i] = (((promoterCounts[i] - detractorCounts[i]) / val) * 100).toFixed(2);
      }
      const maxValue = arr.reduce((val, ele) => (Number(val) > ele ? val : ele), 0);
      const minNps = Math.min(...npsCounts);
      options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Responses Insights by Day",
          },
        },
        scales: {
          x: {
            ticks: {
              maxRotation: isSmallScreen ? 90 : 0,
              minRotation: isSmallScreen ? 90 : 0,
            },
          },
          y: {
            min: 0,
            max: Math.ceil(maxValue) + Math.ceil(maxValue / 5) > 5 ? Math.ceil(maxValue) + Math.ceil(maxValue / 5) : 5,
            ticks: {
              stepSize: Math.ceil(maxValue / 5),
            },
            beginAtZero: true,
          },
        },
      };
      npsOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Daywise NPS",
          },
        },
        scales: {
          x: {
            ticks: {
              maxRotation: isSmallScreen ? 90 : 0,
              minRotation: isSmallScreen ? 90 : 0,
            },
          },
          y: {
            min: minNps < 0 ? -100 : minNps,
            max: 100,
            ticks: {
              stepSize: 25,
              callback: function (value) {
                return value;
              },
            },
            beginAtZero: true,
          },
        },
      };
    }

    setNpsOptionData(npsOptions);
    setOptions(options);
    setDataForChart({
      labels: labels,
      datasets: [
        {
          label: "Detractor",
          data: detractorCounts,
          borderColor: "red",
          backgroundColor: "red",
        },
        {
          label: "Promoter",
          data: promoterCounts,
          borderColor: "green",
          backgroundColor: "green",
        },
        {
          label: "Passive",
          data: passiveCounts,
          borderColor: "yellow",
          backgroundColor: "yellow",
        },
      ],
    });
    setNpsDataForChart({
      labels: labels,
      datasets: [
        {
          label: "NPS",
          data: npsCounts,
          borderColor: "red",
          backgroundColor: "red",
        },
      ],
    });
  }, [selectedDays, selectedInstance, responseData, selectedChannel]);

  useEffect(() => {
    if (selectedChannel !== allChannelsNameTag) {
      if (selectedInstance.length == 0) {
        const scorePercentages = {
          Detractor: {
            count: 0,
            percentage: 0,
          },
          Passive: {
            count: 0,
            percentage: 0,
          },
          Promoter: {
            count: 0,
            percentage: 0,
          },
        };

        setScores(scorePercentages);
      }
      setDisplayDataForAllSelection([]);
      return;
    }

    if (responseData.length == 0) {
      setMsg(true);
      return;
    }

    const allData = instances.map((instance) => {
      const dataForInstance = responseData.filter((item) => item.instance_name.trim() === instance);

      let dummyCount = {
        detractor: 0,
        passive: 0,
        promoter: 0,
      };
      let dummyPercentages = {
        detractor: 0,
        passive: 0,
        promoter: 0,
      };

      let scoreCounts,
        percentages,
        objectPair,
        totalResponses,
        score = 0;
      if (dataForInstance.length == 0) {
        scoreCounts = dummyCount;
        percentages = dummyPercentages;
      } else {
        const arr = filterDataWithinDays(dataForInstance, selectedDays);
        if (arr.length == 0) {
          setMsg(true);
          return;
        }

        setMsg(false);
        scoreCounts = {
          detractor: 0,
          passive: 0,
          promoter: 0,
        };

        arr.forEach((res) => {
          scoreCounts[res.category] += 1;
          score += res.score;
        });

        totalResponses = arr.length;

        percentages = {
          Detractor: (scoreCounts.detractor / totalResponses) * 100,
          Passive: (scoreCounts.passive / totalResponses) * 100,
          Promoter: (scoreCounts.promoter / totalResponses) * 100,
        };
        const processedData = processData(arr);

        const transData = transformData(processedData, selectedDays);
        objectPair = pickSevenKeys(transData);
      }

      const scorePercentages = {
        Detractor: {
          count: scoreCounts["detractor"],
          percentage: percentages["Detractor"],
        },
        Passive: {
          count: scoreCounts["passive"],
          percentage: percentages["Passive"],
        },
        Promoter: {
          count: scoreCounts["promoter"],
          percentage: percentages["Promoter"],
        },
      };

      setScores(scorePercentages);

      let labels, datasetsInfo, options, npsOptions;
      let detractorCounts = [],
        passiveCounts = [],
        promoterCounts = [],
        npsCounts = [];
      if (!objectPair || dataForInstance.length == 0) {
        (labels = [1, 2, 3, 4, 5]),
          (datasetsInfo = [0, 0, 0, 0, 0]),
          (options = npsOptions =
          {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                min: 0,
                max: 5,
                ticks: {
                  stepSize: 1,
                },
                beginAtZero: true,
              },
              x: {
                type: "linear",
                position: "bottom",
                min: 0,
                max: 5,
                ticks: {
                  stepSize: 1,
                },
                beginAtZero: true,
              },
            },
          });
      } else {
        const isSmallScreen = window.innerWidth < 600;
        labels = Object.keys(objectPair);
        datasetsInfo = Object.values(objectPair);

        let obj = getIndividualCounts(datasetsInfo);
        detractorCounts = obj.detractorCounts;
        promoterCounts = obj.promoterCounts;
        passiveCounts = obj.passiveCounts;

        for (let i = 0; i < detractorCounts.length; i++) {
          const val = detractorCounts[i] + promoterCounts[i] + passiveCounts[i];
          if (val == 0) npsCounts[i] = 0;
          else npsCounts[i] = (((promoterCounts[i] - detractorCounts[i]) / val) * 100).toFixed(2);
        }
        const arr = [...detractorCounts, ...passiveCounts, ...promoterCounts];
        const maxValue = arr.reduce((val, ele) => (Number(val) > ele ? val : ele), 0);

        options = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: "Responses Insights by Day",
            },
          },
          scales: {
            x: {
              ticks: {
                maxRotation: isSmallScreen ? 90 : 0,
                minRotation: isSmallScreen ? 90 : 0,
              },
            },
            y: {
              min: 0,
              max: Math.ceil(maxValue) + Math.ceil(maxValue / 5) > 5 ? Math.ceil(maxValue) + Math.ceil(maxValue / 5) : 5,
              ticks: {
                stepSize: Math.ceil(maxValue / 5),
              },
              beginAtZero: true,
            },
          },
        };
        // const maxNps = Math.max(...npsCounts);
        const minNps = Math.min(...npsCounts);

        npsOptions = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: "Daywise NPS",
            },
          },
          scales: {
            x: {
              ticks: {
                maxRotation: isSmallScreen ? 90 : 0,
                minRotation: isSmallScreen ? 90 : 0,
              },
            },
            y: {
              min: minNps < 0 ? -100 : minNps,
              max: 100,
              ticks: {
                stepSize: 25,
                callback: function (value) {
                  return value;
                },
              },
              beginAtZero: true,
            },
          },
        };
      }

      setOptions(options);
      setNpsOptionData(npsOptions);
      return {
        instanceName: instance,
        totalResponses: totalResponses,
        totalScoreData: score,
        scoreCounts: scorePercentages,
        chartData: {
          labels: labels,
          datasets: [
            {
              label: "Detractor",
              data: detractorCounts,
              borderColor: "red",
              backgroundColor: "red",
            },
            {
              label: "Promoter",
              data: promoterCounts,
              borderColor: "green",
              backgroundColor: "green",
            },
            {
              label: "Passive",
              data: passiveCounts,
              borderColor: "yellow",
              backgroundColor: "yellow",
            },
          ],
        },
        npsData: {
          labels: labels,
          datasets: [
            {
              label: "NPS",
              data: npsCounts,
              borderColor: "red",
              backgroundColor: "red",
            },
          ],
        },
      };
    });

    setDisplayDataForAllSelection(allData);
  }, [selectedChannel, responseData, instances, selectedDays]);

  const fetchData = async () => {
    //check in local storage if present use scale_id = scale_id from local storage
    //if not in local storage hit get scale details api
    //getscale details api needs workspace id portafolio and typr of scale
    //type of scale = scale type from array of workspace name (constant values)
    //getScaleDetails.scaleId = scaleId
    //save to local storage = if likert scale = likert_scale_id else nps_scale = nps_scale_id
    let scale_id;
    const LocalStorageScaleId = localStorage.getItem("scale_id");
    if (LocalStorageScaleId != null) {
      scale_id = LocalStorageScaleId;
    }
    else {
      try {
        const decodedToken = decodeToken(accessToken);
        const response = await getUserScales({
          workspace_id: decodedToken.workspace_id,
          portfolio: decodedToken.portfolio,
          type_of_scale: defaultScaleOfUser,
          accessToken
        });
        console.log('Scales:', response.data.response[0].scale_id);
        scale_id = response?.data?.response[0]?.scale_id;
      } catch (error) {
        console.error('Error fetching user scales:', error);
      }

    }
    console.log('scale ki id', scale_id);
    // return;
    // const scale_id = "66b326e41f6cf39544a2b438";
    try {
      const response = await getUserReport(scale_id);
      const data = response?.data?.data;
      setMountLoading(false);

      let uniqueInstanceNames = {};
      let uniqueInstances = new Set();
      let uniqueChannelNames = {};
      let uniqueChannels = new Set();

      data.forEach((item) => {
        const name = item.instance_name || item.instance;
        const trimmedName = name.trim();
        if (trimmedName !== "instance_${index 1}" && !uniqueInstances.has(trimmedName)) {
          uniqueInstances.add(trimmedName);
        }
      });
      data.forEach((item) => {
        const name = item.channel_name || item.channel;
        const trimmedName = name.trim();
        if (!uniqueChannels.has(trimmedName)) {
          uniqueChannels.add(trimmedName);
        }
      });
      uniqueChannelNames[`${allChannelsNameTag}`] = "All Channels";
      setChannels([allChannelsNameTag, ...Array.from(uniqueChannels)]);
      setInstances(Array.from(uniqueInstances));
      setResponseData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleFetch = () => {
    setLoading(true);
    fetchData();
  };

  const handleChannelSelect = (event) => {
    setSelectedChannel(event.target.value);
    if (event.target.value === allChannelsNameTag) {
      setSelectedInstance(" ");
      setScores(initialScoreData);
      setTotalCount(0);
    }
  };

  const handleInstanceSelect = (event) => {
    setSelectedInstance(event.target.value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <CircularProgress />
      </div>
    );
  }
  if (err) {
    return (
      <>
        <p className="w-screen h-screen flex justify-center items-center p-2 text-red-600">Something went wrong contact admin!..</p>
      </>
    );
  }

  return (
    <div className="max-h-screen max-w-full">
      <div className="z-10">
        <Navbar className="z-10" />
      </div>

      <div className="-z10 relative align-center ">
        {defaultScaleOfUser == 'nps' ? <Box p={1} >
          {mountloading && (
            <div className="flex items-center gap-3 fixed md:top-18">
              <CircularProgress size="1rem" />
              <p className="font-medium text-[12px] hidden md:block">Please wait, channels loading...</p>
            </div>
          )}
          <div className="text-center py-3">
            <h1 className="text-2xl font-bold font-poppins">Net Promoter Score</h1>
          </div>
          <Grid
            container
            spacing={3}
            alignItems="center"
            justifyContent="center"
          >
            <Grid
              item
              xs={12}
              md={4}
            >
              <Select
                value={selectedChannel}
                onChange={handleChannelSelect}
                // onClick={handleFetch}
                displayEmpty
                fullWidth
              >
                <MenuItem value="">Select Channel</MenuItem>
                {channels.map((channel) => (
                  <MenuItem
                    key={channel}
                    value={channel}
                  >
                    {!channelNames[channel] ? "Channel_1" : channelNames[channel]}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
            >
              <Select
                value={selectedInstance}
                onChange={handleInstanceSelect}
                displayEmpty
                fullWidth
              // disabled={selectedChannel === allChannelsNameTag ||
              //   selectedChannel.length == 0
              // }
              >
                <MenuItem
                  value=""
                  disabled={responseData?.data}
                >
                  {responseData?.data ? "Exhibition  Feedback" : "Select Instance"}
                </MenuItem>
                {instances.map((instance) => (
                  <MenuItem
                    key={instance}
                    value={instance}
                  // onClick={handleFetch}
                  >
                    {instanceNames[instance]}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid
              item
              xs={12}
              md={3}
            >
              <Select
                value={selectedDays}
                onChange={(e) => setSelectedDays(parseInt(e.target.value))}
                fullWidth
                disabled={selectedChannel.length === 0}
              >
                <MenuItem
                  key={0}
                  value={1}
                >
                  24 hours
                </MenuItem>
                <MenuItem
                  key={1}
                  value={7}
                >
                  7 days
                </MenuItem>
                <MenuItem
                  key={2}
                  value={30}
                >
                  30 days
                </MenuItem>
                <MenuItem
                  key={3}
                  value={90}
                >
                  90 days
                </MenuItem>
              </Select>
            </Grid>
          </Grid>
          {selectedChannel === allChannelsNameTag ? (
            <>
              {React?.Children?.toArray(
                displayDataForAllSelection.map((item, index) => {
                  return (
                    <>
                      <Typography
                        variant="h6"
                        align="left"
                        style={{ marginTop: "26px" }}
                      >
                        {index + 1}. {instanceNames[item?.instanceName.trim()]}
                      </Typography>
                      <div className="flex justify-center items-center gap-6 sm:gap-12 mt-10 flex-wrap">
                        <p className="text-[20px] font-bold text-blue-600 mb-2">Total Responses: {item?.totalResponses}</p>

                        <p className="text-[20px] font-bold text-blue-600 mb-2">NPS: {(scores.Promoter.percentage - scores.Detractor.percentage).toFixed(2)}</p>
                      </div>
                      <div className="flex flex-col lg:flex-row justify-center md:gap-3 items-center w-[100%]">
                        <div className="w-[90%] md:w-1/2 flex flex-col justify-start items-start">
                          <p className="text-center font-medium p-2 w-full mt-2">Total Score:</p>
                          <div
                            style={{
                              width: "100%",
                              maxWidth: "600px",
                              margin: "0 auto",
                              position: "relative",
                              paddingBottom: "20px",
                            }}
                            className="mb-"
                          >
                            <div
                              style={{
                                border: "1px solid #ddd",
                                borderRadius: "12px",
                                overflow: "hidden",
                                width: "100%",
                                position: "relative",
                              }}
                            >
                              <div
                                style={{
                                  width: `${(item?.totalScoreData / (item?.totalResponses * 10)) * 100 || 0}%`,
                                  backgroundColor: "blue",
                                  height: "20px",
                                  transition: "width 0.5s ease-in-out",
                                  position: "relative",
                                }}
                              ></div>
                            </div>
                            <div
                              style={{
                                width: `${(item?.totalScoreData / (item?.totalResponses * 10)) * 100 || 0}%`,

                                position: "relative",
                              }}
                            >
                              <span
                                className={`absolute font-bold text-[12px] text-blue-600 ${item?.totalResponses == 0 && "hidden"}`}
                                style={{
                                  right: 0,
                                  bottom: "-20px",
                                  transform: "translateX(50%)",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {item?.totalScoreData}
                              </span>
                            </div>
                            <div
                              style={{
                                position: "absolute",
                                left: 0,
                                top: "20px",
                                fontSize: "12px",
                              }}
                            >
                              0
                            </div>
                            <div
                              style={{
                                position: "absolute",
                                right: 0,
                                top: "20px",
                                fontSize: "12px",
                              }}
                              className={` ${item?.totalResponses == 0 && "hidden"}`}
                            >
                              {item?.totalResponses * 10}
                            </div>
                          </div>
                        </div>
                        <div className="w-[90%] md:w-1/2 flex flex-col justify-start items-start mb-[10px]">
                          <p className="text-center font-medium p-2 w-full">NPS Category Distribution</p>
                          <Box
                            position="relative"
                            height="24px"
                            width="100%"
                            maxWidth="600px"
                            margin="0 auto"
                            borderRadius="12px"
                            overflow="hidden"
                            border="1px solid #ddd"
                            text="black"
                          >
                            {Object.entries(item?.scoreCounts).map(([score, data], index) => (
                              <Box
                                key={score}
                                position="absolute"
                                left={`${Object.entries(item?.scoreCounts)
                                  .slice(0, index)
                                  .reduce((acc, [_, val]) => acc + val.percentage, 0)}%`}
                                width={`${data.percentage}%`}
                                height="100%"
                                bgcolor={score === "Detractor" ? "red" : score === "Passive" ? "yellow" : "green"}
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="center"
                                style={{
                                  color: "black",
                                  fontSize: "10px",
                                  fontWeight: "bold",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {data.percentage.toFixed(1)}%
                              </Box>
                            ))}
                          </Box>
                        </div>
                      </div>

                      <Grid
                        item
                        xs={12}
                        md={0}
                        className="block mb-5 md:hidden "
                      >
                        <>
                          <Box
                            sx={{
                              mt: 4,
                              width: "100%",
                              height: { xs: "300px", sm: "400px" },
                              maxWidth: "900px",
                              mx: "auto",
                            }}
                          >
                            <Line
                              options={npsOptionData}
                              data={item?.npsData}
                            />
                          </Box>
                          <Box
                            sx={{
                              my: 4,
                              width: "100%",
                              height: { xs: "300px", sm: "400px" },
                              maxWidth: "900px",
                              mx: "auto",
                            }}
                          >
                            <Line
                              options={options}
                              data={item.chartData}
                            />
                          </Box>
                        </>
                      </Grid>

                      <div className="hidden md:flex justify-center items-center mt-10 gap-12 flex-wrap">
                        <Grid
                          item
                          xs={12}
                          md={5}
                        >
                          <Box
                            sx={{
                              width: "600px",
                              height: { xs: "300px", sm: "380px" },
                            }}
                          >
                            <Line
                              options={options}
                              data={item?.chartData}
                            />
                          </Box>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          md={5}
                        >
                          <Box
                            sx={{
                              width: "600px",
                              height: { xs: "300px", sm: "380px" },
                            }}
                          >
                            <Line
                              options={npsOptionData}
                              data={item?.npsData}
                            />
                          </Box>
                        </Grid>
                      </div>
                    </>
                  );
                })
              )}
            </>
          ) : (
            <>
              <div className="flex justify-center items-center gap-6 sm:gap-12 mt-10  flex-wrap ">
                <p className="text-[20px] font-bold text-blue-600 mb-2">Total Responses: {totalCount}</p>

                <p className="text-[20px] font-bold text-blue-600 mb-2">NPS: {(scores.Promoter.percentage - scores.Detractor.percentage).toFixed(2)}</p>
              </div>
              <div className="flex flex-col lg:flex-row justify-center md:gap-3 items-center w-[100%]">
                <div className="w-[90%] md:w-1/2 flex flex-col justify-start items-start">
                  <p className="text-center font-medium p-2 w-full mt-2">Total Score</p>
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "600px",
                      margin: "0 auto",
                      position: "relative",
                      paddingBottom: "20px",
                    }}
                    className="mb-"
                  >
                    <div
                      style={{
                        border: "1px solid #ddd",
                        overflow: "hidden",
                        width: "100%",
                        position: "relative",
                        borderRadius: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: `${(totalScore / (totalCount * 10)) * 100 || 0}%`,
                          backgroundColor: totalCount == 0 ? "white" : "blue",
                          height: "20px",
                          transition: "width 0.5s ease-in-out",
                          position: "relative",
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        width: `${(totalScore / (totalCount * 10)) * 100 || 0}%`,

                        position: "relative",
                      }}
                    >
                      <span
                        className={`absolute font-bold text-[12px] text-blue-600 ${totalCount == 0 && "hidden"}`}
                        style={{
                          right: 0,
                          bottom: "-20px",
                          transform: "translateX(50%)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {totalScore}
                      </span>
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "20px",
                        fontSize: "12px",
                      }}
                    >
                      0
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "20px",
                        fontSize: "12px",
                      }}
                      className={` ${totalCount == 0 && "hidden"}`}
                    >
                      {totalCount * 10}
                    </div>
                  </div>
                </div>
                <div className="w-[90%] md:w-1/2 flex flex-col justify-start items-start mb-[10px]">
                  <p className="text-center font-medium p-2 w-full">NPS Category Distribution</p>
                  <Box
                    position="relative"
                    height="24px"
                    width="100%"
                    maxWidth="600px"
                    margin="0 auto"
                    borderRadius="12px"
                    overflow="hidden"
                    border="1px solid #ddd"
                    text="black"
                  >
                    {Object.entries(scores).map(([score, data], index) => (
                      <Box
                        key={score}
                        position="absolute"
                        left={`${Object.entries(scores)
                          .slice(0, index)
                          .reduce((acc, [_, val]) => acc + val.percentage, 0)}%`}
                        width={`${data.percentage}%`}
                        height="100%"
                        bgcolor={score === "Detractor" ? "red" : score === "Passive" ? "yellow" : "green"}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        style={{
                          color: "black",
                          fontSize: "12px",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {/* {data.count>0 ?  data.count  :""} */}
                        {data.percentage.toFixed(1)}%
                      </Box>
                    ))}
                  </Box>
                </div>
              </div>

              <Grid
                item
                xs={12}
                md={0}
                className="block md:hidden"
              >
                {selectedChannel.length < 1 || selectedInstance.length < 1 ? null : (
                  <>
                    <Box
                      sx={{
                        mt: 4,
                        width: "100%",
                        height: { xs: "300px", sm: "400px" },
                        maxWidth: "900px",
                        mx: "auto",
                      }}
                    >
                      <Line
                        options={npsOptionData}
                        data={npsDataForChart}
                      />
                    </Box>
                    <Box
                      sx={{
                        my: 4,
                        width: "100%",
                        height: { xs: "300px", sm: "400px" },
                        maxWidth: "900px",
                        mx: "auto",
                      }}
                    >
                      <Line
                        options={options}
                        data={dataForChart}
                      />
                    </Box>
                  </>
                )}
              </Grid>
              <div className="hidden md:flex flex-row  justify-center items-center mt-10 gap-12 px-12 ">
                {selectedChannel.length < 1 || selectedInstance.length < 1 ? null : (
                  <>
                    <Grid
                      item
                      xs={12}
                      md={5}
                    >
                      <Box
                        sx={{
                          width: "600px",
                          height: { xs: "300px", sm: "380px" },
                        }}
                      >
                        <Line
                          options={options}
                          data={dataForChart}
                        />
                      </Box>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      md={5}
                    >
                      <Box
                        sx={{
                          width: "600px",
                          height: { xs: "300px", sm: "380px" },
                        }}
                      >
                        <Line
                          options={npsOptionData}
                          data={npsDataForChart}
                        />
                      </Box>
                    </Grid>
                  </>
                )}
              </div>
            </>
          )}
        </Box> : <LikertReport/>}
      </div>
    </div>
  );
};

export default Report;

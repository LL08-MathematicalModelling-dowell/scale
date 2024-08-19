import {useEffect, useState} from "react";
import Navbar from "../../components/Navbar/Navbar";
import { getUserReport } from "../../services/api.services";

// ----------------------------SetUp Functions ----------------------------//

const initialScoreData = {
  Detractor: {count: 0, percentage: 0},
  Passive: {count: 0, percentage: 0},
  Promoter: {count: 0, percentage: 0},
};

const instanceNames = {
  instance_1: "Exhibition Feedback",
};

const channelNames = {
  allChannelNameTag: "All Channels",
  channel_1: "Exhibition Hall",
};

// ----------------------------------Data Processing functions--------------------------//

function processData(responseData) {
  const dataByDate = {};
  let previousDateData = null;

  responseData.forEach((response) => {
    const dateCreated = formateDate(response.dowell_time.current_time);
    const category = response.category;
    let count = -1;

    if (category === "promoter") {
      count = 1;
    } else if (category !== "detractor") {
      count = 0;
    }

    if (!dataByDate[dateCreated]) {
      dataByDate[dateCreated] = {
        totalCount: 0,
        detractorCount: 0,
        promoterCount: 0,
        passiveCount: 0,
      };
    }

    if (count === 1) {
      dataByDate[dateCreated].promoterCount++;
    } else if (count === 0) {
      dataByDate[dateCreated].passiveCount++;
    } else {
      dataByDate[dateCreated].detractorCount++;
    }

    dataByDate[dateCreated].totalCount++;
  });

  Object.keys(dataByDate).forEach((date) => {
    const obj = dataByDate[date];

    if (previousDateData !== null) {
      obj.promoterCount += previousDateData.promoterCount;
      obj.passiveCount += previousDateData.passiveCount;
      obj.detractorCount += previousDateData.detractorCount;
      obj.totalCount += previousDateData.totalCount;
    }
    previousDateData = obj;
  });

  return dataByDate;
}

function filterDataWithinDays(responseData, days) {
  const filteredData = responseData.filter((item) => 
    isWithinLastDays(item.dowell_time.current_time, days)
  );
  return filteredData;
}

function isWithinLastDays(dateString, days) {
  const dateCreated = new Date(dateString);
  const today = new Date();

  const cutoffDate = new Date(today);
  cutoffDate.setDate(today.getDate() - days);

  return dateCreated >= cutoffDate && dateCreated <= today;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

function transformData(originalData, days) {
  const transformedData = {};
  const endDate = new Date(); // Today's date
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000); // Today minus 7 days

  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateKey = formatDate(currentDate);

    if (originalData.hasOwnProperty(dateKey)) {
      const { detractorCount, promoterCount, passiveCount } =
        originalData[dateKey];

      transformedData[dateKey] = {
        detractorCount,
        promoterCount,
        passiveCount,
      };
    } else {
      transformedData[dateKey] = transformedData[
        formatDate(new Date(currentDate.getTime() - 86400000))
      ] || { detractorCount: 0, promoterCount: 0, passiveCount: 0 }; // Get the value of the previous day or 0 if it doesn't exist
    }

    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }

  return transformedData;
}

function pickSevenKeys(transformedData) {
  const keys = Object.keys(transformedData);
  const totalKeys = keys.length;
  const interval = Math.floor(totalKeys / 6); // Calculate the interval to ensure 7 keys including the first and last
  const selectedKeys = [];

  // Add the first key
  selectedKeys.push(keys[0]);

  // Add keys at regular intervals
  for (let i = interval; i < totalKeys; i += interval) {
    selectedKeys.push(keys[i]);
  }

  // Add the last key
  selectedKeys.push(keys[totalKeys - 1]);

  const selectedKeysObject = {};
  selectedKeys.forEach((key) => {
    selectedKeysObject[key] = transformedData[key];
  });

  return selectedKeysObject;
}

function getIndividualCounts(data) {
  let detractorCounts = [];
  let promoterCounts = [];
  let passiveCounts = [];

  data.forEach((entry) => {
    detractorCounts.push(entry.detractorCount);
    promoterCounts.push(entry.promoterCount);
    passiveCounts.push(entry.passiveCount);
  });

  return {
    detractorCounts,
    promoterCounts,
    passiveCounts,
  };
}


const Report = () => {
  const [channel, setChannels] = useState([]);
  const [instances, setInstances] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(" ");
  const [selectedInstance, setSelectedInstance] = useState(" ");
  const [scores, setScores] = useState(initialScoreData);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState([]);
  const [eOptions, setOptions] = useState({});
  const [dataForChart, setDataForChart] =  useState({ labels: [], datasets: []});
  const [npsDataForChart, setNpsDataForChart] = useState({ labels: [], datasets: []});
  const [displayDataForAllSelection, setDisplayDataForAllSelection] =  useState([ ]);
  const [dateIndexPair, setDateCountPair] = useState({});
  const [err, setErr] = useState(false);
  const [msg, setMsg] = useState(false);
  const [selectedDays, setSelectedDays] = useState(7);
  const [npsOptionData, setNpsOptionData] = useState({});
  const [totalScore, setTotalScore] = useState(0);

  const fetchReport = async () => {
    const scale_id = "66b326e41f6cf39544a2b438";
    try {
        const response = getUserReport(scale_id);
        console.log(response);
    } catch (error) {
      console.log(error);
      
    }
  }

  const  handleClick = () => {
    fetchReport();
  }
  return (
    <div className="max-h-screen max-w-full">
      <Navbar />
      <div className="h-full w-full flex flex-col items-center p-8">
        <h1 className="font-poppins text-2xl font-semibold">Net Promoter score</h1>

        <button onClick={handleClick}>
          Fetch Data
        </button>
      </div>
    </div>
  );
};

export default Report;

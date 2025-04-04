export function getIndividualCounts(data) {
  if (!data || data.length === 0) {
    return {
      detractorCounts: [0, 0, 0, 0, 0],
      promoterCounts: [0, 0, 0, 0, 0],
      passiveCounts: [0, 0, 0, 0, 0],
    };
  }

  let detractorCounts = [];
  let promoterCounts = [];
  let passiveCounts = [];

  data.forEach((entry) => {
    detractorCounts.push(entry.detractorCount || 0);
    promoterCounts.push(entry.promoterCount || 0);
    passiveCounts.push(entry.passiveCount || 0);
  });

  return {
    detractorCounts,
    promoterCounts,
    passiveCounts,
  };
}

export const instanceNames = {
  instance_1: "Exhibition Feedback",
};
export const allChannelsNameTag = "channel_all_x";
export const channelNames = {
  [`${allChannelsNameTag}`]: "All channels",
  channel_1: "Exhibition Hall",
};

export const initialScoreData = {
  Detractor: {count: 0, percentage: 0},
  Passive: {count: 0, percentage: 0},
  Promoter: {count: 0, percentage: 0},
};

export function processData(responseData) {
  const dataByDate = {};
  let previousDateData = null;

  responseData.forEach((response) => {
    const dateCreated = formatDate(response.dowell_time.current_time);
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
    } else if (count == 0) {
      dataByDate[dateCreated].passiveCount++;
    } else {
      dataByDate[dateCreated].detractorCount++;
    }

    dataByDate[dateCreated].totalCount++;
  });

  // Calculate cumulative counts and percentages
  Object.keys(dataByDate).forEach((date) => {
    const obj = dataByDate[date];
    if (previousDateData !== null) {
      obj.promoterCount += previousDateData.promoterCount;
      obj.passiveCount += previousDateData.passiveCount;
      obj.detractorCount += previousDateData.detractorCount;
      obj.totalCount += previousDateData.totalCount;
    }

    // Update previousDateData for next iteration
    previousDateData = obj;
  });

  return dataByDate;
}

export function filterDataWithinDays(responseData, days) {
  const filteredData = responseData.filter((item) => isWithinLastDays(item.dowell_time.current_time, days));

  return filteredData;
}

export function isWithinLastDays(dateString, days) {
  const dateCreated = new Date(dateString);
  const today = new Date();
  const cutoffDate = new Date(today);
  cutoffDate.setDate(today.getDate() - days);
  return dateCreated >= cutoffDate && dateCreated <= today;
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

export function transformData(originalData, days) {
  const transformedData = {};
  const endDate = new Date(); // Today's date
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000); // Today minus 7 days

  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateKey = formatDate(currentDate);

    if (Object.prototype.hasOwnProperty.call(originalData, dateKey)) {
      const {detractorCount, promoterCount, passiveCount} = originalData[dateKey];

      transformedData[dateKey] = {
        detractorCount,
        promoterCount,
        passiveCount,
      };
    } else {
      transformedData[dateKey] = transformedData[formatDate(new Date(currentDate.getTime() - 86400000))] || {detractorCount: 0, promoterCount: 0, passiveCount: 0}; // Get the value of the previous day or 0 if it doesn't exist
    }

    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }

  return transformedData;
}

export function pickSevenKeys(transformedData) {
  const keys = Object.keys(transformedData);
  const totalKeys = keys.length;

  if (totalKeys === 0) {
    // Return a default value if there is no data
    return { "N/A": { detractorCount: 0, promoterCount: 0, passiveCount: 0 } };
  }

  const interval = Math.floor(totalKeys / 6);
  const selectedKeys = [];

  selectedKeys.push(keys[0]);

  for (let i = interval; i < totalKeys; i += interval) {
    selectedKeys.push(keys[i]);
  }

  selectedKeys.push(keys[totalKeys - 1]);

  const selectedKeysObject = {};
  selectedKeys.forEach((key) => {
    selectedKeysObject[key] = transformedData[key];
  });

  return selectedKeysObject;
}



// export  const formatDate = (date) => {
//   const now = new Date();
//   const createdAtDate = new Date(date);
//   const diffInDays = Math.floor((now - createdAtDate) / (1000 * 60 * 60 * 24));

//   if (diffInDays < 7) {
//     return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
//   } else {
//     return createdAtDate.toLocaleDateString("en-US", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });


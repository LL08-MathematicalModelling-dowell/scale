const defaultScorePercentages = {
    Reading: {
      count: 0,
      percentage: 0,
    },
    Understanding: {
      count: 0,
      percentage: 0,
    },
    Explaining: {
      count:0,
      percentage:0,
    },
    Evaluating: {
      count:0,
      percentage:0,
    },
    Applying: {
      count:0,
      percentage:0,
    },
  };


  const defaultLabels = [0, 0, 0, 0, 0];
  const deafultDatasets = [0, 0, 0, 0, 0];
  const defaultOptions = {
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
        type: 'linear',
        position: 'bottom',
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
        },
        beginAtZero: true,
      },
    },
  };


  const defaultLearningDataIndex={
    labels: defaultLabels,
    datasets: [
      {
        label: "Attendance",
        data: deafultDatasets,
        borderColor: "yellow",
        backgroundColor: "yellow",
      },
     
      {
        label: "Response Percentage",
        data: deafultDatasets,
        borderColor: "green",
        backgroundColor: "green",
      },
      
      {
        label: "Total Responses",
        data: deafultDatasets,
        borderColor: "blue",
        backgroundColor: "blue",
      },
     
    ],
  }
  export {defaultScorePercentages,deafultDatasets,defaultOptions,defaultLabels,defaultLearningDataIndex}
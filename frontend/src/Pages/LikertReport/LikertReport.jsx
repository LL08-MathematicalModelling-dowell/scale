import LineGraph from "@/components/Graph/LineGraph";
import Navbar from "@/components/Navbar/Navbar";
import SelectField from "@/components/SelectField/SelectField";
import PropTypes from 'prop-types';
import { useState } from "react";

const RectangleDiv = ({yellowPercent, className = " "}) => {
  const constrainedYellowPercent = Math.min(yellowPercent, 100);
  const greenPercent = 100 - constrainedYellowPercent;

  return (
    <div className={`relative flex w-full h-6 rounded-full overflow-hidden ${className}`}>
      <div className="bg-yellow-500 flex justify-center items-center text-black font-bold" style={{width: `${constrainedYellowPercent}%`}}>
        {constrainedYellowPercent}%
      </div>
      <div className="bg-green-500 flex justify-center items-center text-black font-bold" style={{width: `${greenPercent}%`}}>
        {greenPercent}%
      </div>
    </div>
  );
};

RectangleDiv.propTypes = {
  yellowPercent: PropTypes.number.isRequired,
  className: PropTypes.string,
}

const LikertReport = () => {
  const [input, setInput] = useState( )
  const lineChartData = {
    labels: ["20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"],
    datasets: [
      {
        label: "Score one",
        data: [80, 150, 250, 350, 450, 550, 650, 750, 850],
        borderColor: "rgb(34,197,94)",
      },
      {
        label: "Score two",
        data: [20, 220, 320, 420, 520, 620, 720, 820, 920],
        borderColor: "red",
      },
      {
        label: "Score three",
        data: [30, 130, 230, 330, 430, 530, 630, 730, 830],
        borderColor: "purple",
      },
      {
        label: "Score five",
        data: [40, 240, 340, 440, 540, 640, 740, 840, 940],
        borderColor: "blue",
      },
      {
        label: "Score six",
        data: [60, 160, 260, 360, 460, 560, 660, 760, 860],
        borderColor: "orange",
      },
    ],
    
  };

  const options = {};
  const data = {};

  const lineChartDataTwo = {
    labels: ["20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"],
    datasets: [
      {
        label: "Percentage Scores",
        data: [10, 100, 200, 40, 940, 800, 90, 90, 700],
        borderColor: "rgb(34,197,94)",
      },
    ],
  };

  const handleInputChange = (value) => {
         console.log(value)
  }
  

  const demoChannelName = [
    {
      label: "Channel One",
      value: "Channel One",
    },
    {
      label: "Channel Two",
      value: "Channel Two",
    },
    {
      label: "Channel Three",
      value: "Channel Three",
    },
  ];
  const demoInstancesName = [
    {
      label: "Instance One",
      value: "Instance One",
    },
    {
      label: "Instance Two",
      value: "Instance Two",
    },
    {
      label: "Instance Three",
      value: "Instance Three",
    },
  ];
  const Duration = [
    {
      label: "24 hours",
      value: "1",
    },
    {
      label: "7 days",
      value: "2",
    },
    {
      label: "30 days",
      value: "3",
    },
  ];

  const totalScoreYellowPercent = 70;
  const averageScoreYellowPercent = 60; 
  const TotalResponse = 20;

  return (
    <div className="min-h-screen max-w-full">
      {/* <Navbar /> */}
      <div className="my-12 mx-8">
        <div className="flex flex-col justify-center items-center gap-10">
          <div className="flex justify-center gap-5 flex-col md:flex-row">
            <SelectField handleInputChange={handleInputChange} triggerClass="w-80 h-10 outline-none focus:ring-1 focus:ring-dowellLiteGreen font-medium font-poppins" placeholder="Select Channel Name" data={demoChannelName} />
            <SelectField handleInputChange={handleInputChange} triggerClass="w-80 h-10 outline-none focus:ring-1 focus:ring-dowellLiteGreen font-medium font-poppins" placeholder="Select Instances" data={demoInstancesName} />
            <SelectField handleInputChange={handleInputChange} triggerClass="w-80 h-10 outline-none focus:ring-1 focus:ring-dowellLiteGreen font-medium font-poppins" placeholder="Duration" data={Duration} />
          </div>
          <h2 className="font-montserrat tracking-tight text-xl font-bold">
            Total Response: <span className="font-poppins text-xl text-green-800">{TotalResponse}</span>
          </h2>
        </div>

        <div className="flex justify-between items-center md:flex-row flex-col md:gap-16 gap-10 text-center mx-12 mt-8">
          {/* First Chart */}
          <div className="flex flex-col  gap-2 md:w-3/5 w-screen px-7 ">
            <p className="font-poppins tracking-tight text-[18px] font-medium">Total Score</p>
            <RectangleDiv yellowPercent={totalScoreYellowPercent} />
            <div className=" mt-8">
              <LineGraph options={options} data={lineChartData}/>
            </div>
          </div>
          {/* Second Chart */}
          <div className="flex flex-col md:w-3/5 w-screen gap-2 px-7">
            <p className="font-poppins tracking-tight text-[18px] font-medium">Average Score</p>
            <RectangleDiv yellowPercent={averageScoreYellowPercent} className="rounded-lg " />
            <div className="mt-8">
              <LineGraph options={options} data={lineChartDataTwo}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LikertReport;

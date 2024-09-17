import CustomHeader from "@/components/CustomHeader/CustomHeader";
import { useEffect, useState } from "react";
import { FaClock, FaCalendar } from "react-icons/fa";
import { GiVibratingShield } from "react-icons/gi";
import { HiMiniUsers } from "react-icons/hi2";
import { AiFillWechat } from "react-icons/ai";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ScalesReport = () => {
  const [eDate, setDate] = useState(" ");
  const [time, setTime] = useState(" ");

  useEffect(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    const formattedTime = `${hours}:${minutes}`;
    setDate(formattedDate);
    setTime(formattedTime);
  }, []);

  const AverageRating = 4.0;
  const totalParticipants = 1054;
  const totalResponses = 300;

  // Generating sample data with meaningful values
  const data = [
    { name: 'Page A', averageRating: AverageRating, totalParticipants: totalParticipants, totalResponses: totalResponses },
    { name: 'Page B', averageRating: AverageRating + 0.2, totalParticipants: totalParticipants - 400, totalResponses: totalResponses + 20 },
    { name: 'Page C', averageRating: AverageRating +1200, totalParticipants: totalParticipants + 1230, totalResponses: totalResponses - 10 },
    { name: 'Page D', averageRating: AverageRating, totalParticipants: totalParticipants, totalResponses: totalResponses },
    { name: 'Page E', averageRating: AverageRating - 0.2, totalParticipants: totalParticipants + 20, totalResponses: totalResponses + 1230 },
    { name: 'Page F', averageRating: AverageRating + 0.3, totalParticipants: totalParticipants - 10, totalResponses: totalResponses - 20 },
    { name: 'Page G', averageRating: AverageRating, totalParticipants: totalParticipants, totalResponses: totalResponses },
  ];

  return (
    <div className="max-w-full min-h-screen bg-gray-100">
      <CustomHeader />

      <div className="w-full py-12 md:px-32 px-7">
        <p className="font-poppins font-medium tracking-tight text-lg flex gap-3 text-dowellDeepGreen">
          Last Updated:{" "}
          <span className="flex items-center gap-2 text-gray-700">
            <FaCalendar />
            {eDate}
          </span>{" "}
          <span className="flex items-center gap-2 text-gray-700">
            <FaClock />
            {time}
          </span>
        </p>
        <div className="grid md:grid-cols-3 grid-cols-1 gap-8 mt-4">
          <div className="py-12 px-9 bg-white rounded-xl flex items-center justify-between">
            <div>
              <h2 className="text-md font-poppins font-medium text-gray-700 tracking-tight mb-4">Average Rating</h2>
              <p className="font-bold font-poppins text-3xl text-gray-700">{AverageRating}</p>
            </div>
            <GiVibratingShield className="size-20 h-20 w-20 bg-green-100 text-green-400 p-2 rounded-full" />
          </div>
          <div className="py-12 px-9 bg-white rounded-xl flex items-center justify-between">
            <div>
              <h2 className="text-md font-poppins font-medium text-gray-700 tracking-tight mb-4">Total Participants</h2>
              <p className="font-bold font-poppins text-3xl text-gray-700">{totalParticipants}</p>
            </div>
            <HiMiniUsers className="size-20 h-20 w-20 bg-orange-100 text-orange-400 p-2 rounded-full" />
          </div>
          <div className="py-12 px-9 bg-white rounded-xl flex items-center justify-between">
            <div>
              <h2 className="text-md font-poppins font-medium text-gray-700 tracking-tight mb-4">Total Responses</h2>
              <p className="font-bold font-poppins text-3xl text-gray-700">{totalResponses}</p>
            </div>
            <AiFillWechat className="size-20 h-20 w-20 bg-yellow-100 text-yellow-400 p-2 rounded-full" />
          </div>
        </div>

        <div className="mt-16 w-full bg-white rounded-xl py-8">
          <h2 className="text-xl font-poppins font-semibold text-gray-700 tracking-tight px-12">Scale Reports</h2>
          <div className="md:px-3 mt-8">
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="averageRating" stroke="#4ADE80" fill="#DCFCE7" name="Average Rating" />
                <Area type="monotone" dataKey="totalParticipants" stroke="#FB923C" fill="#FFEDD5" name="Total Participants" />
                <Area type="monotone" dataKey="totalResponses" stroke="#827901" fill="#ebf288" name="Total Responses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScalesReport;

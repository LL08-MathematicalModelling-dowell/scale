import PreferenceSelect from "@/components/PreferenceSelect/PreferenceSelect";
import CustomTooltip from "@/components/Tooltip/CustomTooltip";
import { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";

const ReportConfiguration = () => {
  const [emailReportsEnabled, setEmailReportsEnabled] = useState(false);

  const handleToggle = () => {
    setEmailReportsEnabled(!emailReportsEnabled);
  };

  const Duration = [
    {label: "Last 7 days", value: "seven_days"},
    {label: "Last 15 days", value: "fifteen_days"},
    {label: "Last 30 days", value: "thirty_days"},
    {label: "Last 90 days", value: "ninety_days"},
  ];

  return (
    <div className="md:max-w-full max-w-sm flex justify-center  bg-gray-50 p-4">
      <div className="flex flex-col gap-6 w-full">
        {/* Title */}
        <h2 className="text-dowellDeepGreen md:text-[20px] font-semibold font-poppins tracking-tight text-center">
          Report Configuration
        </h2>

        {/* Select Time Frame Section */}
        <div className="flex  gap-2 flex-col ">
          <div className="flex items-center gap-2">
            <label htmlFor="" className="font-poppins tracking-tight font-semibold">
              Set time period for report
            </label>
            <CustomTooltip text="This is the time period for the report to be sent to your email.">
              <FaInfoCircle className="text-green-800" />
            </CustomTooltip>
          </div>
          <PreferenceSelect triggerClass="md:w-[420px] w-[320px] font-poppins tracking-tight" data={Duration} placeholder="Select time period" />
        </div>

        {/* Email Toggle Section */}
        <div className="flex items-center  gap-6">
          <p className=" text-sm font-medium font-poppins tracking-tight">
            Receive your daily reports via email
          </p>
          <button
            onClick={handleToggle}
            className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
              emailReportsEnabled ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                emailReportsEnabled ? "translate-x-4" : ""
              }`}
            ></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportConfiguration;

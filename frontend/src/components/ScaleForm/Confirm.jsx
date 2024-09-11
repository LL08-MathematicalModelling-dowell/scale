import {Link} from "react-router-dom";
import CustomHeader from "../CustomHeader/CustomHeader";
import {FaShareAlt} from "react-icons/fa";
import {useState, useEffect} from "react";
import { HiArrowLongLeft } from "react-icons/hi2";

const Confirm = () => {
  const [customizeDetails, setCustomizeDetails] = useState({});

  useEffect(() => {
    const savedDetails = localStorage.getItem("customizeData");
    if (savedDetails) {
      setCustomizeDetails(JSON.parse(savedDetails));
    }
  }, []);

  return (
    <div className="w-full ">
      <CustomHeader />
      <div className="px-2 md:px-20 flex flex-col  ">
        <Link to="/scale" className=" font-poppins text-md text-gray-800 tracking-tight pt-8 flex items-center gap-3 cursor-pointer"> <HiArrowLongLeft /> Go back home</Link>
      <div className="flex flex-col  items-center ">
        <div className="flex justify-center items-center md:mt-6 flex-col">
          <div>
            <dotlottie-player src="https://lottie.host/e4e6382d-7c3c-4282-afa6-b7d30ed0a0d8/jOgvbZ8sZ2.json" background="transparent" speed="1" style={{width: "300px", height: "300px", display: "block", overflow: "hidden"}} direction="1" playMode="normal" loop autoplay></dotlottie-player>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 ">
          <h2 className="font-poppins md:text-4xl text-lg tracking-tight font-bold">
            Your <span className="uppercase text-green-700">{customizeDetails?.scaleType}</span> Scale is ready!
          </h2>
          <p className="font-poppins text-sm text-center md:text-md font-normal">You can start sharing your scale on different platforms.</p>

          <Link className="font-poppins text-md py-2 px-8 bg-dowellDeepGreen text-white rounded-md flex items-center gap-2 mt-2 ">
            Share <FaShareAlt />
          </Link>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Confirm;

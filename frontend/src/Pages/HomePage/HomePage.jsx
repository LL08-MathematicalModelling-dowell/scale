import CustomHeader from "../../components/CustomHeader/CustomHeader";
import ScaleCard from "../../components/ScaleCard/ScaleCard";
import {useCurrentUserContext} from "../../contexts/CurrentUserContext";
import {useEffect, useState} from "react";
import {UserScaleData} from "../../data/DummyData";
import {FaFilter} from "react-icons/fa";
import ScaleCardSkeleton from "@/components/ScaleCard/ScaleCardSkeleton";
import {CircularProgress} from "@mui/material";
import smiley from "../../assets/smiley.png";
import { MdKeyboardArrowDown } from "react-icons/md";
import { BiReset } from "react-icons/bi";



const HomePage = () => {
  const {currentUser, currentUserDetailLoading} = useCurrentUserContext();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!currentUserDetailLoading) {
      const portfolioInfo = currentUser?.portfolio_info || [];
      const hasPortfolioInfo = portfolioInfo.length > 0;

      if (!hasPortfolioInfo) {
        setMessage("Please create an account to proceed.");
      } else {
        const hasLivingLabProduct = portfolioInfo.some((info) => info.product === "Living Lab Scales");
        if (!hasLivingLabProduct) {
          setMessage('Please create a portfolio with the "Living Lab Scales" product.');
        } else {
          setMessage("");
        }
      }
    }
  }, [currentUser, currentUserDetailLoading]);

  return (
    <div className="max-w-full min-h-screen bg-dowellBg">
      {/* <div>{currentUserDetailLoading ?  : message}</div> */}
      <div>
        <CustomHeader />
      </div>
      <div className="max-h-screen my-8 md:mx-6 mx-3 max-w-full">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-montserrat font-black tracking-tight text-2xl text-gray-800">My Favorites</h2>
              <img
                src={smiley}
                className="w-8"
                alt=""
              />
            </div>
            {currentUserDetailLoading ? (
              <p className="flex gap-2 text-sm font-poppins items-center font-medium">
                <CircularProgress size={20} /> Hang tight!, just a moment...
              </p>
            ) : message}
          </div>
          {currentUserDetailLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <ScaleCardSkeleton />
              <ScaleCardSkeleton />
              <ScaleCardSkeleton />
              <ScaleCardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {UserScaleData
                ? UserScaleData.scales.map((item, index) => (
                    <div key={index}>
                      <ScaleCard
                        scaleName={item.scaleName}
                        scaleImage={item.scaleImg}
                        scaleDescription={item.scaleDescription}
                      />
                    </div>
                  ))
                : null}
            </div>
          )}
        </div>
        {/* NPS SCALE DETAILS */}
        <div className="my-8">
          <div className="flex justify-between items-center flex-wrap">
            <h2 className="font-montserrat font-black tracking-tight text-2xl text-gray-800 pr-12 md:pr-0">Scales Details</h2>
            <div className="py-4 md:px-6 rounded-xl bg-white flex items-center gap-3">
              <div className="pr-5 border-r-[2px] border-gray-300 ">
                {" "}
                <FaFilter />
              </div>
              <div>
                {/* Filter By div */}
                <div>
                  <p className="font-poppins font-normal tracking-tight text-[12px] md:text-[15px] pr-3 border-r-[2px] border-gray-300">Filter By</p>
                </div>
              </div>
              {/* Date div */}
              <div className="flex gap-3 items-center pr-3 border-r-[2px] border-gray-300 cursor-pointer">
                <p className="font-poppins font-normal tracking-tight text-[12px] md:text-[15px] hover:scale-105">Date</p>
                <MdKeyboardArrowDown className="md:size-7 size-4 hover:scale-105" />
              </div>
              {/* Scale Type div */}
              <div className="flex gap-3 items-center pr-3 border-r-[2px] border-gray-300 cursor-pointer">
                <p className="font-poppins font-normal tracking-tight text-[12px] md:text-[15px] hover:scale-105">Scale Type</p>
                <MdKeyboardArrowDown className="md:size-7 size-4  hover:scale-105" />
              </div>
              {/* Reset Filter div */}
              <div className="flex gap-3 items-center cursor-pointer">
              <BiReset  className="md:size-6 size-4  hover:scale-105 text-red-500" />
                <p className="font-poppins font-normal tracking-tight text-[12px] md:text-[15px] hover:scale-105 text-red-500">Reset filter</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

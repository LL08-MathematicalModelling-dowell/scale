import {useEffect, useState} from "react";
import {FaFilter} from "react-icons/fa";
import {MdKeyboardArrowDown, MdKeyboardArrowUp} from "react-icons/md";
import {BiReset} from "react-icons/bi";
import smiley from "../../assets/smiley.png";
import NoFavorites from "../../assets/NoFav.png";
import DateRangeComp from "@/components/DateSelector/DateRangeComp";
import CustomHeader from "../../components/CustomHeader/CustomHeader";
import ScaleCard from "../../components/ScaleCard/ScaleCard";
import {useCurrentUserContext} from "../../contexts/CurrentUserContext";
import ScaleCardSkeleton from "@/components/ScaleCard/ScaleCardSkeleton";
import {CircularProgress} from "@mui/material";
import {UserScaleData} from "../../data/DummyData";

const HomePage = () => {
  const {currentUser, currentUserDetailLoading} = useCurrentUserContext();
  const [message, setMessage] = useState("");
  const [openSelect, setOpenSelect] = useState(false);
  const [openScale, setOpenScale] = useState(false);

  const handleOpenSelect = () => {
    setOpenSelect(!openSelect);
  };
  const handleScaleOpen = () => {
    setOpenScale(!openScale);
  };

  const handleResetFilter = () => {
    setOpenSelect(false);
    setOpenScale(false);
  }

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
      <div>
        <CustomHeader />
      </div>
      <div className="max-h-full my-8 md:mx-6 mx-3 max-w-full">
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
            ) : (
              message
            )}
          </div>
          {currentUserDetailLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <ScaleCardSkeleton />
              <ScaleCardSkeleton />
              <ScaleCardSkeleton />
              <ScaleCardSkeleton />
              <ScaleCardSkeleton />
            </div>
          ) : (
            <div>
              {UserScaleData.favorites.length === 0 ? (
                <div className="w-full flex justify-center items-center gap-3 flex-col md:flex-row">
                  <img
                    src={NoFavorites}
                    className="w-40 object-cover rounded-full h-40"
                    alt=""
                  />
                  <div>
                    <p className="font-bold font-montserrat text-3xl text-gray-800 tracking-tight mb-1">No favorites yet</p>
                    <p className="font-poppins text-sm tracking-tight text-gray-700">Your favorites list is currently empty</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {UserScaleData
                    ? UserScaleData.favorites.map((item, index) => (
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
          )}
        </div>
        <div className="my-20 h-screen">
          <div className="flex justify-between items-center flex-wrap">
            <h2 className="font-montserrat font-black tracking-tight text-2xl text-gray-800 pr-12 md:pr-0">Scales Details</h2>
            <div className="py-4 md:px-6 px-[9px] rounded-xl bg-white flex items-center gap-2  md:gap-3 relative">
              {/* Filter Icon */}
              <div className="pr-3 border-r-[2px] border-gray-300 ">
                <FaFilter />
              </div>
              {/* Filter By */}
              <div>
                <p className="font-poppins font-normal tracking-tight text-[12px] md:text-[15px] pr-3 border-r-[2px] border-gray-300">Filter By</p>
              </div>
              {/* Date */}
              <div
                className="flex gap-3 items-center pr-3 border-r-[2px] border-gray-300 cursor-pointer"
                onClick={handleOpenSelect}
              >
                <p className="font-poppins font-normal tracking-tight text-[12px] md:text-[15px] hover:scale-105">Date</p>
                {openSelect ? <MdKeyboardArrowUp className="md:size-7 size-4 hover:scale-105" /> : <MdKeyboardArrowDown className="md:size-7 size-4 hover:scale-105" />}
              </div>
              <div className="absolute top-16 right-12">{openSelect && <DateRangeComp onClose={() => setOpenSelect(false)} />}</div>
              {/* Scale Type */}
              <div
                className="flex gap-3 items-center pr-3 border-r-[2px] border-gray-300 cursor-pointer"
                onClick={handleScaleOpen}
              >
                <p className="font-poppins font-normal tracking-tight text-[12px] md:text-[15px] hover:scale-105">Scale Type</p>
                {openScale ? <MdKeyboardArrowUp className="md:size-7 size-4 hover:scale-105" /> : <MdKeyboardArrowDown className="md:size-7 size-4 hover:scale-105" />}
              </div>
              <div className="absolute md:top-16 md:right-32 top-12 right-12">
                {openScale && (
                  <div className="bg-white rounded-xl shadow-md p-4 md:w-50 w-30 flex flex-col gap-1">
                    {UserScaleData.scalesList.map((item, index) => (
                      <div key={index}>
                        <p className="text-[15px] font-poppins tracking-tight uppercase cursor-pointer hover:text-dowellDeepGreen hover:scale-105 transition-all ease-in-out duration-100 hover:font-semibold ">{item}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Reset Filter */}
              <div className="flex gap-1 md:gap-3 items-center cursor-pointer">
                <BiReset className="md:size-6 size-4 hover:scale-105 text-red-500" onClick={handleResetFilter}/>
                <p className="font-poppins font-normal tracking-tight text-[12px] md:text-[15px] hover:scale-105 text-red-500">Reset filter</p>
              </div>
            </div>
          </div>
         {/* Scale Details */}
        </div>
      </div>
    </div>
  );
};

export default HomePage;

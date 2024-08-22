import CustomHeader from "../../components/CustomHeader/CustomHeader";
import ScaleCard from "../../components/ScaleCard/ScaleCard";
import {useCurrentUserContext} from "../../contexts/CurrentUserContext";
import {useEffect, useState} from "react";
import {UserScaleData} from "../../data/DummyData";
import { FaFilter } from "react-icons/fa";

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
      <div>{currentUserDetailLoading ? "Loading..." : message}</div>
      <div>
        <CustomHeader />
      </div>
      <div className="max-h-screen my-8 mx-6 max-w-full">
        <div className="flex flex-col gap-4">
          <h2 className="font-montserrat font-black tracking-tight text-2xl text-gray-800">My Favorites</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
        </div>
        {/* NPS SCALE DETAILS */}
        <div className="my-8">
            <div className="flex justify-between items-center">
            <h2 className="font-montserrat font-black tracking-tight text-2xl text-gray-800">Scale Details</h2>
            <div className="py-2 px-6 rounded-xl bg-white flex items-center gap-2">
          <div className="pr-5 border-r-[2px] border-gray-300 ">  <FaFilter  /></div>
          <div>
            <div>
                {/* Continue Tomorrow */}
                <p>Date</p> 
            </div>
          </div>
            </div>
            </div>
        </div>
      </div>
      
    </div>
  );
};

export default HomePage;

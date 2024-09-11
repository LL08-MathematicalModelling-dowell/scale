import { useEffect, useState } from "react";
import desktop from '../../assets/desktop.jpg';

const Preview = () => {
  const [customizeDetails, setCustomizeDetails] = useState({});
  const [devicePreview, setDevicePreview] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isDesktopWidth = window.innerWidth >= 768; 

    if (isMobile && !isDesktopWidth) {
      setDevicePreview(false); 
      console.log("Mobile");
    } else {
      setDevicePreview(true); 
      console.log("Desktop");
    }
  }, []);

  useEffect(() => {
    const savedDetails = localStorage.getItem("customizeData");
    if (savedDetails) {
      setCustomizeDetails(JSON.parse(savedDetails));
    }
  }, []);

  return (
    <div className="w-full px-5">
      <h2 className="font-poppins text-2xl tracking-tight font-bold text-dowellDeepGreen text-center">Preview your scale</h2>
      <div className="mt-8">
        <h2 className="font-poppins md:text-2xl text-lg tracking-tight font-bold mb-2">
          Your <span className="uppercase">{customizeDetails?.scaleType}</span> Scale is ready!
        </h2>
        <p className="font-poppins text-sm font-normal">After confirmation, your scale will be saved and ready for use</p>
      </div>
      <div className="flex items-center justify-center mt-8">
        {customizeDetails?.scaleType === "nps lite" && (
          <div className="mt-5">
            {devicePreview ? (
              <>
                <p style={{ fontFamily: customizeDetails?.fontFamily, fontSize: customizeDetails?.fontSize, fontWeight: "600" }} className="tracking-wider text-sm font-normal">
                  How was your experience using our product? Please rate your experience below.
                </p>
                <div className="flex items-center justify-center mt-5 gap-8">
                  <div style={{ fontFamily: customizeDetails?.fontFamily, backgroundColor: customizeDetails?.leftScaleColor, color: customizeDetails?.fontColor, fontSize: customizeDetails?.fontSize }} className="py-3 px-14 rounded-md bg-gray-300">
                    Bad
                  </div>
                  <div style={{ fontFamily: customizeDetails?.fontFamily, backgroundColor: customizeDetails?.centerScaleColor, color: customizeDetails?.fontColor, fontSize: customizeDetails?.fontSize }} className="py-3 px-14 rounded-md bg-gray-300">
                    Average
                  </div>
                  <div style={{ fontFamily: customizeDetails?.fontFamily, backgroundColor: customizeDetails?.rightScaleColor, color: customizeDetails?.fontColor, fontSize: customizeDetails?.fontSize }} className="py-3 px-14 rounded-md bg-gray-300">
                    Excellent
                  </div>
                </div>
              </>
            ) : (
              <div>
                <img src={desktop} alt="Desktop preview" />
                <p className="text-center font-poppins text-md font-normal mt-2">Please preview on desktop</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview;

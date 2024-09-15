import { useEffect, useState } from "react";
import desktop from "../../assets/desktop.jpg";
import { Separator } from "../ui/separator";

const Preview = () => {
  const [customizeDetails, setCustomizeDetails] = useState({});
  const [devicePreview, setDevicePreview] = useState(false);
  const [scaleLength, setScaleLength] = useState([]);

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

  const npsLength = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

useEffect(() => {
  if (customizeDetails.scaleUpperLimit !== undefined && customizeDetails.scaleLowerLimit !== undefined) {
    const upperLimit = customizeDetails.scaleUpperLimit;
    const lowerLimit = -Math.abs(customizeDetails.scaleLowerLimit)
    const scaleRange = customizeDetails.spacingUnit;
    console.log(scaleRange)

    const scaleArray = [];
    for (let i = lowerLimit; i <= upperLimit; i++) {
      scaleArray.push(i);
    }
    setScaleLength(scaleArray);
  }
}, [customizeDetails]);

const likertEmojis =  customizeDetails.scaleEmojis

  

  return (
    <div className="w-full px-5">
      <h2 className="font-poppins text-2xl tracking-tight font-bold text-dowellDeepGreen text-center">Preview your scale</h2>
      <div className="mt-8">
        <h2 className="font-poppins md:text-2xl text-lg tracking-tight font-bold mb-2">
          Your <span className="uppercase">{customizeDetails?.scaleType}</span> Scale is ready!
        </h2>
        <p className="font-poppins text-sm font-normal">After confirmation, your scale will be saved and ready for use</p>
      </div>
      <Separator className="md:mt-10 mt-8" />
      <div className="flex items-center justify-center mt-8">
        {/* NPS LITE PREVIEW */}
        {customizeDetails?.scaleType === "nps lite" && (
          <div className="mt-5">
            {devicePreview ? (
              <>
              <p style={{fontFamily: customizeDetails?.fontFamily}} className="tracking-tight md:text-[16px] text-sm font-medium">
                  How was your experience using our product? Please rate your experience below.
                </p>
                <div className="flex items-center justify-center mt-5 gap-8">
                  <div style={{fontFamily: customizeDetails?.fontFamily, backgroundColor: customizeDetails?.leftScaleColor, color: customizeDetails?.fontColor, fontSize: customizeDetails?.fontSize}} className="md:py-2 md:px-12 rounded-md py-2 px-6 bg-gray-300">
             {customizeDetails.scaleFormat === "Emojis" ? <p className="text-xl">😟</p> : "Bad"}
                  </div>
                  <div style={{fontFamily: customizeDetails?.fontFamily, backgroundColor: customizeDetails?.centerScaleColor, color: customizeDetails?.fontColor, fontSize: customizeDetails?.fontSize}} className="md:py-2 md:px-12 rounded-md py-2 px-6 bg-gray-300">
                  {customizeDetails.scaleFormat === "Emojis" ? <p className="text-xl">😐</p> : "Average"}
                  </div>
                  <div style={{fontFamily: customizeDetails?.fontFamily, backgroundColor: customizeDetails?.rightScaleColor, color: customizeDetails?.fontColor, fontSize: customizeDetails?.fontSize}} className="md:py-2 py-2 px-6 md:px-12 rounded-md bg-gray-300">
                  {customizeDetails.scaleFormat === "Emojis" ? <p className="text-xl">😁</p> : "Good"}
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

        {/* NPS SCALE */}
        {customizeDetails?.scaleType === "nps" && (
          <div className="mt-5 ">
            {devicePreview ? (
              <>
               <p style={{fontFamily: customizeDetails?.fontFamily}} className="tracking-tight md:text-[16px] text-sm font-medium">
                  How was your experience using our product? Please rate your experience below.
                </p>
                <div className="flex items-center justify-center mt-5 gap-2 flex-col">
                  <div style={{borderColor: customizeDetails.scaleColor}} className="flex flex-row items-center justify-center border  rounded-md py-2 px-4 w-full gap-2 md:gap-6">
                    {npsLength?.map((item, index) => (
                      <div key={index} style={{backgroundColor: customizeDetails.scaleBackgroundColor, color: customizeDetails.fontColor}} className={`md:w-8 md:h-8 w-6 h-6 flex items-center justify-center rounded-md`}>
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between w-full">
                    <p style={{fontFamily: customizeDetails?.fontFamily}} className="tracking-tight md:text-md text-sm font-normal">
                      Bad
                    </p>
                    <p style={{fontFamily: customizeDetails?.fontFamily}} className="tracking-tight md:text-md text-sm font-normal">
                      Average
                    </p>
                    <p style={{fontFamily: customizeDetails?.fontFamily}} className="tracking-tight md:text-md text-sm font-normal">
                      Good
                    </p>
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

        {/* STAPEL PREVIEW */}
        {customizeDetails?.scaleType === "stapel" && (
          <div className="mt-5 ">
            {devicePreview ? (
              <>
                 <p style={{fontFamily: customizeDetails?.fontFamily}} className="tracking-tight md:text-[16px] text-sm font-medium">
                  How was your experience using our product? Please rate your experience below.
                </p>
                <div className="flex items-center justify-center mt-5 gap-2 flex-col">
                  <div style={{borderColor: customizeDetails.scaleColor}} className="flex flex-row items-center justify-center border  rounded-md py-2 px-4 w-full gap-2 md:gap-4">
                    {scaleLength?.map((item, index) => (
                      <div key={index} style={{backgroundColor: customizeDetails.scaleBackgroundColor, color: customizeDetails.fontColor}} className={`md:w-8 md:h-8 w-6 h-6 flex items-center justify-center rounded-md`}>
                        {item}
                      </div>
                    ))}
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


        {/* Likert Preview */}
        {customizeDetails?.scaleType === "likert" && (
          <div className="mt-5 ">
            {devicePreview ? (
              <>
                <p style={{fontFamily: customizeDetails?.fontFamily}} className="tracking-tight md:text-[16px] text-sm font-medium">
                  How was your experience using our product? Please rate your experience below.
                </p>
                <div className="flex items-center justify-center mt-5 gap-2 flex-col">
                  <div style={{borderColor: customizeDetails.scaleColor}} className="flex flex-row items-center justify-center border  rounded-md py-2 px-1 w-full gap-8 md:gap-8">
                    {likertEmojis?.map((item, index) => (
                      <div key={index} style={{backgroundColor: customizeDetails.scaleBackgroundColor, color: customizeDetails.fontColor}} className={`md:w-20 md:h-9 w-6 h-6 flex items-center justify-center rounded-md text-sm md:text-[20px]`}>
                        {item}
                      </div>
                    ))}
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

import { useEffect, useState } from "react";
import desktop from "../../assets/desktop.jpg";
import { Separator } from "../ui/separator";

const Preview = () => {
  const [customizeDetails, setCustomizeDetails] = useState({});
  const [devicePreview, setDevicePreview] = useState(false);
  const [likertData, setLikertData] = useState([]);

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

  useEffect(() => {
    if (customizeDetails.scalePointers) {
      const scalePointer = [];
      const likertEmojis = customizeDetails.scaleEmojis;
  
      console.log("Customize Details: ", customizeDetails);
  
      for (let i = 1; i <= customizeDetails.scalePointers; i++) {
        const pointerValue = customizeDetails[`scalePointer${i}`];
        console.log(`Scale Pointer ${i}: `, pointerValue);
        if (pointerValue !== undefined) {
          scalePointer.push(pointerValue);
        }
      }
  
      if (customizeDetails.scaleFormat === "Number") {
        setLikertData(scalePointer);
      } else if (customizeDetails.scaleFormat === "Emojis") {
        setLikertData(likertEmojis);
      }
    }
  }, [customizeDetails]);
  
  console.log("Likert Data: ", likertData);

  return (
    <div className="w-full px-5">
      <h2 className="font-poppins text-2xl tracking-tight font-bold text-dowellDeepGreen text-center">
        Preview your scale
      </h2>
      <div className="mt-8">
        <h2 className="font-poppins md:text-2xl text-lg tracking-tight font-bold mb-2">
          Your <span className="uppercase">{customizeDetails?.scaleType}</span> Scale is ready!
        </h2>
        <p className="font-poppins text-sm font-normal">
          After confirmation, your scale will be saved and ready for use
        </p>
      </div>
      <Separator className="md:mt-10 mt-8" />
      <div className="flex items-center justify-center mt-8">
        {customizeDetails?.scaleType === "likert" && (
          <div className="mt-5">
            {devicePreview ? (
              <>
                <p
                  style={{ fontFamily: customizeDetails?.fontFamily }}
                  className="tracking-tight md:text-[16px] text-sm font-medium"
                >
                  How was your experience using our product? Please rate your experience below.
                </p>
                <div className="flex items-center justify-center mt-5 gap-2 flex-col">
                  <div
                    style={{ borderColor: customizeDetails.scaleColor }}
                    className="flex flex-row items-center justify-center border rounded-md py-2 px-1 w-full gap-8 md:gap-8"
                  >
                    {likertData.length > 0 ? (
                      likertData?.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            backgroundColor: customizeDetails.scaleBackgroundColor,
                            color: customizeDetails.fontColor,
                          }}
                          className={`md:w-20 md:h-9 w-6 h-6 flex items-center justify-center rounded-md text-sm md:text-[20px]`}
                        >
                          {item}
                        </div>
                      ))
                    ) : (
                      <p>No scale pointers available</p>
                    )}
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

// import ScaleInput from "./SelectField/ScaleInput";
// import FontPicker from "font-picker-react";
import {useState} from "react";
import SelectInput from "./SelectField/SelectInput";

const Customize = () => {
  const [activeFontFamily, setActiveFontFamily] = useState("Open Sans");
  const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
//   const [font, setFont] = useState("16px");

  const fontSizes = ["8px", "10px", "12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"];
  const screenOrientation = ["1920×1080",
  "1366×768", 
  "1536×864", 
  "1280×800",   
  "1600×900", 
  "1680×1050",  
  "2560×1440",  
  "3840×2160",  
  "7680×4320", 
  "1280×720",   
  "1024×768", 
  "800×600",];

  return (
    <div className="w-full px-5 ">
      <h2 className="text-2xl font-bold tracking-tight text-center font-poppins text-dowellDeepGreen">Customize your scale</h2>

      <div className="flex flex-col w-full gap-6 my-12">
        <div>
          <p className="mb-1 text-sm font-medium font-poppins text-dowellDeepGreen">Scale Orientation</p>
         {screenOrientation.length > 0 && (
             <SelectInput data={screenOrientation} className="md:w-[30%] py-6 font-poppins text-[13px] font-medium text-dowellDeepGreen focus:ring-dowellDeepGreen" placeholder="-- Select Orientation --" />
         )}
        </div>
        {/* For Font, color and size */}

        <div className="flex flex-col w-full gap-6 md:flex-row">
          <div className="w-[80%] md:w-[30%]">
            <p className="mb-1 text-sm font-medium font-poppins text-dowellDeepGreen">-- Font style -- </p>
            <div className="px-4 py-2 bg-white rounded-lg shadow-md">
              <FontPicker apiKey={googleApiKey} activeFontFamily={activeFontFamily} onChange={(nextFont) => setActiveFontFamily(nextFont.family)} />
            </div>
            <p style={{fontFamily: activeFontFamily, fontSize: 13, marginTop: 2}}>-- Here is the preview of font style --</p>
          </div>
          {/* For Font Color */}
          <div className="md:w-[19%] w-[40%]">
            <p className="mb-2 text-sm font-medium font-poppins text-dowellDeepGreen">-- Font Color --</p>
            <div className="bg-white rounded-lg shadow-md px-7 py-[10px]">
              <input type="color" />
            </div>
          </div>
          {/* For Font Sizes */}
          <div className="w-full">
            <p className="mb-2 text-sm font-medium font-poppins text-dowellDeepGreen">-- Font Size --</p>
            {fontSizes.length > 0 && <SelectInput data={fontSizes} className="md:w-[30%] font-poppins text-[13px] font-medium text-dowellDeepGreen focus:ring-dowellDeepGreen py-6" placeholder="16px" />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customize;

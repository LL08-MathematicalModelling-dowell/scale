// import ScaleInput from "./SelectField/ScaleInput";
import FontPicker from "font-picker-react";
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
      <h2 className="font-poppins text-2xl tracking-tight font-bold text-dowellDeepGreen text-center">Customize your scale</h2>

      <div className="w-full  my-12  flex flex-col gap-6">
        <div>
          <p className="font-poppins text-sm font-medium text-dowellDeepGreen mb-1">Scale Orientation</p>
         {screenOrientation.length > 0 && (
             <SelectInput data={screenOrientation} className="md:w-[30%] py-6 font-poppins text-[13px] font-medium text-dowellDeepGreen focus:ring-dowellDeepGreen" placeholder="-- Select Orientation --" />
         )}
        </div>
        {/* For Font, color and size */}

        <div className="flex gap-6 md:flex-row flex-col w-full">
          <div className="w-[80%] md:w-[30%]">
            <p className="font-poppins text-sm font-medium text-dowellDeepGreen mb-1">-- Font style -- </p>
            <div className="bg-white rounded-lg shadow-md px-4 py-2">
              <FontPicker apiKey={googleApiKey} activeFontFamily={activeFontFamily} onChange={(nextFont) => setActiveFontFamily(nextFont.family)} />
            </div>
            <p style={{fontFamily: activeFontFamily, fontSize: 13, marginTop: 2}}>-- Here is the preview of font style --</p>
          </div>
          {/* For Font Color */}
          <div className="md:w-[19%] w-[40%]">
            <p className="font-poppins text-sm font-medium text-dowellDeepGreen mb-2">-- Font Color --</p>
            <div className="bg-white rounded-lg shadow-md px-7 py-[10px]">
              <input type="color" />
            </div>
          </div>
          {/* For Font Sizes */}
          <div className="w-full">
            <p className="font-poppins text-sm font-medium text-dowellDeepGreen mb-2">-- Font Size --</p>
            {fontSizes.length > 0 && <SelectInput data={fontSizes} className="md:w-[30%] font-poppins text-[13px] font-medium text-dowellDeepGreen focus:ring-dowellDeepGreen py-6" placeholder="16px" />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customize;

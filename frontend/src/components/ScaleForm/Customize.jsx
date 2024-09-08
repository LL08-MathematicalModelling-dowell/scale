import ScaleInput from "./SelectField/ScaleInput";
import FontPicker from "font-picker-react";
import {useState} from "react";

const Customize = () => {
  const [activeFontFamily, setActiveFontFamily] = useState("Open Sans");

  return (
    <div className="max-w-full">
      <h2 className="font-poppins text-2xl tracking-tight font-bold text-dowellDeepGreen text-center">Customize your scale</h2>

      <div className="w-[40%] my-12  flex flex-col gap-4">
        <div className="w-[50%]">
          <p className="font-poppins text-sm font-medium text-dowellDeepGreen mb-2">-- Font style -- </p>
          <div className="bg-white rounded-lg shadow-md px-4 py-2">
            <FontPicker apiKey="AIzaSyC4FjDCzZ1HekaXMLfdlYrATjT3fmSZtto" activeFontFamily={activeFontFamily} onChange={(nextFont) => setActiveFontFamily(nextFont.family)} />
          </div>
          <p style={{ fontFamily: activeFontFamily }}>Here is the preview of font style</p>
        </div>
      </div>
    </div>
  );
};

export default Customize;

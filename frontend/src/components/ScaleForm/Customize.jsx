import {CgColorPicker} from "react-icons/cg";
import SelectInput from "./SelectField/SelectInput";
import {useEffect, useRef, useState} from "react";
import ScaleInput from "./SelectField/ScaleInput";

const Customize = () => {
  const [ScaleType, setScaleType] = useState(null);
  const [inputCount, setInputCount] = useState([]);
  const [customizeData, setCustomizeData] = useState(() => {
    const savedData = localStorage.getItem("customizeData");
    if (savedData) {
      return JSON.parse(savedData);
    } else {
      return {
        scaleType: null,
        fontColor: "#f3f3f3",
        leftScaleColor: "#f3f3f3",
        rightScaleColor: "#f3f3f3",
        centerScaleColor: "#f3f3f3",
        scaleColor: "#f3f3f3",
        scaleBackgroundColor: "#f3f3f3",
        scaleOrientation: "",
        fontSize: " ",
        fontFamily: "",
        scaleFormat: "",
        scaleUpperLimit: "",
        scaleLowerLimit: "",
        spacingUnit: "",
        scalePointers: 0,
        scaleEmojis: [], // Changed from separate properties to an array
      };
    }
  });

  useEffect(() => {
    const selectedScale = localStorage.getItem("selectedScaleName");
    console.log(selectedScale);
    if (selectedScale) {
      setScaleType(selectedScale);
    }
  }, []);

  useEffect(() => {
    if (ScaleType !== null) {
      setCustomizeData((prevData) => ({
        ...prevData,
        scaleType: ScaleType,
      }));
    }
  }, [ScaleType]);

  useEffect(() => {
    localStorage.setItem("customizeData", JSON.stringify(customizeData));
  }, [customizeData]);

  const fontColorRef = useRef(null);
  const leftScaleColorRef = useRef(null);
  const rightScaleColorRef = useRef(null);
  const centerScaleColorRef = useRef(null);
  const scaleColorRef = useRef(null);
  const scaleBackgroundColorRef = useRef(null);

  const handleChange = (field) => (value) => {
    setCustomizeData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

    const fieldInput = customizeData.scalePointers;
    console.log(fieldInput);
  };

  useEffect(() => {
    const scalePointers = customizeData.scalePointers;
    if (scalePointers) {
      setInputCount(Array.from({length: scalePointers}, (_, i) => i));
    }
  }, [customizeData.scalePointers]);

  const handlePointerChange = (index) => (e) => {
    const value = e.target.value;
    setCustomizeData((prevData) => ({
      ...prevData,
      [`scalePointer${index + 1}`]: value,
    }));
  };

  const handleEmojiChange = (index) => (value) => {
    setCustomizeData((prevData) => {
      const emojiArray = [...(prevData.scaleEmojis || [])]; // Ensure it's an array
      emojiArray[index] = value;
      return {
        ...prevData,
        scaleEmojis: emojiArray,
      };
    });
  };

  const handleColorChange = (colorField) => (e) => {
    setCustomizeData((prevData) => ({
      ...prevData,
      [colorField]: e.target.value,
    }));
  };

  const handleUpperLimit = (e) => {
    setCustomizeData({
      ...customizeData,
      scalePointer: e.target.value,
    });
  };

  const handleLowerLimit = (e) => {
    setCustomizeData({...customizeData, scaleLowerLimit: e.target.value});
  };

  const handleSpacingUnit = (e) => {
    setCustomizeData({
      ...customizeData,
      spacingUnit: e.target.value,
    });
  };

  console.log(customizeData);

  const fontFamilyOptions = ["Arial", "Verdana", "Times New Roman", "Courier New", "Georgia", "Garamond", "Trebuchet MS", "Impact", "Comic Sans MS", "Lucida Sans Unicode", "Tahoma", "Palatino Linotype", "Book Antiqua", "Lucida Console"];
  const fontSizeOptions = ["8px", "10px", "12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"];
  const screenOrientationOptions = ["Horizontal", "Vertical"];
  const scaleFormatOptions = ["Number", "Text", "Emojis"];
  const scalePointers = [2, 3, 4, 5, 7, 9];
  const emojis = ["😠", "😡", "😞", "😟", "😐", "🙂", "😊", "😄", "😁", "😃", "😍", "🥰", "🤩", "🎉", "👍", "👌", "👏", "🙌", "💯"];

  useEffect(() => {
    localStorage.setItem("customizeData", JSON.stringify(customizeData));
  }, [customizeData]);

  return (
    <div className="w-full px-5 ">
      <h2 className="font-poppins text-2xl tracking-tight font-bold text-dowellDeepGreen text-center">Customize your scale</h2>

      <div className="w-full my-12 flex flex-col gap-6">
        <div>
          <p className="font-poppins text-sm font-medium text-dowellDeepGreen mb-1">Scale Orientation</p>
          {screenOrientationOptions.length > 0 && <SelectInput onChange={handleChange("scaleOrientation")} data={screenOrientationOptions} className="md:w-[30%] py-6 font-poppins text-[13px] font-medium text-dowellDeepGreen focus:ring-dowellDeepGreen" placeholder="-- Select Orientation --" />}
        </div>

        <div className="flex gap-6 md:flex-row flex-col w-full">
          <div className="w-[80%] md:w-[30%]">
            <p className="font-poppins text-sm font-medium text-dowellDeepGreen mb-1">-- Font style --</p>
            <SelectInput onChange={handleChange("fontFamily")} data={fontFamilyOptions} className="w-full py-6 font-poppins text-[13px] font-medium text-dowellDeepGreen focus:ring-dowellDeepGreen" placeholder="-- Select font family --" />
          </div>

          <div className="md:w-[19%] w-[40%]">
            <p className="font-poppins text-sm font-medium text-dowellDeepGreen mb-2">-- Font Color --</p>
            <div className="bg-white rounded-lg shadow-md px-7 py-[10px] flex items-center gap-6">
              <input type="color" ref={fontColorRef} value={customizeData.fontColor} onChange={handleColorChange("fontColor")} />
              <CgColorPicker className="size-5 cursor-pointer" onClick={() => fontColorRef.current.click()} />
            </div>
          </div>

          <div className="w-full">
            <p className="font-poppins text-sm font-medium text-dowellDeepGreen mb-2">-- Font Size --</p>
            <SelectInput onChange={handleChange("fontSize")} data={fontSizeOptions} className="md:w-[30%] font-poppins text-[13px] font-medium text-dowellDeepGreen focus:ring-dowellDeepGreen py-6" placeholder="16px" />
          </div>
        </div>

        <div>
          <p className="font-poppins text-sm font-medium text-dowellDeepGreen mb-2">-- Scale format --</p>
          <SelectInput onChange={handleChange("scaleFormat")} className="md:w-[30%] py-6 font-poppins text-[13px] font-medium text-dowellDeepGreen focus:ring-dowellDeepGreen" data={scaleFormatOptions} placeholder="-- Select Format --" required />
        </div>
        {/* NPS LITE */}
        {ScaleType === "nps lite" && (
          <div className="flex gap-6 md:flex-row flex-col w-full">
            <div>
              <p className="font-poppins text-sm font-medium text-dowellDeepGreen mb-2">-- Left Scale Color --</p>
              <div className="bg-white rounded-lg shadow-md px-7 py-[10px] flex items-center gap-6">
                <input type="color" ref={leftScaleColorRef} value={customizeData.leftScaleColor} onChange={handleColorChange("leftScaleColor")} />
                <CgColorPicker className="size-5 cursor-pointer" onClick={() => leftScaleColorRef.current.click()} />
              </div>
            </div>

            <div>
              <p className="font-poppins text-sm font-medium text-dowellDeepGreen mb-2">-- Center Scale Color --</p>
              <div className="bg-white rounded-lg shadow-md px-7 py-[10px] flex items-center gap-6">
                <input type="color" ref={centerScaleColorRef} value={customizeData.centerScaleColor} onChange={handleColorChange("centerScaleColor")} />
                <CgColorPicker className="size-5 cursor-pointer" onClick={() => centerScaleColorRef.current.click()} />
              </div>
            </div>

            <div>
              <p className="font-poppins text-sm font-medium text-dowellDeepGreen mb-2">-- Right Scale Color --</p>
              <div className="bg-white rounded-lg shadow-md px-6 py-[10px] flex items-center gap-6">
                <input type="color" ref={rightScaleColorRef} value={customizeData.rightScaleColor} onChange={handleColorChange("rightScaleColor")} />
                <CgColorPicker className="size-5 cursor-pointer" onClick={() => rightScaleColorRef.current.click()} />
              </div>
            </div>
          </div>
        )}
        {/* Nps Scale */}
        {ScaleType === "nps" && (
          <div className="flex gap-6 md:flex-row flex-col w-full">
            <div>
              <p className="font-poppins text-sm font-medium text-dowellDeepGreen mb-2">-- Scale Color --</p>
              <div className="bg-white rounded-lg shadow-md px-7 py-[10px] flex items-center gap-6">
                <input type="color" ref={scaleColorRef} value={customizeData.scaleColor} onChange={handleColorChange("scaleColor")} />
                <CgColorPicker className="size-5 cursor-pointer" onClick={() => scaleColorRef.current.click()} />
              </div>
            </div>

            <div>
              <p className="font-poppins text-sm font-medium text-dowellDeepGreen mb-2">-- Scale background color --</p>
              <div className="bg-white rounded-lg shadow-md px-6 py-[10px] flex items-center gap-6">
                <input type="color" ref={scaleBackgroundColorRef} value={customizeData.scaleBackgroundColor} onChange={handleColorChange("scaleBackgroundColor")} />
                <CgColorPicker className="size-5 cursor-pointer" onClick={() => scaleBackgroundColorRef.current.click()} />
              </div>
            </div>
          </div>
        )}

        {/* Staple Type */}
        {ScaleType === "stapel" && (
          <div className="flex flex-col gap-7 w-full">
            <div className="flex md:w-[50%] md:flex-row flex-col w-full gap-7 ">
              <ScaleInput type="number" placeholder="Enter Value" label="Scale Upper Limit" onChange={handleUpperLimit} value={customizeData.scaleUpperLimit} className="text-sm" text="Maximum number of rating" />
              <ScaleInput type="number" placeholder="Enter Value" label="Scale Lower Limit" onChange={handleLowerLimit} value={customizeData.scaleLowerLimit} className="text-sm" text="Minimum number of rating" />
              <ScaleInput type="number" placeholder="Enter Value" label="Spacing Unit" onChange={handleSpacingUnit} value={customizeData.spacingUnit} className="text-sm" text="Spacing between each rating" />
            </div>
            <div className="flex gap-6 md:flex-row flex-col w-full">
              <div>
                <p className="font-poppins text-sm font-medium text-dowellDeepGreen mb-2">-- Scale Color --</p>
                <div className="bg-white rounded-lg shadow-md px-7 py-[10px] flex items-center gap-6">
                  <input className="" type="color" ref={scaleColorRef} value={customizeData.scaleColor} onChange={handleColorChange("scaleColor")} />
                  <CgColorPicker className="size-5 cursor-pointer" onClick={() => scaleColorRef.current.click()} />
                </div>
              </div>

              <div>
                <p className="font-poppins text-sm font-medium text-dowellDeepGreen mb-2">-- Scale background color --</p>
                <div className="bg-white rounded-lg shadow-md px-6 py-[10px] flex items-center gap-6">
                  <input type="color" ref={scaleBackgroundColorRef} value={customizeData.scaleBackgroundColor} onChange={handleColorChange("scaleBackgroundColor")} />
                  <CgColorPicker className="size-5 cursor-pointer" onClick={() => scaleBackgroundColorRef.current.click()} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Likert scale Type */}
        {ScaleType === "likert" && (
          <div>
            <div className="flex flex-col gap-7 w-full">
              <div className="flex gap-6 md:flex-row flex-col w-full">
                <div>
                  <p className="font-poppins text-sm font-medium text-dowellDeepGreen mb-2">-- Scale Color --</p>
                  <div className="bg-white rounded-lg shadow-md px-7 py-[10px] flex items-center gap-6">
                    <input className="" type="color" ref={scaleColorRef} value={customizeData.scaleColor} onChange={handleColorChange("scaleColor")} />
                    <CgColorPicker className="size-5 cursor-pointer" onClick={() => scaleColorRef.current.click()} />
                  </div>
                </div>

                <div>
                  <p className="font-poppins text-sm font-medium text-dowellDeepGreen mb-2">-- Scale background color --</p>
                  <div className="bg-white rounded-lg shadow-md px-6 py-[10px] flex items-center gap-6">
                    <input type="color" ref={scaleBackgroundColorRef} value={customizeData.scaleBackgroundColor} onChange={handleColorChange("scaleBackgroundColor")} />
                    <CgColorPicker className="size-5 cursor-pointer" onClick={() => scaleBackgroundColorRef.current.click()} />
                  </div>
                </div>
              </div>
              <div className="flex gap-6 md:flex-row flex-col w-full">
                <div className="w-[70%]">
                  <p className="font-poppins text-sm font-medium text-dowellDeepGreen mb-1">Scale Pointers</p>
                  <SelectInput onChange={handleChange("scalePointers")} data={scalePointers} className="md:w-[30%] py-6 font-poppins text-[13px] font-medium text-dowellDeepGreen focus:ring-dowellDeepGreen" placeholder="-- Select Scale Pointers --" forText="Pointer" />
                </div>
              </div>
              <div className="max-w-full">
                <div className="flex flex-wrap md:flex-row md:w-46 flex-col w-full gap-2">
                  {customizeData.scaleFormat === "Number" ? (
                    inputCount.map((_, index) => (
                      <ScaleInput
                        key={index}
                        type="number"
                        placeholder={`Enter Value ${index + 1}`}
                        label={`Scale pointer ${index + 1}`}
                        onChange={handlePointerChange(index)}
                        value={customizeData[`scalePointer${index + 1}`] || ""}
                        className="text-[12px]"
                        text={`Total number for pointer ${index + 1}`}
                      />
                    ))
                  ) : (
                    <> </>
                  )}
                  {customizeData.scaleFormat === "Emojis" &&
                    inputCount.map((_, index) => (
                      <SelectInput
                        key={index}
                        onChange={handleEmojiChange(index)} // Pass the index directly
                        data={emojis}
                        className="w-full py-6 font-poppins text-[13px] font-medium text-dowellDeepGreen focus:ring-dowellDeepGreen"
                        placeholder="-- Select Emoji --"
                      />
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customize;
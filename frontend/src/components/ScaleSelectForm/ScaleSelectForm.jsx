import {useState, useEffect} from "react";
import {UserScaleData} from "@/data/DummyData";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import NoImage from "./../../assets/NoImg.png";

const ScaleSelectForm = () => {
  const [selectedScale, setSelectedScale] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const handleModal = () => {
    setOpenModal(!openModal);
    console.log(selectedScale);
  };

  useEffect(() => {
    const savedScaleName = localStorage.getItem("selectedScaleName");
    if (savedScaleName) {
      const savedScale = UserScaleData.scales.find((item) => item.scaleName === savedScaleName);
      setSelectedScale(savedScale);
    }
  }, []);

  const data = UserScaleData.scales.map((item) => ({
    scaleName: item.scaleName,
    scaleDescription: item.scaleDescription,
    scaleImg: item.scaleImg,
  }));

  const handleScaleChange = (value) => {
    const selected = data.find((item) => item.scaleName === value);
    setSelectedScale(selected);
    localStorage.setItem("selectedScaleName", value);
  };

  const renderPreviewComponent = () => {
    if (!selectedScale) {
      return null;
    }
    switch (selectedScale.scaleName) {
      case "nps":
        return <div>Hey</div>;
      case "nps lite":
        return <div>Lite NPS</div>;
      case "stapel":
        return <div>Stapel</div>;
      case "likert":
        return <div>Likert</div>;
      case "percent":
        return <div>Percent</div>;
      case "percent_sum":
        return <div>Percent_sum</div>;
      case "guttman":
        return <div>Guttman</div>;
      case "thurstone":
        return <div>Thurstone</div>;
      case "paired comparison":
        return <div>Paired comparison</div>;
      case "ranking":
        return <div>Ranking</div>;
      case "q sort":
        return <div>Q Sort</div>;
      case "mokken":
        return <div>Mokeen</div>;
      case "proximity":
        return <div>Proximity</div>;
      case "perceptual mapping":
        return <div>Perceptual mapping</div>;
      case "learning level index":
        return <div>Learning level index</div>;

      default:
        break;
    }
  };

  return (
    <div className="flex justify-center flex-col md:flex-row gap-4 md:mx-20 relative">
      <div className="flex flex-col gap-6 md:w-2/3 md:pr-28">
        <h2 className="font-montserrat tracking-tight text-3xl font-bold">Choose Scale</h2>
        <div>
          <Select value={selectedScale?.scaleName || " "} onValueChange={handleScaleChange}>
            <SelectTrigger className="w-[300px] focus:ring-1 focus:ring-green-200 outline-none border-[1px] uppercase font-semibold">
              <SelectValue placeholder="Select scale type" />
            </SelectTrigger>
            <SelectContent>
              {data.map((item, index) => (
                <SelectItem key={index} value={item.scaleName} className="font-normal font-poppins uppercase">
                  {item.scaleName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <h2 className="font-montserrat tracking-tight text-2xl font-bold">Scale Description</h2>
        {selectedScale && <p className="font-poppins md:text-[18px] text-[13.5px] tracking-tight">{selectedScale.scaleDescription}</p>}
        <div className="flex items-center gap-x-6">
          <p className="text-[18px] font-poppins tracking-tight font-normal">
            Are you <span className="font-black">Curious</span> to see your scale? ❤️
          </p>
          <button onClick={handleModal} className="py-2 px-7 bg-gradient-to-r from-green-400 via-cyan-900 to-blue-500 text-white rounded-lg font-pacifico font-regular text-[15px] shadow-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 ease-in-out">
            Preview Scale
          </button>
        </div>
        {openModal && (
          <div onClick={() => setOpenModal(false)} className="bg-black/80 fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
            <div className="bg-white w-[90%] md:w-[50%] h-[90%] md:h-[80%] rounded-xl flex flex-col items-center justify-center gap-4">{renderPreviewComponent()}</div>
          </div>
        )}
      </div>
      <div className="flex flex-col md:w-1/3">
        <div>
          {!selectedScale || !selectedScale.scaleImg || selectedScale.scaleImg.trim() === "" ? (
            <img src={NoImage} alt="No scale image" className="w-full h-[300px] object-cover" />
          ) : (
            <img
              src={selectedScale.scaleImg}
              alt="Scale Image"
              className="w-full h-[300px] object-cover rounded-xl"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = NoImage;
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ScaleSelectForm;

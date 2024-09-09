import {useState} from "react";
import ScaleInput from "./SelectField/ScaleInput";
import {FaPlusCircle} from "react-icons/fa";
import {FaMinusCircle} from "react-icons/fa";

const Configure = () => {
  const [instances, setInstances] = useState([1]);

  const createInstance = () => {
    setInstances([...instances, instances.length + 1]);
  };
  const removeInstance = () => {
    if (instances.length > 1) {
      setInstances(instances.slice(0, -1));
    }
  };
  return (
    <div className=" max-w-sm md:max-w-full">
      <h2 className="font-poppins text-2xl tracking-tight font-bold text-dowellDeepGreen text-center">Configure your scale</h2>
      <div className="mt-12  flex md:flex-row flex-col md:gap-2 gap-8 justify-evenly px-5  relative">
        <div className="md:w-[40%] w-full flex flex-col gap-8">
          <ScaleInput type="text" placeholder="Enter scale name" label="Scale Name" />
          <ScaleInput type="text" placeholder="Enter channel name" label="Specify Channel" />
        </div>
        <div className="md:w-[40%] flex flex-col gap-8 w-full">
          <ScaleInput type="text" placeholder="Enter number" label="No. response per instance" />
          {instances.map((item, index) => (
            <ScaleInput key={index} type="text" placeholder={`Enter instance name ${item}`} label={`Specify instances ${item}`} />
          ))}
        </div>
        <div className="flex gap-3 md:right-5 md:bottom-3 bottom-14 right-5 absolute items-center">
          <FaPlusCircle className="size-7 text-dowellDeepGreen cursor-pointer " onClick={createInstance} />
          <FaMinusCircle className="size-7 text-red-500 cursor-pointer " onClick={removeInstance} />
        </div>
      </div>
    </div>
  );
};

export default Configure;

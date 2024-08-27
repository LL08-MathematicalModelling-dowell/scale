import {useState} from "react";
import "./CSS/Stepper.css";
import {Link} from "react-router-dom";
import {FaCheckCircle} from "react-icons/fa";
import ScaleSelectForm from "../ScaleSelectForm/ScaleSelectForm";

const Stepper = () => {
  const steps = ["Select ", "Customize", "Finish Up"];
  const [currentStep, setCurrentStep] = useState(1);
  const [complete, setComplete] = useState(false);

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      if (complete) setComplete(false); 
    }
  };
  const handleNext = () => {
    if (currentStep === steps.length) {
      setComplete(true); 
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };



  return (
    <>
      <div className="flex flex-col gap-9">
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div key={index} className={`relative flex flex-col justify-center items-center md:w-full w-64 step-item gap-2 ${currentStep === index + 1 && "active"} ${(index + 1 < currentStep || complete) && "complete"}`}>
            <div className={`step ${currentStep > index + 1 || complete ? "text-white bg-dowellDeepGreen" : null}`}>{currentStep > index + 1 || complete ? <FaCheckCircle /> : index + 1}</div>
            <p className={`text-center pl-[7px] font-poppins text-black text-[13px] ${currentStep > index + 1 || complete ? "font-bold" : null}`}>{step}</p>
          </div>
        ))}
      </div>
       {currentStep === 1 && (
        <div className=" ">
            <ScaleSelectForm/>
        </div>
      )}
      </div>
     
     

      <div className="flex items-center justify-center my-4 gap-8">
        <Link className={`previous ${currentStep === 1 && "hidden"}`} onClick={handlePrevious}>
          Previous
        </Link>
        {!complete && (
          <Link className="next" onClick={handleNext}>
            {currentStep === steps.length ? "Finish" : "Next"}
          </Link>
        )}
      </div>
    </>
  );
};

export default Stepper;

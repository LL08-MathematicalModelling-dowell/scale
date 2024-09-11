import { useState, useEffect } from "react";
import "./CSS/Stepper.css";
import { Link } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import Configure from "../ScaleForm/Configure";
import Customize from "../ScaleForm/Customize";
import Preview from "../ScaleForm/Preview";

const Stepper = () => {
  const steps = ["Configure ", "Customize", "Finish Up"];
  
  // Retrieve saved step from localStorage if available, otherwise start at 1
  const savedStep = localStorage.getItem("currentStep");
  const [currentStep, setCurrentStep] = useState(savedStep ? parseInt(savedStep) : 1);
  const [complete, setComplete] = useState(false);

  // Update localStorage whenever the step changes
  useEffect(() => {
    localStorage.setItem("currentStep", currentStep);
  }, [currentStep]);

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
      <div className="flex flex-col gap-9 md:max-w-full">
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`relative flex flex-col justify-center items-center md:w-full w-64 step-item gap-2 ${currentStep === index + 1 && "active"} ${(index + 1 < currentStep || complete) && "complete"}`}
            >
              <div className={`step ${currentStep > index + 1 || complete ? "text-white bg-dowellDeepGreen" : null}`}>
                {currentStep > index + 1 || complete ? <FaCheckCircle /> : index + 1}
              </div>
              <p className={`text-center pl-[7px] font-poppins text-black text-[13px] ${currentStep > index + 1 || complete ? "font-bold" : null}`}>
                {step}
              </p>
            </div>
          ))}
        </div>

        {/* Step Content */}
        {currentStep === 1 && (
          <div className="mt-4 md:mx-32 max-w-full">
            <Configure />
          </div>
        )}
        {currentStep === 2 && (
          <div className="mt-4 md:mx-32 max-w-full">
            <Customize />
          </div>
        )}
        {currentStep === 3 && (
          <div className="mt-4 md:mx-32 max-w-full">
            <Preview />
          </div>
        )}
      </div>

      <div className="flex items-center mt-20 gap-8 w-full justify-center py-10">
        <Link className={`previous ${currentStep === 1 && "hidden"}`} onClick={handlePrevious}>
          Previous
        </Link>
        {!complete && (
          <Link
            className="py-2 px-12 font-poppins text-center text-white text-[15px] font-medium bg-dowellDeepGreen hover:bg-transparent hover:text-dowellDeepGreen rounded-md cursor-pointer hover:shadow-xl transition ease-in-out duration-300"
            onClick={handleNext}
          >
            {currentStep === steps.length ? "Finish" : "Next"}
          </Link>
        )}
      </div>
    </>
  );
};

export default Stepper;

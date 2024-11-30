import { useEffect, useState } from "react";
import BasicInformation from "@/Pages/Preference/PreferenceSteps/BasicInformation";
import ReportConfiguration from "@/Pages/Preference/PreferenceSteps/ReportConfiguration";
import ScaleConfiguration from "@/Pages/Preference/PreferenceSteps/ScaleConfiguration";
import { FaCheckCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./CSS/Stepper.css";

const PreferenceStepper = () => {
  const steps = ["Basic ", "Configure", "Finish Up"];

  const [formData, setFormData] = useState({
    scaleType: " ",
    dataType: "",
    brandName: "",
    productName: "",
    questionToDisplay: " ",
  });

  const savedStep = localStorage.getItem("currentStep");
  const [currentStep, setCurrentStep] = useState(savedStep ? parseInt(savedStep) : 1);
  const [complete, setComplete] = useState(false);

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
      console.log(formData); // This will log all the form data collected across the steps
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  return (
    <>
      <div className="flex flex-col gap-9 max-w-full md:max-w-full">
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
          <div className="mt-4 md:mx-32 max-w-full px-12">
            <BasicInformation formData={formData} handleInputChange={handleInputChange} />
          </div>
        )}
        {currentStep === 2 && (
          <div className="mt-4 md:mx-32 max-w-full">
            <ScaleConfiguration formData={formData} handleInputChange={handleInputChange} />
          </div>
        )}
        {currentStep === 3 && (
          <div className="mt-4 md:mx-32 max-w-full">
            <ReportConfiguration formData={formData} handleInputChange={handleInputChange} />
          </div>
        )}
      </div>

      <div className="flex items-center mt-20 gap-8 w-full justify-center py-10">
        <Link className={`previous ${currentStep === 1 && "hidden"}`} onClick={handlePrevious}>
          Previous
        </Link>
        {!complete && (
          <Link
            to={`${currentStep === steps.length ? "/voc/preference" : "#"}`}
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

export default PreferenceStepper;

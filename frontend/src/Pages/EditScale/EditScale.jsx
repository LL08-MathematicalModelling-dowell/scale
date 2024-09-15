import CustomHeader from "@/components/CustomHeader/CustomHeader";
import ScaleSelectForm from "@/components/ScaleSelectForm/ScaleSelectForm";
import {Separator} from "@/components/ui/separator";
import { ScaleProvider } from "@/contexts/ScaleContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const EditScale = () => {
  const [step, setCurrentStep] = useState(0)

  useEffect(() => {
    const savedStep = localStorage.getItem('currentStep')
    if(savedStep) {
      setCurrentStep(savedStep)
      console.log(savedStep)
    }
  }, [ ])

  const handleResetStep = () => {
    if(step > 0){
      setCurrentStep(0)
      localStorage.removeItem('currentStep')

    }
  }
  return (
    <div className="min-h-screen max-w-full bg-dowellBg">
      <div>
        <CustomHeader />
      </div>
      <div className=" md:mx-12 mx-1 py-9 my-7 mb-5 bg-white rounded-xl shadow-2xl ">
        <div className="flex md:mx-11 mx-4 flex-col gap-y-16 ">
          {/* Stepper */}
          <h1 className="text-center font-poppins text-3xl tracking-tight font-semibold text-dowellGreen">
            <span className="font-pacifico text-3xl pr-1 ">Select</span> the type of <span className="font-pacifico text-3xl pr-1 ">Scale</span> you want to <span className="font-pacifico text-3xl ">Create</span>
          </h1>
      <ScaleProvider>
      <ScaleSelectForm />
        </ScaleProvider>
          <Separator className="h-1 rounded-md" />
          {/* bg-gradient-to-r from-green-400 via-cyan-900 to-blue-500 */}
        </div>
      </div>
      <div className="flex justify-center items-center pb-9 ">
        <Link to="/scale-creating" className="py-3 px-5 bg-dowellDeepGreen text-white rounded-lg font-poppins font-medium text-[15px] hover:shadow-2xl hover:scale-105 transition-all duration-300 ease-in-out" onClick={handleResetStep}>Start Creating</Link>
      </div>
    </div>
  );
};

export default EditScale;

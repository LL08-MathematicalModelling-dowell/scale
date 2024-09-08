import CustomHeader from "@/components/CustomHeader/CustomHeader";
import Stepper from "@/components/DynamicStepper/Stepper";

const CreatingScale = () => {
  return (
    <div className="max-w-full min-h-screen bg-gray-100 ">
      <CustomHeader />
      <div className="mt-7 w-full">
          <Stepper/>
      </div>
    </div>
  );
};

export default CreatingScale;

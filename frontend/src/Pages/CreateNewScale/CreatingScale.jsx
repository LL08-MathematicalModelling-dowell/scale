import CustomHeader from "@/components/CustomHeader/CustomHeader";
import Stepper from "@/components/DynamicStepper/Stepper";

const CreatingScale = () => {
  return (
    <div className="md:max-w-full max-w-sm m-0 p-0  min-h-screen bg-gray-100 ">
      <CustomHeader />
      <div className="mt-7">
          <Stepper/>
      </div>
    </div>
  );
};

export default CreatingScale;

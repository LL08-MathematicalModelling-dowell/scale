import CustomHeader from "@/components/CustomHeader/CustomHeader";
import Stepper from "@/components/DynamicStepper/Stepper";

const EditScale = () => {
  return (
    <div className="min-h-screen max-w-full bg-dowellBg">
      <div>
        <CustomHeader />
      </div>
      <div className=" md:mx-7 mx-1 py-9 my-4 bg-white rounded-xl ">
        <div className="flex md:mx-11 mx-4 flex-col">
          {/* Stepper */}
          <Stepper />
        </div>
      </div>
    </div>
  );
};

export default EditScale;

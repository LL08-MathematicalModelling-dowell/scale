import { FaFaceFrown } from "react-icons/fa6";
import { BsEmojiNeutralFill } from "react-icons/bs";
import { FaSmile } from "react-icons/fa";

const NpsLitePreview = () => {
  return (
    <>
       <div className="px-4 md:mt-32 mt-8 flex flex-col items-center gap-5">
      <h2 className="md:text-[22px] text-xl font-poppins text-center tracking-tight font-semibold">This is the preview of the NPS Scale</h2>
      <div className="mt-4">
      <div className="flex flex-col gap-3">
      <p className="font-poppins md:text-[16px] tracking-tight text-sm">How was your experience using our product? Please rate your experience below.</p>
      <div className="flex justify-between items-center mt-2 md:gap-x-16">
           <button disabled className="py-2 md:px-10 px-4 bg-red-600 rounded-md flex items-center gap-3 text-poppins tracking-tight text-white font-medium text-sm md:text-[17px]"> <FaFaceFrown /> Bad</button>
           <button disabled className="py-2 md:px-10 px-4 bg-yellow-400 rounded-md flex items-center gap-3 text-poppins tracking-tight text-white font-medium text-sm md:text-[17px]"> <BsEmojiNeutralFill /> Average</button>
           <button disabled className="py-2 md:px-10 px-4 bg-green-500 rounded-md flex items-center md:gap-3 gap-1 text-poppins tracking-tight text-white font-medium text-sm md:text-[17px]"> <FaSmile />  Excellent</button>
      </div>
      </div>
      </div>
    </div>
    </>
  )
}

export default NpsLitePreview

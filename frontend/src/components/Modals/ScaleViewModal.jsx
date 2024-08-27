import { Link } from "react-router-dom";

const ScaleViewModal = ({children, onClose}) => {
  return (
    <div
      className=""

    >
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40 scroll ">
        <div className="bg-white px-10 py-6 rounded-lg md:w-2/5 mx-16">
        {children}
        <div className="flex items-center justify-center my-4 gap-8">
        <Link className="py-1 px-6 font-poppins text-center text-red-500 text-[13px] font-medium border-2 border-red-500 rounded-md cursor-pointer hover:shadow-xl transition ease-in-out duration-300" onClick={onClose}>Close</Link>
        <Link className="py-1 px-6 font-poppins text-center text-white text-[13px] font-medium border-2 border-green-400 bg-dowellDeepGreen rounded-md cursor-pointer hover:shadow-xl transition ease-in-out duration-300">Edit scale</Link>
        
        </div>
        </div>
      </div>
    </div>
  );
};

export default ScaleViewModal;

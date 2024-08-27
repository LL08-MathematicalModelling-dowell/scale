import {Link} from "react-router-dom";
import PropTypes from "prop-types";


const ScaleCard = ({scaleName, scaleDescription, scaleImage, onView}) => {
  return (
    <div className="border shadow-xl rounded-lg w-full h-full flex flex-col">
      <img
        src={scaleImage}
        className="w-full h-40 object-contain rounded-t-lg object-center"
        alt=""
      />
      <div className="flex flex-col flex-grow p-2">
        <h2 className="font-poppins text-[19px] font-semibold tracking-tight uppercase">{scaleName}</h2>
        <p className="text-[13px] font-poppins tracking-tight font-normal mb-3">{scaleDescription}</p>

        <div className="mt-auto flex justify-between gap-2">
            {/* The edit and view button will be a modal with a dark background. */}
          <Link className="py-1 px-6 font-poppins text-center text-white text-[13px] font-medium bg-dowellDeepGreen rounded-md cursor-pointer hover:shadow-xl transition ease-in-out duration-300" onClick={onView}>View</Link>
          <Link className="py-1 px-6 font-poppins text-center text-dowellDeepGreen text-[13px] font-medium border-2 border-dowellDeepGreen rounded-md cursor-pointer hover:shadow-xl transition ease-in-out duration-300">Edit</Link>
        </div>
      </div>
    </div>
  );
};

ScaleCard.propTypes = {
  scaleName: PropTypes.string.isRequired,
  scaleDescription: PropTypes.string.isRequired,
  scaleImage: PropTypes.string.isRequired,
  onView: PropTypes.func.isRequired,
};
export default ScaleCard;

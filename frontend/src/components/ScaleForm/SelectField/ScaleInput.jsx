import PropTypes from "prop-types";

const ScaleInput = ({type, placeholder, label}) => {
  return (
    <div className="flex flex-col gap-1  w-full">
      <label className="text-[16px]  font-poppins text-dowellDeepGreen font-medium tracking-tight">{label}</label>
      <input type={type} className="w-full h-12 border border-gray-300 rounded-md font-poppins text-[15px]  outline-dowellDeepGreen px-2" placeholder={placeholder} />
    </div>
  );
};

ScaleInput.propTypes = {
  type: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

export default ScaleInput;

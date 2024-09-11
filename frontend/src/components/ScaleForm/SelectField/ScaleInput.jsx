import PropTypes from "prop-types";

const ScaleInput = ({ type, placeholder, label, value, onChange, className }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className={`md:text-[14px] text-[13px] font-poppins text-dowellDeepGreen font-medium tracking-tight ${className}`}>{label}</label>
      <input 
        type={type} 
        className="w-full h-12 border border-gray-300 rounded-md font-poppins md:text-[15px] text-[13px] outline-dowellDeepGreen px-2" 
        placeholder={placeholder} 
        value={value} 
        onChange={onChange} 
      />
    </div>
  );
};

ScaleInput.propTypes = {
  type: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired, 
  onChange: PropTypes.func.isRequired, 
};

export default ScaleInput;

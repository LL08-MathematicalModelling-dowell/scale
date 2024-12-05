import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PropTypes from "prop-types";

const PreferenceSelect = ({
  triggerClass,
  placeholder,
  data,
  handleInputChange,
  disabled,
  type,
  inputClass,
  customClass,
  name,
}) => {
  // Handle input change
  const onChange = (e, value) => {
    handleInputChange(name, value || e.target.value); // Ensure the correct value is passed
  };

  return (
    <div>
      {type === "input" ? (
        <input
          name={name}
          className={inputClass}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => onChange(e, null)} 
        />
      ) : (
        <Select disabled={disabled} onValueChange={(value) => onChange(null, value)}>
          <SelectTrigger className={type === "rating" ? customClass : triggerClass}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {data.map((item, index) => (
              <SelectItem key={index} value={item.value} className="font-normal font-poppins">
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

PreferenceSelect.propTypes = {
  triggerClass: PropTypes.string,
  placeholder: PropTypes.string,
  data: PropTypes.array,
  handleInputChange: PropTypes.func,
  disabled: PropTypes.bool,
  type: PropTypes.string,
  inputClass: PropTypes.string,
  customClass: PropTypes.string,
  name: PropTypes.string,
};

export default PreferenceSelect;

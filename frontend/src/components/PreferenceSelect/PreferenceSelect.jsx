import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PropTypes from "prop-types";

const PreferenceSelect = ({ triggerClass, placeholder, data, handleInputChange, disabled, type, inputClass, customClass }) => {
  return (
    <div>
      {type === "input" ? (
        <input
          className={inputClass}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => handleInputChange(e.target.value, type)}
        />
      ) : (
        <Select disabled={disabled} onValueChange={(value) => handleInputChange(value, type)}>
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
};

export default PreferenceSelect;

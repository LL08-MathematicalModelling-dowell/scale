import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const SelectField = ({ triggerClass, placeholder, data, handleInputChange, defaultValue }) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue || ""); // Initialize with defaultValue if provided

  const handleSelectChange = (value) => {
    setSelectedValue(value); // Update the selected value
    handleInputChange(value); // Notify parent of the change
  };

  useEffect(() => {
    if (defaultValue) {
      setSelectedValue(defaultValue); // Update state if defaultValue changes
    }
  }, [defaultValue]);

  return (
    <div>
      <Select value={selectedValue} onValueChange={handleSelectChange}>
        <SelectTrigger className={triggerClass}>
          <SelectValue
            placeholder={
              selectedValue
                ? data.find((item) => item.value === selectedValue)?.label
                : placeholder || data[0]?.label
            }
          />
        </SelectTrigger>
        <SelectContent>
          {data.map((item, index) => (
            <SelectItem key={index} value={item.value} className="font-normal font-poppins">
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

SelectField.propTypes = {
  triggerClass: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  defaultValue: PropTypes.string, // Optional prop for setting the default value
};

export default SelectField;

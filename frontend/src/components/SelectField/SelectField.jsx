import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PropTypes from "prop-types";
import { useState } from "react";

const SelectField = ({ triggerClass, placeholder, data, handleInputChange }) => {
  const [selectedValue, setSelectedValue] = useState(""); // Start with no value selected

  const handleSelectChange = (value) => {
    setSelectedValue(value);  // Update the selected value
    handleInputChange(value);  // Pass the selected value to the parent handler
  };

  return (
    <div>
      <Select value={selectedValue} onValueChange={handleSelectChange}>
        <SelectTrigger className={triggerClass}>
          <SelectValue placeholder={selectedValue ? data.find(item => item.value === selectedValue)?.label : placeholder || data[0]?.label} />
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
      value: PropTypes.any,
      label: PropTypes.string,
    })
  ).isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

export default SelectField;

import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import PropTypes from "prop-types";

const LLXSelectField = ({triggerClass, placeholder, data, handleInputChange}) => {
  return (
    <div>
      <Select onValueChange={(value) => handleInputChange(value, data.label)}>
        <SelectTrigger className={triggerClass}>
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
    </div>
  );
};

LLXSelectField.propTypes = {
  triggerClass: PropTypes.string,
  placeholder: PropTypes.string,
  data: PropTypes.array,
  handleInputChange: PropTypes.func,
};

export default LLXSelectField;

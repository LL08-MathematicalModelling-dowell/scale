import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import PropTypes from 'prop-types';

const SelectField = ({triggerClass, placeholder, data, handleInputChange}) => {
  
  return (
    <div>
      <Select onValueChange={(value) => handleInputChange(value, data.label)
      }>
        <SelectTrigger className={triggerClass}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {data.map((item, index) => (
            <SelectItem key={index} value={item.value} className="font-normal font-poppins">{item.label }</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

SelectField.propTypes = {
  triggerClass: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.any,
    label: PropTypes.string
  })).isRequired,
  handleInputChange: PropTypes.func.isRequired,
}

export default SelectField;

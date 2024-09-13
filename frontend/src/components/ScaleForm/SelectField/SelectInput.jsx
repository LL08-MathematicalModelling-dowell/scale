import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PropTypes from 'prop-types';

const SelectInput = ({ className, placeholder, data,  forText , onChange = () => {} }) => {
  return (
    <div>
      <Select onValueChange={(value) => onChange(value)}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {data?.map((item, index) => (
            <SelectItem key={index} value={item}>
              {item } { forText }
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

SelectInput.propTypes = {
  className: PropTypes.string,
  placeholder: PropTypes.string,
  data: PropTypes.array,
  onChange: PropTypes.func,
  forText: PropTypes.string,
}

export default SelectInput;

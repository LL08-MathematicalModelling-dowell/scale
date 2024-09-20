import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import PropTypes from 'prop-types';
const SelectField = ({data, placeholder, handleSelectChange}) => {
  return (
    <div>
      <Select onValueChange={(value) => handleSelectChange(value, data.lable)}>
        <SelectTrigger className="md:w-[180px] w-full h-14 focus:ring-dowellDeepGreen font-poppins md:text-md text-sm tracking-tight">
          <SelectValue placeholder={placeholder}/>
        </SelectTrigger>
        <SelectContent>
          {data &&
            data?.map((item, index) => (
              <SelectItem key={index} value={item.value} className="font-poppins text-sm tracking-tight">
                {item.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
};

SelectField.propTypes = {
  data: PropTypes.array,
  placeholder: PropTypes.string,
  handleSelectChange: PropTypes.func
}

export default SelectField;

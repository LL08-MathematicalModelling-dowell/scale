import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import PropTypes from 'prop-types';

const LLXSelectField = ({triggerClass, placeholder, data,}) => {
  return (
    <div>
          <Select>
        <SelectTrigger className={triggerClass}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          { data.map((item, index) => (
            <SelectItem key={index} value={item.value} className="font-normal font-poppins">{item.label }</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default LLXSelectField
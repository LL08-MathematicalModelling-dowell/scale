import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

const SelectInput = ({className, placeholder, data}) => {
  return (
    <div>
      <Select>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {data?.map((item, index) => (
            <SelectItem key={index} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SelectInput;

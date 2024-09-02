import PropTypes from 'prop-types';

const CustomDate = ({selected, setSelected}) => {
  const CustomDateList = [
    {
      date: "Seven days",
      value: 1,
    },
    {
      date: "30 Days",
      value: 2,
    },
    {
      date: "90 Days",
      value: 3,
    },
    {
      date: "1 Year",
      value: 4,
    },
    {
      date: "Custom",
      value: 5,
    },
  ]

  const handleClick = (value) => {
    setSelected(value);
 console.log(selected);
  }
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-3">
     {CustomDateList.map((date, index) => (
      <div key={index}>
         <button onClick={()=> handleClick(date.value)} className={`py-2 px-6 border border-dowellLiteGreen border-1 rounded-full font-poppins text-[14px] font-medium ${selected === date.value ? "bg-dowellDeepGreen text-white" : null}  ${selected === 5 ? "hidden" : "block"}` } selected={selected} value={date.value}>{date.date}</button>
      </div>
     ))}

    </div>
  )
  
}



CustomDate.propTypes = {
  selected: PropTypes.number,
  setSelected: PropTypes.func,
};


export default CustomDate


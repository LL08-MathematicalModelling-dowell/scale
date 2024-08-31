import {useEffect, useRef, useState} from "react";
import {DateRange} from "react-date-range";
import {addDays} from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const DateRangeComp = ({onClose}) => {
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: "selection",
    },
  ]);

  const refOne = useRef(null);

  useEffect(() => {
    document.addEventListener("keydown", hideOnEscape, true);
    document.addEventListener("click", hideOnClickOutside, true);

    return () => {
      document.removeEventListener("keydown", hideOnEscape, true);
      document.removeEventListener("click", hideOnClickOutside, true);
    };
  }, []);

  const hideOnEscape = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const hideOnClickOutside = (e) => {
    if (refOne.current && !refOne.current.contains(e.target)) {
      onClose();
    }
  };

  const handleDateChange = (item) => {
    setRange([item.selection]);
    console.log(range);
  };

  return (
    <div ref={refOne}>
      <DateRange onChange={handleDateChange} editableDateInputs moveRangeOnFirstSelection={false} ranges={range} months={1} direction="horizontal" className="calendarElement" />
    </div>
  );
};

export default DateRangeComp;

import React from "react";
import { useState } from "react";
import DatePicker,{ CalendarContainer } from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css'

function ChooseDate(props) {
    // const [startDate, setStartDate] = useState(new Date());
    function onChangeHandler(date) {
        props.onChange(date);
    }
    const MyContainer = ({ className, children }) => {
      return (
        <div >
          <CalendarContainer className={className}>
            <div style={{ background: "#f0f0f0" }}>
              Choose a date that you want to display data.
                </div>
            <div style={{ position: "relative" }}>{children}</div>
          </CalendarContainer>
        </div>
      );
    };
  
    return (
      <div>
        <DatePicker 
          selected={props.date}
          onChange={onChangeHandler}
          calendarContainer={MyContainer}
          minDate={props.minDate}
          maxDate={props.maxDate}
          fromMonth = {props.minDate}
          disabledDays = {{after : props.maxDate}}
        />
      </div>
    );
  }
  
  export default ChooseDate;
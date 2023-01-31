import * as React from 'react';

import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export default function SelectDate(props) {
  const {type, defaultDate,handleChange} = props;

  const [value, setValue] = React.useState(defaultDate);
  function handler(newValue){

    setValue(newValue);
    handleChange(newValue);
    // console.log("selectDate: "+newValue.toString());

  }
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={type}
        value={value}
        minDate={new Date("04-07-2019")}
        maxDate={new Date("11-01-2021")}
        onChange={(newValue)=>handler(newValue)}
        renderInput={(params) => <TextField {...params} />}
      />
    </LocalizationProvider>
  );
}


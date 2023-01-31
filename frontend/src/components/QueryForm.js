import * as React from 'react';
import SelectDate from './SelectDate';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';


export default function QueryForm(props) {
  const {handleSearch} = props;
  const [startDate, setStartDate] = React.useState(new Date("04-07-2019"));
  const [endDate, setEndDate] = React.useState(new Date("11-01-2021"));
  const [keywords, setKeywords] = React.useState([]);
  const [source, setSource] = React.useState(0);
  const handleStartDate = (date) => {
    setStartDate(date);
  }
  const handleEndDate = (date) => {
    setEndDate(date);
  }
  // const handleKeyword = useCallback((e) => {
  //   setKeyword(e.target.value)}, console.log(keywords))
  const handleKeyword = (e) => {
    setKeywords(e.target.value.trim().split(" "));
  };
  const handleTypeChange = (event) => {
    setSource(event.target.value);
  };
  function submit(){
    // console.log("queryform: "+startDate.toISOString());
    // console.log("queryform: "+endDate.toISOString());
    const keywordlist = keywords;
    const content = {
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      keywords: keywordlist,
      source: source,
    };
    handleSearch(content);
  }
  return (
    <Stack spacing={2} direction="row">
      <SelectDate type="Start Time" defaultDate={startDate} handleChange={handleStartDate} />
      <SelectDate type="End Time" defaultDate={endDate} handleChange={handleEndDate} />
      <TextField id="Keyword" label="Keyword" variant="outlined" onChange={(e) => handleKeyword(e)} />
      <FormControl sx={{ width: '25ch' }}>
        <InputLabel id="demo-simple-select-label">Source</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={source}
          label="Source"
          onChange={handleTypeChange}
        >
          <MenuItem value={0}>All</MenuItem>
          <MenuItem value={1}>Avengers Endgame</MenuItem>
          <MenuItem value={2}>Game of Thrones S8</MenuItem>
          <MenuItem value={3}>Squid Game</MenuItem>

        </Select>
      </FormControl>
      <Button variant="contained" onClick={submit}>Search</Button>
    </Stack>
  );
}

import React from "react";

import QueryForm from "../components/QueryForm";
import QueryTimeTable from "../components/QueryTimeTable";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
// import ReactTable from "react-table";
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import { blue,lightBlue, yellow } from '@mui/material/colors';

import { Container, Row, Col } from "react-bootstrap";
import * as d3 from "d3";
import "bootstrap/dist/css/bootstrap.min.css";
import { timeParse } from "d3-time-format";
import cloud from "d3-cloud";

function QueryTimeDisplay(props) {
  // This function is for displaying
  // Disk Time, Memmory Time, Speedup
  console.log(props.queryResult + " queryTimeDisplay test")
  if (!props.queryResult) {
    return null;
  }

  return (
    <Box>
      <h4>Query Time: </h4>
      {/* Memmory Query Time: {props.queryResult.memTime}, Disk Query Time: {props.queryResult.diskTime}, Speed up {props.queryResult.diskTime / props.queryResult.memTime}; */}
      <Box sx={{
        height: 150,
        width: '100%',
        '& .time_header': {
          backgroundColor: lightBlue[900],
          color: yellow[50]
        },
        '& .time_cell':{
          fontWeight: '500',
          fontSize: '18px'
        }
      }}
      >
        <DataGrid
          rows={[{Memmory_Query_Time: props.queryResult.memTime, Disk_Query_Time: props.queryResult.diskTime, Speed_up: props.queryResult.diskTime / props.queryResult.memTime}]}
          columns={[ 
            { field: "Memmory_Query_Time", headerName: 'Memmory Query Time', width: 90, flex: 1, headerClassName: 'time_header', cellClassName: 'time_cell'},
            { field: "Disk_Query_Time", headerName: 'Disk Query Time', width: 90, flex: 1, headerClassName: 'time_header', cellClassName: 'time_cell' },
            { field: "Speed_up", headerName: 'Speed up', width: 90, headerClassName: 'time_header', cellClassName: 'time_cell' },
          ]}
          getRowId={(row) => row.Memmory_Query_Time+row.Disk_Query_Time}
          experimentalFeatures={{ newEditingApi: true }}
          sx={{
            [`& .${gridClasses.cell}`]: {
              py: 1,
            },
          }}
        />
      </Box>
    </Box>
  )
}

function TabPanel(props) {
  const { children, value, index } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}
TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};
function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
function Search() {
  const [TabDisabled, setTabDisabled] = React.useState(true);
  const [value, setTab] = React.useState(0);
  const [queryResult, setQueryResult] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState("willload");

  // Variable for dashboard
  const histogram = React.useRef(null);
  const linechart = React.useRef(null);
  const hist_line_Width = 630;
  const hist_line_Height = 300;
  const margin = { top: 30, right: 55, bottom: 30, left: 50 };
  const wordcloud = React.useRef(null);
  const CloudWidth = 600;
  const CloudHeight = 600;
  const cmargin = { top: 30, right: 20, bottom: 30, left: 20 };
  const tweetsTable = React.useRef(null);
  const columns = [
    // ['text', 'time', 'favoriteCount', 'retweetCount', 'source', 'priority']
    { field: 'text', headerName: 'Text', width: 600, headerClassName: 'header' },
    { field: 'time', headerName: 'Time', width: 180, flex: 1.8, headerClassName: 'header' },
    { field: 'favoriteCount', headerName: 'FavCount', width: 100, flex: 1, headerClassName: 'header' },
    { field: 'retweetCount', headerName: '#Retweet', width: 100, flex: 1, headerClassName: 'header' },
    { field: 'source', headerName: 'Source', width: 100, flex: 1, headerClassName: 'header' },
    { field: 'priority', headerName: 'Priority', width: 100, flex: 1, headerClassName: 'header' },

  ]
  const handleTab = (event, newValue) => {
    setTab(newValue);
  };

  function submitForm2SetQuery(content) {
    console.log(content);
    setIsLoading("loading");
    fetch("http://127.0.0.1:8000/queries/setQuery", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(content),
    })
      .then((response) => {
        if (response.ok) {
          response.json().then((queryResult) => {
            setQueryResult(queryResult);
            console.log(queryResult);
          }).then((res) => {
            setTimeout(() => {
              setIsLoading("loaded")
            }, 2000)
          });
        }

      })
      .catch((err) => {
        console.log(err.response);
      });
    setTabDisabled(false);
    // var show = document.getElementById("displayData");
    // show.style.display = "block";
  }

  function submitForm2SubsetQuery(content) {
    console.log(content);
    setIsLoading("loading");
    fetch("http://127.0.0.1:8000/queries/subsetQuery", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(content),
    })
      .then((response) => {
        if (response.ok) {
          response.json().then((queryResult) => {
            setQueryResult(queryResult);
            console.log(queryResult);
          }).then((res) => {
            setTimeout(() => {
              setIsLoading("loaded")
            }, 2000)
          });
        }
      })
      .catch((err) => {
        console.log(err.response);
      });
  }

  React.useEffect(() => {
    if (queryResult !== null) {
      const svgEl = d3.select(histogram.current);
      svgEl.selectAll("*").remove(); // Clear svg content before adding new elements
      const svgE2 = d3.select(linechart.current);
      svgE2.selectAll("*").remove(); // Clear svg content before adding new elements
      const svgE3 = d3.select(wordcloud.current);
      svgE3.selectAll("*").remove(); // Clear svg content before adding new elements
      const tableE1 = d3.select(tweetsTable.current);
      tableE1.selectAll("*").remove();

      let histData = queryResult.lineChartData;

      // Draw Histogram
      // Layout
      let svgHist = d3
        .select(histogram.current)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      let HistWidth = hist_line_Width - margin.left - margin.right;
      let HistHeight = hist_line_Height - margin.top - margin.bottom;

      // scale function and data preprocessing
      let hours = [];
      histData.forEach((d) => hours.push(d.date));

      let xHist = d3
        .scaleBand()
        .domain(hours)
        .range([0, HistWidth])
        .paddingInner(0.1)
        .paddingOuter(0.1);
      let yHist = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(histData, function (d) {
            return d.freq;
          }),
        ])
        .range([HistHeight, 0]);

      let xHistAxis = d3.axisBottom(xHist);
      svgHist
        .append("g")
        .attr("transform", "translate(0, " + HistHeight + ")")
        .call(xHistAxis);
      let yHistAxis = d3.axisLeft(yHist);
      svgHist.append("g").attr("transform", "translate(0, 0)").call(yHistAxis);

      // draw bars
      svgHist
        .selectAll("rect")
        .data(histData)
        .enter()
        .append("rect")
        .attr("x", function (d) {
          return xHist(d.date);
        })
        .attr("y", function (d) {
          return yHist(d.freq);
        })
        .attr("width", xHist.bandwidth())
        .attr("height", function (d) {
          return HistHeight - yHist(d.freq);
        })
        .style("fill", "steelblue");

      // x, y labels
      svgHist
        .append("text")
        .attr("x", HistWidth + 5)
        .attr("y", HistHeight + 16)
        .attr("font-size", 12)
        .attr("font-weight", "bold")
        .text("Daytime");

      svgHist
        .append("text")
        .attr("x", 0)
        .attr("y", -10)
        .attr("font-size", 12)
        .attr("text-anchor", "middle")
        .attr("text-align", "center")
        .attr("font-weight", "bold")
        .text("Frequency");

      // Draw Line Chart
      let parseTime = timeParse("%Y-%m-%d");
      let lineData = queryResult.histogramData;

      // Layout
      let svgLine = d3
        .select(linechart.current)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      let LineWidth = hist_line_Width - margin.left - margin.right;
      let LineHeight = hist_line_Height - margin.top - margin.bottom;

      // scale function and data preprocessing
      let xLine = d3
        .scaleTime()
        .domain(
          d3.extent(lineData, function (d) {
            return parseTime(d.date);
          })
        )
        .range([0, LineWidth]);
      let yLine = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(lineData, function (d) {
            return d.freq;
          }),
        ])
        .range([LineHeight, 0]);

      let xLineOrigin = xLine.copy();

      let xLineAxis = d3.axisBottom(xLine);
      svgLine
        .append("g")
        .attr("transform", "translate(0, " + LineHeight + ")")
        .classed("axis-x", true)
        .call(xLineAxis);
      let yLineAxis = d3.axisLeft(yLine);
      svgLine.append("g").attr("transform", "translate(0, 0)").call(yLineAxis);

      // Draw line
      let line = svgLine.append("g");
      line
        .append("path")
        .datum(lineData)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr(
          "d",
          d3
            .line()
            .x(function (d) {
              return xLine(parseTime(d.date));
            })
            .y(function (d) {
              return yLine(d.freq);
            })
        );

      // x, y labels
      svgLine
        .append("text")
        .attr("x", HistWidth + 10)
        .attr("y", HistHeight + 16)
        .attr("font-size", 12)
        .attr("font-weight", "bold")
        .text("Date");

      svgLine
        .append("text")
        .attr("x", 0)
        .attr("y", -10)
        .attr("font-size", 12)
        .attr("text-anchor", "middle")
        .attr("text-align", "center")
        .attr("font-weight", "bold")
        .text("Frequency");

      // zoom effect
      let zoom = d3.zoom().scaleExtent([0.5, 50]).on("zoom", zoomed);
      d3.select(linechart.current).call(zoom);
      function zoomed(event) {
        let t = event.transform;
        let lasty;
        xLine = t.rescaleX(xLineOrigin);
        svgLine
          .select(".axis-x")
          .transition()
          .duration(100)
          .call(xLineAxis.scale(xLine));
        svgLine
          .select(".line")
          .transition()
          .duration(100)
          .attr(
            "d",
            d3
              .line()
              .x(function (d) {
                let res = xLine(parseTime(d.date));
                if (res > LineWidth) return LineWidth;
                else if (res < 0) return 0;
                return res;
              })
              .y(function (d) {
                let res = yLine(d.freq);
                let x_pos = xLine(parseTime(d.date));
                if (x_pos > LineWidth) return LineHeight;
                else if (x_pos < 0) return LineHeight;
                return res;
              })
          );
      }

      // Draw WordCloud
      // Layout
      let cWidth = CloudWidth - cmargin.left - cmargin.right;
      let cHeight = CloudHeight - cmargin.top - cmargin.bottom;
      let svgCloud = d3
        .select(wordcloud.current)
        .append("g")
        .attr(
          "transform",
          "translate(" +
          (cmargin.left + cWidth / 2) +
          "," +
          (cmargin.top + cHeight / 2) +
          ")"
        );

      let wordsData = queryResult.wordCloudData.map(function (d) {
        return { text: d.word, value: d.freq };
      });
      let freq2fontSize = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(wordsData, function (d) {
            return d.value;
          }),
        ])
        .rangeRound([25, 80]);

      let layout = cloud()
        .size([cWidth, cHeight])
        .words(wordsData)
        .padding(5)
        .rotate(function (d) {
          return d.value % 360;
        })
        .font("Impact")
        .fontSize((d) => freq2fontSize(d.value))
        .on("end", draw);

      layout.start();

      function draw(words) {
        svgCloud
          .selectAll("text")
          .data(words)
          .enter()
          .append("text")
          .style("font-size", function (d) {
            return d.size + "px";
          })
          .style("font-family", "Impact")
          .attr("text-anchor", "middle")
          .attr("transform", function (d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .attr("fill", function (d, i) {
            return d3.schemeCategory10[i % 10];
          })
          .text(function (d) {
            return d.text;
          });
      }

      // List tweets

      // let table = d3.select(tweetsTable.current).append("table");
      // let thead = table.append("thead");
      // let tbody = table.append("tbody");

      // let tableData = queryResult.first10Result;
      // let cols = ['text', 'time', 'favoriteCount', 'retweetCount', 'source', 'priority'];
      // // append the header row
      // thead
      //   .append("tr")
      //   .selectAll("th")
      //   .data(cols)
      //   .enter()
      //   .append("th")
      //   .style("border-bottom", "1px solid #ddd")
      //   .style("background-color", "black")
      //   .style("color", "white")
      //   .text(function (d) {
      //     return d;
      //   });

      // // create a row for each object in the data
      // let rows = tbody
      //   .selectAll("tr")
      //   .data(tableData)
      //   .enter()
      //   .append("tr")
      //   .attr("id", function (d, i) {
      //     return "table_" + i.toString();
      //   })
      //   .attr("class", "table_rows");

      // // create a cell in each row for each column
      // let cells = rows
      //   .selectAll("td")
      //   .data(function (row) {
      //     return cols.map(function (columnName) {
      //       return {
      //         key: columnName,
      //         value: row[columnName],
      //       };
      //     });
      //   })
      //   .enter()
      //   .append("td")
      //   .style("border-bottom", "1px solid #ddd")
      //   .text(function (d) {
      //     return d.value;
      //   });

    }

  });


  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Search</h1>
      This search page provide two main function to users: query operation and
      subquery operation
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleTab}
            aria-label="basic tabs example"
          >
            <Tab label="Query" {...a11yProps(0)} />
            <Tab label="Subquery" {...a11yProps(1)} disabled={TabDisabled} />
          </Tabs>
        </Box>
        {/* query */}
        <TabPanel value={value} index={0}>
          <QueryForm handleSearch={submitForm2SetQuery} />
        </TabPanel>
        {/* subquery */}
        <TabPanel value={value} index={1}>
          <QueryForm handleSearch={submitForm2SubsetQuery} />
        </TabPanel>
        {/* Result */}
        {isLoading == "loading" &&
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        }
        {/* {isLoading=="loaded" && <div id="displayData" style={{ display: "none" }}> */}
        {isLoading == "loaded" && <div id="displayData">
          <Container>
            <Row>
              <QueryTimeDisplay queryResult={queryResult} />
            </Row>
            <Row>
              <Col>
                <div>
                  <svg
                    ref={histogram}
                    width={hist_line_Width}
                    height={hist_line_Height}
                  />
                </div>
                <div>
                  <svg
                    ref={linechart}
                    width={hist_line_Width}
                    height={hist_line_Height}
                  />
                </div>
              </Col>
              <Col>
                <svg ref={wordcloud} width={CloudWidth} height={CloudHeight} />
              </Col>
            </Row>
            <Row>
              <Col>
                {/* <div ref={tweetsTable}></div> */}
                <Box sx={{
                  height: 400,
                  width: '100%',
                  '& .header': {
                    backgroundColor: blue[100],
                  },
                }}
                >
                  <DataGrid
                    rows={queryResult.first10Result}
                    columns={columns}
                    getRowId={(row) => row.text + row.time}
                    getRowHeight={() => 'auto'}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    experimentalFeatures={{ newEditingApi: true }}
                    sx={{
                      [`& .${gridClasses.cell}`]: {
                        py: 1,
                      },
                    }}
                  />
                </Box>
              </Col>
            </Row>
          </Container>
        </div>
        }
      </Box>
    </div>

  );
}

export default Search;

import React from "react";
import ChooseDate from "../components/chooseDate";
import { Form } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { Container, Row, Col } from 'react-bootstrap'
import * as d3 from "d3";
import 'bootstrap/dist/css/bootstrap.min.css';
import { timeParse } from 'd3-time-format';
import cloud from 'd3-cloud';
import WordCloud from 'react-d3-cloud';
import { schemeCategory10 } from 'd3-scale-chromatic';

function SubSearch(props) {
  const location = useLocation();
  const queryKeywords = location?.state?.keywords;
  const querystartDatae = location?.state?.startDate;
  const queryendDatae = location?.state?.endDate;
  const setQueryResult = location?.state?.setQueryResult;

  const [sub_startDate, setSubStartDate] = React.useState("");
  const [sub_endDate, setSubEndDate] = React.useState("");
  const [sub_keywords, setSubKeywordState] = React.useState([]);

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

  function startDateChangeHandler(date) {
    console.log("startDateChangeHandler");
    if (date == null)
      setSubStartDate("");
    else
      setSubStartDate(date);
    console.log(sub_startDate);
  }

  function endDateChangeHandler(date) {
    console.log("endDateChangeHandler");
    if (date == null)
      setSubEndDate("");
    else
      setSubEndDate(date);
    console.log(sub_endDate);
  }

  const testing = async () => {
    console.log(setQueryResult);
    const content = {
      keywords: sub_keywords,
      startTime: sub_startDate,
      endTime: sub_endDate,
      source: 0,
    };
    console.log(JSON.stringify(content));
  };

  const keywordsHandler = (e) => {
    /*
          used to set state of sub_keywords
        */
    const { name, value } = e.target;
    setSubKeywordState(value.split(" "));
  };

  const onConfirm = async () => {
    const content = {
      keywords: sub_keywords,
      startTime: sub_startDate,
      endTime: sub_endDate,
      source: 0,
    };
    console.log(JSON.stringify(content));
    fetch("http://127.0.0.1:8000/queries/subsetQuery", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(content),
    })
      .then((response) => {
        if (response.ok) {
          response.json().then((json) => {
            console.log(json);
          });
        }
      })
      .catch((err) => {
        console.log(err.response);
      });
  };

  React.useEffect(() => {
    const svgEl = d3.select(histogram.current);
    svgEl.selectAll("*").remove(); // Clear svg content before adding new elements
    const svgE2 = d3.select(linechart.current);
    svgE2.selectAll("*").remove(); // Clear svg content before adding new elements
    const svgE3 = d3.select(wordcloud.current);
    svgE3.selectAll("*").remove(); // Clear svg content before adding new elements
    const tableE1 = d3.select(tweetsTable.current);
    tableE1.selectAll("*").remove();

    console.log(setQueryResult);
    let histData = setQueryResult.lineChartData;

    // Draw Histogram
    // Layout
    let svgHist = d3.select(histogram.current)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    let HistWidth = hist_line_Width - margin.left - margin.right;
    let HistHeight = hist_line_Height - margin.top - margin.bottom;

    // scale function and data preprocessing
    let hours = [];
    histData.forEach(d => hours.push(d.date));

    let xHist = d3.scaleBand()
        .domain(hours)
        .range([0, HistWidth])
        .paddingInner(0.1)
        .paddingOuter(0.1);
    let yHist = d3.scaleLinear()
        .domain([0, d3.max(histData, function(d) {
            return d.freq;
        })])
        .range([HistHeight, 0]);

    let xHistAxis = d3.axisBottom(xHist);
    svgHist.append('g')
      .attr("transform", "translate(0, " + HistHeight + ")")
      .call(xHistAxis);
    let yHistAxis = d3.axisLeft(yHist);
    svgHist.append('g')
      .attr("transform", "translate(0, 0)")
      .call(yHistAxis);
    
    // draw bars
    svgHist.selectAll("rect")
      .data(histData)
      .enter().append("rect")
      .attr("x", function(d) {
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
    svgHist.append('text')
      .attr('x', HistWidth+5)
      .attr('y', HistHeight+16)
      .attr('font-size', 12)
      .attr('font-weight', 'bold')
      .text('Daytime');

    svgHist.append('text')
      .attr('x', 0)
      .attr('y', -10)
      .attr('font-size', 12)
      .attr("text-anchor", "middle")
      .attr('text-align', 'center')
      .attr('font-weight', 'bold')
      .text('Frequency');

    // Draw Line Chart
    let parseTime = timeParse("%Y-%m-%d");
    let lineData = setQueryResult.histogramData;

    // Layout
    let svgLine = d3.select(linechart.current)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    let LineWidth = hist_line_Width - margin.left - margin.right;
    let LineHeight = hist_line_Height - margin.top - margin.bottom;

    // scale function and data preprocessing
    let xLine = d3.scaleTime()
        .domain(d3.extent(lineData, function(d) { return parseTime(d.date); }))
        .range([0, LineWidth]);
    let yLine = d3.scaleLinear()
        .domain([0, d3.max(lineData, function(d) {
            return d.freq;
        })])
        .range([LineHeight, 0]);

    let xLineOrigin = xLine.copy();

    let xLineAxis = d3.axisBottom(xLine);
    svgLine.append('g')
      .attr("transform", "translate(0, " + LineHeight + ")")
      .classed('axis-x', true)
      .call(xLineAxis);
    let yLineAxis = d3.axisLeft(yLine);
    svgLine.append('g')
      .attr("transform", "translate(0, 0)")
      .call(yLineAxis);
    
    // Draw line   
    let line = svgLine.append('g');
    line.append("path")
        .datum(lineData)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", d3.line()
            .x(function(d) { return xLine(parseTime(d.date)); })
            .y(function(d) { return yLine(d.freq); })
        );
    
    // x, y labels
    svgLine.append('text')
      .attr('x', HistWidth+10)
      .attr('y', HistHeight+16)
      .attr('font-size', 12)
      .attr('font-weight', 'bold')
      .text('Date');

    svgLine.append('text')
      .attr('x', 0)
      .attr('y', -10)
      .attr('font-size', 12)
      .attr("text-anchor", "middle")
      .attr('text-align', 'center')
      .attr('font-weight', 'bold')
      .text('Frequency');

    // zoom effect
    let zoom = d3.zoom()
        .scaleExtent([0.5, 50])
        .on("zoom", zoomed);
    d3.select(linechart.current).call(zoom);
    function zoomed(event) {
      let t = event.transform;
      let lasty;
      xLine = t.rescaleX(xLineOrigin);
      svgLine.select('.axis-x')
          .transition()
          .duration(100)
          .call(xLineAxis.scale(xLine));
      svgLine.select('.line')
          .transition()
          .duration(100)
          .attr("d", d3.line()
            .x(function(d) {
                let res =  xLine(parseTime(d.date));
                if (res > LineWidth) return LineWidth;
                else if(res < 0) return 0;
                return res; 
            })
            .y(function(d) { 
                let res = yLine(d.freq);
                let x_pos = xLine(parseTime(d.date));
                if(x_pos > LineWidth) return LineHeight;
                else if(x_pos < 0) return LineHeight;
                return res;
            })
          )
    }

    // Draw WordCloud
    // Layout
    let cWidth = CloudWidth - cmargin.left - cmargin.right;
    let cHeight = CloudHeight - cmargin.top - cmargin.bottom;
    let svgCloud = d3.select(wordcloud.current)
        .append("g")
        .attr("transform", "translate(" + (cmargin.left + cWidth/2) + "," + (cmargin.top + cHeight/2) + ")");

    let wordsData = setQueryResult.wordCloudData.map(function(d) { return {text: d.word, value: d.freq}; });
    let freq2fontSize = d3.scaleLinear()
        .domain([0, d3.max(wordsData, function(d) { return d.value; })])
        .rangeRound([25, 80]);

    let layout = cloud()
        .size([cWidth, cHeight])
        .words(wordsData)
        .padding(5)
        .rotate(function(d) { return d.value % 360; })
        .font("Impact")
        .fontSize(d => freq2fontSize(d.value))
        .on("end", draw);

    layout.start();

    function draw(words) {
      svgCloud.selectAll("text")
          .data(words)
          .enter().append("text")
          .style("font-size", function(d) { return d.size + "px"; })
          .style("font-family", "Impact")
          .attr("text-anchor", "middle")
          .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .attr('fill', function(d, i) { return d3.schemeCategory10[i%10]; })
          .text(function(d) { return d.text; });
    }

    // List tweets
    let table = d3.select(tweetsTable.current).append('table')
    let thead = table.append('thead');
    let tbody = table.append('tbody');

    let tableData = setQueryResult.first10Result;
    let cols = Object.keys(tableData[0]);
    console.log(tableData);
    console.log(cols);

    // append the header row
    thead.append('tr')
      .selectAll('th')
      .data(cols)
      .enter()
      .append('th')
      .style("border-bottom", "1px solid #ddd")
      .style("background-color", "black")
      .style("color", "white")
      .text(function (d) {
        return d;
      });

    // create a row for each object in the data
    let rows = tbody.selectAll('tr')
      .data(tableData)
      .enter()
      .append('tr')
      .attr('id', function (d, i) {
        return 'table_' + i.toString();
      })
      .attr('class', 'table_rows');

    // create a cell in each row for each column
    let cells = rows.selectAll('td')
        .data(function (row) {
            return cols.map(function (columnName) {
                return {
                    key: columnName,
                    value: row[columnName]
                };
            });
        })
        .enter()
        .append('td')
        .style("border-bottom", "1px solid #ddd")
        .text(function (d) {
            return d.value;
        });
  });

  return (
    <div>
      <h1>Sub Query Page</h1>
      <div> start date </div>
      <ChooseDate
        date={sub_startDate}
        onChange={startDateChangeHandler}
        minDate={querystartDatae}
        maxDate={queryendDatae}
      />
      <div> end date </div>
      <ChooseDate
        date={sub_endDate}
        onChange={endDateChangeHandler}
        minDate={sub_startDate}
        maxDate={queryendDatae}
      />

      <div> Key Word </div>
      <Form.Group>
        <Form.Control
          type="text"
          placeholder="input key word"
          name="keywords"
          onChange={keywordsHandler}
        />
      </Form.Group>
      <button onClick={() => testing()}>test</button>
      <button onClick={() => onConfirm()}>search</button>
      <div>
        <Container>
          <Row>
            <Col>
              <div>
                <svg ref={histogram} width={hist_line_Width} height={hist_line_Height} />
              </div>
              <div>
                <svg ref={linechart} width={hist_line_Width} height={hist_line_Height} />
              </div>
            </Col>
            <Col>
              <svg ref={wordcloud} width={CloudWidth} height={CloudHeight} />
            </Col>
          </Row>
          <Row>
            <Col><div ref={tweetsTable}></div></Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default SubSearch;

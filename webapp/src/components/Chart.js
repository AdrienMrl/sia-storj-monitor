import React from 'react';
import {
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  LineSeries,
  VerticalGridLines,
  LineMarkSeries,
  DiscreteColorLegend,
} from 'react-vis';
import '../../node_modules/react-vis/dist/style.css';

const Chart = ({ data }) => {
  return (
    <div>
      This is a title
      <XYPlot width={500} height={300}>
        <XAxis title="Time" />
        <YAxis title="Storage Usage" />
        <LineSeries
          style={{}}
          curve={'curveMonotoneX'}
          color="#55A5F1"
          data={data}
        />
      </XYPlot>
    </div>
  );
};

export default Chart;

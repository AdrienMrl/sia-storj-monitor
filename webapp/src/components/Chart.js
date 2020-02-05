import * as R from 'ramda';
import React, { useState } from 'react';
import {
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  LineSeries,
  VerticalGridLines,
  LineMarkSeries,
  DiscreteColorLegend,
  Crosshair,
} from 'react-vis';
import '../../node_modules/react-vis/dist/style.css';

const Chart = ({ title, data, toString, tickFormatX, tickFormatY }) => {
  const [hoverPoint, setHoverPoint] = useState();

  return (
    <div>
      {title}
      <XYPlot width={300} height={200}>
        <XAxis title="Date" tickFormat={tickFormatX} />
        <YAxis width={50} title={title} tickFormat={tickFormatY} />
        <LineSeries
          style={{}}
          curve={'curveMonotoneX'}
          color="#55A5F1"
          data={data}
          onNearestX={setHoverPoint}
        />
        <Crosshair values={[hoverPoint]}>
          <div style={{ background: 'black', width: '150px' }}>
            {toString(hoverPoint)}
          </div>
        </Crosshair>
      </XYPlot>
    </div>
  );
};

export default Chart;

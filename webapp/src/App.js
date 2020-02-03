import * as R from 'ramda';
import React, { useState, useEffect } from 'react';
import StorageNode from './components/StorageNode';
import styled from 'styled-components';
import * as api from './api';
import { prettyCurrency, extractRevenueFromRecord, myPrettyBytes } from './components/helpers';
import useMap from 'react-hanger/array/useMap';

const BigNumberBox = ({ title, value }) => (
  <BigNumberBox.Wrapper>
    <BigNumberBox.Title>{title}</BigNumberBox.Title>
    <BigNumberBox.Value>{value}</BigNumberBox.Value>
  </BigNumberBox.Wrapper>
);

BigNumberBox.Title = styled.div`
  font-weight: 300;
  font-size: 13px;
  color: #747aaa;
  margin-bottom: -8px;
`;

BigNumberBox.Value = styled.div`
  font-size: 62px;
  color: white;
  font-weight: bold;
`;

BigNumberBox.Wrapper = styled.div`
  border-radius: 8px;
  background: #21243e;
  color: white;
  margin: 20px;
  display: inline-block;
  padding: 20px;
`;

const computeTotalIncome = R.compose(
  prettyCurrency,
  R.sum,
  R.map(records => {
    if (records.length < 1)
      return 0;
    const revenueOld = records[0];
    const revenueNew = records[records.length - 1];
    return extractRevenueFromRecord(revenueNew) - extractRevenueFromRecord(revenueOld);
  }),
  map => Array.from(map.values()),
);

const computeTotalStorage = R.compose(
  total => myPrettyBytes(total, 0),
  R.sum,
  R.pluck('spaceUsed'),
  R.map(R.last),
  map => Array.from(map.values())
);

function App() {
  const [nodes, setNodes] = useState();
  const [totalMetrics, { set }] = useMap();

  useEffect(() => {
    api.login('hello@adrienmorel.co', 'kronos').then(resp => {
      setNodes(resp.hosts);
    });
  }, []);
  return (
    <App.Wrapper>
      <BigNumberBox title="Income 30 days" value={computeTotalIncome(totalMetrics)} />
      <BigNumberBox title="Total Storage" value={computeTotalStorage(totalMetrics)} />
      <BigNumberBox title="Income Last Month" value="$-.--" />
      {nodes &&
        nodes.map((node, index) => (
          <StorageNode key={index.toString()} node={node} onFetchedMetrics30={(records) => {
            set(node._id, records);
          }} />
        ))}
    </App.Wrapper>
  );
}

App.Wrapper = styled.div`
  padding-top: 40px;
  background: #282c4e;
  min-height: 100vh;
  font-family: 'Karla', sans-serif;
`;

export default App;

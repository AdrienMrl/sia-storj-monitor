import React, { useState, useEffect } from 'react';
import StorageNode from './components/StorageNode';
import styled from 'styled-components';
import * as api from './api';

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

function App() {
  const [nodes, setNodes] = useState();
  useEffect(() => {
    api.login('hello@adrienmorel.co', 'kronos').then(resp => {
      setNodes(resp.hosts);
    });
  }, []);
  return (
    <App.Wrapper>
      <BigNumberBox title="Income Per Month" value="$278" />
      <BigNumberBox title="Total Storage" value="32.4TB" />
      <BigNumberBox title="Income Last Month" value="$395" />
      {nodes &&
        nodes.map((node, index) => (
          <StorageNode key={index.toString()} node={node} />
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

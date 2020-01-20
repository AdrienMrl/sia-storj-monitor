import React, { useState, useEffect } from 'react';
import StorageNode from './components/StorageNode';
import styled from 'styled-components';
import Axios from 'axios';

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
  const [records, setRecords] = useState();
  useEffect(() => {
    const nodeId = '5e26267a3bd72c785c0798db';
    Axios({
      method: 'GET',
      url: `http://localhost:3002/node/${nodeId}/records`,
      headers: {
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZTI1NTBjOGExYzVjMjZmODYyMjE5NGQiLCJpYXQiOjE1Nzk1NjE1NDd9.Po_zgYOY38jwlfdFvj6pB3z8fg4GO6ch8_10IvusBQM',
      },
    }).then(resp => setRecords(resp.data));
  }, []);
  console.log(records);
  return (
    <App.Wrapper>
      <BigNumberBox title="Income Per Month" value="$278" />
      <BigNumberBox title="Total Storage" value="32.4TB" />
      <BigNumberBox title="Income Last Month" value="$395" />
      <StorageNode />
      <StorageNode />
      <StorageNode />
      <StorageNode />
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

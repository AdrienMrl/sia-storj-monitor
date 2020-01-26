import * as R from 'ramda';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Chart from './Chart';
import * as api from '../api';
import moment from 'moment';

const KB = 1000;
const MB = KB * 1000;
const GB = MB * 1000;
const TB = GB * 1000;

const SC = 1000000000000000000000000;

const myPrettyBytes = (count, dec = 3) => {
  if (count > TB) return `${(count / TB).toFixed(dec)}TB`;
  else if (count > GB) {
    return `${(count / GB).toFixed(dec)}GB`;
  }
  return `${(count / MB).toFixed(dec)}MB`;
};

const prettyCurrency = (count, dec = 2) => (count / SC).toFixed(dec) + 'SC';

// TODO: optimize having the server send a timestamp
const transformForUsedSpace = R.compose(
  R.map(record => ({
    x: moment(R.prop('createdAt', record)),
    y: R.prop('spaceUsed', record),
  })),
  R.defaultTo([]),
);

// TODO: optimize having the server send a timestamp
// TODO: send numbers
const transformForIncome = R.compose(
  R.tap(console.log),
  R.map(record => ({
    x: moment(R.prop('createdAt', record)),
    y:
      parseInt(record.storagerevenue) +
      parseInt(record.downloadbandwidthrevenue) +
      parseInt(record.uploadbandwidthrevenue),
  })),
  R.defaultTo([]),
);

const StorageNode = ({ node }) => {
  const [records, setRecords] = useState();
  useEffect(() => {
    api.getRecords(node._id).then(setRecords);
  }, []);
  return (
    <StorageNode.Wrapper>
      <StorageNode.NodeIdentitiy>
        <StorageNode.OnlineIndicator alt="Online" online />
        pi@43.54.124.95 [STORJ]
      </StorageNode.NodeIdentitiy>
      <StorageNode.ChartsContent>
        <StorageNode.ChartWrapper>
          <Chart
            data={transformForUsedSpace(records)}
            toString={point =>
              point &&
              `${moment(point.x).format('MM/DD hh:mm')}: ${myPrettyBytes(
                point.y,
              )}`
            }
            tickFormatX={value => moment(value).format('hh:mm')}
            tickFormatY={value => myPrettyBytes(value, 0)}
          />
        </StorageNode.ChartWrapper>
        <Alerts />
        <StorageNode.ChartWrapper>
          <Chart
            data={transformForIncome(records)}
            toString={point =>
              point &&
              `${moment(point.x).format('MM/DD hh:mm')}: ${prettyCurrency(
                point.y,
              )}`
            }
            tickFormatX={value => moment(value).format('hh:mm')}
            tickFormatY={value => prettyCurrency(value, 0)}
          />
        </StorageNode.ChartWrapper>
      </StorageNode.ChartsContent>
    </StorageNode.Wrapper>
  );
};

StorageNode.ChartsContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 20px;
`;

StorageNode.ChartWrapper = styled.div`
  margin: 16px;
  background: #2e3257;
  border-radius: 20px;
  padding: 10px;
`;

StorageNode.NodeIdentitiy = styled.div`
  display: flex;
  align-items: center;
`;

StorageNode.OnlineIndicator = styled.div`
  height: 14px;
  width: 14px;
  border-radius: 50%;
  background: #45d428;
  margin-right: 8px;
`;

StorageNode.Wrapper = styled.div`
  background: #202440;
  padding: 30px;
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 9px 0 rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
`;

const AlertItem = ({ title, onClick, action, actionColor }) => (
  <AlertItem.Wrapper>
    {title}
    <AlertItem.ActionButton onClick={onClick} actionColor={actionColor}>
      {action}
    </AlertItem.ActionButton>
  </AlertItem.Wrapper>
);

AlertItem.ActionButton = styled.div`
  cursor: pointer;
  border-radius: 5px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
  background: ${props => props.actionColor};
  padding: 6px;
  margin-left: 25px;
`;

AlertItem.Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  color: white;
  font-weight: 600;
  margin-bottom: 8px;
`;

const Separator = styled.div`
  width: 100%;
  min-height: 1px;
  background: rgba(0, 0, 0, 0.3);
  margin-bottom: 8px;
`;

const Alerts = () => {
  return (
    <Alerts.Wrapper>
      <Alerts.Title>CONTROL PANEL</Alerts.Title>
      <AlertItem
        title="Wallet is locked"
        onClick={() => {}}
        action="UNLOCK"
        actionColor="#e35e68"
      />
      <Separator />
      <AlertItem
        title="Storage Pricing 200SC"
        onClick={() => {}}
        action="+100SC"
        actionColor="#8AC64F"
      />
      <Separator />
      <AlertItem
        title="Download Bandwidth Pricing 500SC"
        onClick={() => {}}
        action="+200SC"
        actionColor="#8AC64F"
      />
    </Alerts.Wrapper>
  );
};

Alerts.Wrapper = styled(StorageNode.ChartWrapper)`
  font-size: 12px;
  min-width: 250px;
  padding-left: 25px;
  padding-top: 14px;
`;

Alerts.Title = styled.div`
  color: #747aaa;
  font-weight: 600;
  letter-spacing: 2px;
  margin-bottom: 22px;
`;

export default StorageNode;

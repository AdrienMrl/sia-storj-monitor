import * as R from 'ramda';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Chart from './Chart';
import * as api from '../api';
import moment from 'moment';
import { prettyCurrency, extractRevenueFromRecord, myPrettyBytes, TB, blockToMonth } from './helpers';

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
  R.map(record => ({
    x: moment(R.prop('createdAt', record)),
    y:
      extractRevenueFromRecord(record),
  })),
  R.defaultTo([]),
);

const StorageNode = ({ node, onFetchedMetrics30 }) => {
  const [records, setRecords] = useState();
  useEffect(() => {
    api.getRecords(node._id).then(recs => {
      setRecords(recs);
      onFetchedMetrics30(recs.filter(rec => moment(rec.createdAt) >= moment().subtract(30, 'days')));
    });
  }, []);
  return (
    <StorageNode.Wrapper>
      <StorageNode.NodeIdentitiy>
        <StorageNode.OnlineIndicator alt="Online" online={node.nodeType === 'STORJ' || (node.nodeType === 'SIA' && node.settings.workingstatus === 'working')} />
        {node.username}@{node.ip} [{node.nodeType}]
      </StorageNode.NodeIdentitiy>
      <StorageNode.ChartsContent>
        <ControlPanel node={node} />
        <StorageNode.ChartWrapper>
          <Chart
            title="Storage Used"
            data={transformForUsedSpace(records)}
            toString={point =>
              point &&
              `${moment(point.x).format('MM/DD hh:mm')}: ${myPrettyBytes(
                point.y,
              )}`
            }
            tickFormatX={value => moment(value).format('M/DD')}
            tickFormatY={value => myPrettyBytes(value, 0)}
          />
        </StorageNode.ChartWrapper>
        <StorageNode.ChartWrapper>
          <Chart
            title="Income"
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
  margin: 6px;
  background: #2e3257;
  border-radius: 6px;
  padding: 10px;
  box-shadow: 0 5px 9px 0 rgba(0, 0, 0, 0.2);
`;

StorageNode.NodeIdentitiy = styled.div`
  display: flex;
  align-items: center;
`;

StorageNode.OnlineIndicator = styled.div`
  height: 14px;
  width: 14px;
  border-radius: 50%;
  background: ${props => props.online ? '#45d428' : '#e35e68'};
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
  border-bottom: solid 1px rgba(0, 0, 0, 0.5);
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

const ControlPanel = ({ node }) => {
  const wallet = R.path(['settings', 'wallet'], node);
  const green = "#8AC64F";
  const red = "#e35e68";
  const dark = "#121212";
  const isSia = !!wallet;
  console.log(node.settings)

  return (
    <ControlPanel.Wrapper>
      <ControlPanel.Title>CONTROL PANEL</ControlPanel.Title>
      {isSia &&
        <>
          <AlertItem
            title="Storage Pricing TB/Month"
            action={node.settings}
            action={prettyCurrency(blockToMonth(parseInt(node.settings.storageprice)) * TB, 0)}
            actionColor={dark}
          />
          <Separator />
          <AlertItem
            title="Download Bandwidth Pricing"
            action={prettyCurrency(parseInt(node.settings.downloadbandwidthprice) * TB, 0)}
            actionColor={dark}
          />
          <Separator />
          <AlertItem
            title="Wallet balance"
            action={prettyCurrency(parseInt(wallet.balance), 0)}
            actionColor={dark}
          />
          <Separator />
          <AlertItem
            title="Wallet status"
            action={wallet.unlocked ? 'UNLOCKED' : 'LOCKED'}
            actionColor={wallet.unlocked ? dark : red}
          />
        </>}
    </ControlPanel.Wrapper>
  );
};

ControlPanel.Wrapper = styled(StorageNode.ChartWrapper)`
  font-size: 12px;
  min-width: 250px;
  padding-left: 25px;
  padding-top: 14px;
`;

ControlPanel.Title = styled.div`
  color: #747aaa;
  font-weight: 600;
  letter-spacing: 2px;
  margin-bottom: 22px;
`;

export default StorageNode;

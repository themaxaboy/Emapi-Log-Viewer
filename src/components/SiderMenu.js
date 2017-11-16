import React from "react";
import { Menu, Icon } from "antd";

const { SubMenu } = Menu;

export default class SiderMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openKeys: ["sub1"]
    };
  }

  rootSubmenuKeys = [
    "sub1",
    "sub2",
    "sub3",
    "sub4",
    "sub5",
    "sub6",
    "sub7",
    "sub8",
    "sub9",
    "sub10",
    "sub11"
  ];

  onOpenChange = openKeys => {
    const latestOpenKey = openKeys.find(
      key => this.state.openKeys.indexOf(key) === -1
    );
    if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      this.setState({ openKeys });
    } else {
      this.setState({
        openKeys: latestOpenKey ? [latestOpenKey] : []
      });
    }
  };

  render() {
    return (
      <Menu
        mode="inline"
        openKeys={this.state.openKeys}
        onOpenChange={this.onOpenChange}
        defaultSelectedKeys={["0"]}
        defaultOpenKeys={["sub1"]}
        style={{ height: "98vh", borderRight: 0 }}
        multiple={false}
      >
        <Menu.Item key="0">
          <Icon type="line-chart" />All Messages
        </Menu.Item>

        <SubMenu
          key={"sub1"}
          title={
            <span>
              <Icon type="line-chart" />
              Emapi Index
            </span>
          }
        >
          <Menu.Item key="1">Index Composition</Menu.Item>
          <Menu.Item key="2">Index Event</Menu.Item>
        </SubMenu>

        <SubMenu
          key={"sub2"}
          title={
            <span>
              <Icon type="home" />
              Emapi Market
            </span>
          }
        >
          <Menu.Item key="3">Market</Menu.Item>
          <Menu.Item key="4">Market By Level Event</Menu.Item>
          <Menu.Item key="5">Market Depth</Menu.Item>
          <Menu.Item key="6">Market List</Menu.Item>
          <Menu.Item key="7">Market Statistics Event</Menu.Item>
        </SubMenu>

        <SubMenu
          key={"sub3"}
          title={
            <span>
              <Icon type="notification" />
              Emapi News
            </span>
          }
        >
          <Menu.Item key="8">News Event</Menu.Item>
          <Menu.Item key="9">News Report Types</Menu.Item>
        </SubMenu>

        <SubMenu
          key={"sub4"}
          title={
            <span>
              <Icon type="database" />
              Emapi OrderBook
            </span>
          }
        >
          <Menu.Item key="10">Order Book</Menu.Item>
          <Menu.Item key="11">Order Book Parameters</Menu.Item>
          <Menu.Item key="12">Order Book Rule Group</Menu.Item>
          <Menu.Item key="13">Order Book Rule Group Parameters</Menu.Item>
          <Menu.Item key="14">Order Book State Change Event</Menu.Item>
        </SubMenu>

        <SubMenu
          key={"sub5"}
          title={
            <span>
              <Icon type="solution" />
              Emapi Order
            </span>
          }
        >
          <Menu.Item key="15">Order Cancel Req</Menu.Item>
          <Menu.Item key="16">Order Cancel Rsp</Menu.Item>
          <Menu.Item key="17">Order Event Private</Menu.Item>
          <Menu.Item key="18">Order Insert Req</Menu.Item>
          <Menu.Item key="19">Order Insert Rsp</Menu.Item>
          <Menu.Item key="20">Order Update Req</Menu.Item>
          <Menu.Item key="21">Order Update Rsp</Menu.Item>
        </SubMenu>

        <SubMenu
          key={"sub6"}
          title={
            <span>
              <Icon type="desktop" />
              Emapi Server
            </span>
          }
        >
          <Menu.Item key="22">Server Group</Menu.Item>
          <Menu.Item key="23">Server Process</Menu.Item>
          <Menu.Item key="24">Server Properties</Menu.Item>
        </SubMenu>

        <SubMenu
          key={"sub7"}
          title={
            <span>
              <Icon type="pay-circle-o" />
              Emapi Tax
            </span>
          }
        >
          <Menu.Item key="25">Tax End Snapshot</Menu.Item>
          <Menu.Item key="26">Tax Heartbeat Req</Menu.Item>
          <Menu.Item key="27">Tax Heartbeat Rsp</Menu.Item>
          <Menu.Item key="28">Tax Replay End Event</Menu.Item>
          <Menu.Item key="29">Tax Replay Start Event</Menu.Item>
          <Menu.Item key="30">Tax Start Snapshot</Menu.Item>
        </SubMenu>

        <SubMenu
          key={"sub8"}
          title={
            <span>
              <Icon type="bars" />
              Emapi Tick
            </span>
          }
        >
          <Menu.Item key="31">EmapiTickSizeTable</Menu.Item>
          <Menu.Item key="32">EmapiTickSizeTableRow</Menu.Item>
        </SubMenu>

        <SubMenu
          key={"sub9"}
          title={
            <span>
              <Icon type="camera-o" />
              Emapi Tradable
            </span>
          }
        >
          <Menu.Item key="33">EmapiTradableInstrument</Menu.Item>
          <Menu.Item key="34">EmapiTradableInstrumentReference</Menu.Item>
        </SubMenu>

        <SubMenu
          key={"sub10"}
          title={
            <span>
              <Icon type="switcher" />
              Emapi Trade
            </span>
          }
        >
          <Menu.Item key="35">EmapiTradeEvent</Menu.Item>
          <Menu.Item key="36">EmapiTradeEventPrivate</Menu.Item>
          <Menu.Item key="37">EmapiTradeReportTypes</Menu.Item>
          <Menu.Item key="38">EmapiTradeUpdateReq</Menu.Item>
          <Menu.Item key="39">EmapiTradeUpdateRsp</Menu.Item>
        </SubMenu>

        <SubMenu
          key={"sub11"}
          title={
            <span>
              <Icon type="api" />
              Emapi Other
            </span>
          }
        >
          <Menu.Item key="40">AdvertisementEvent</Menu.Item>
          <Menu.Item key="41">AllowedOrderTypes</Menu.Item>
          <Menu.Item key="42">AuctionEvent</Menu.Item>
          <Menu.Item key="43">CalendarDate</Menu.Item>
          <Menu.Item key="44">CircuitBreakerIndex</Menu.Item>
          <Menu.Item key="45">Currency</Menu.Item>
          <Menu.Item key="46">DateCollection</Menu.Item>
          <Menu.Item key="47">DelayClass</Menu.Item>
          <Menu.Item key="48">IndustrySector</Menu.Item>
          <Menu.Item key="49">Instrument</Menu.Item>
          <Menu.Item key="50">LatestStateSequenceNumber</Menu.Item>
          <Menu.Item key="51">RandomizedStartParameter</Menu.Item>
          <Menu.Item key="52">Segment</Menu.Item>
          <Menu.Item key="53">StateTransition</Menu.Item>
          <Menu.Item key="54">SubscriptionGroup</Menu.Item>
          <Menu.Item key="55">TradingSchedule</Menu.Item>
          <Menu.Item key="56">UpdatedIndicativePriceEvent</Menu.Item>
          <Menu.Item key="57">WaitForSSNEvent</Menu.Item>
        </SubMenu>
      </Menu>
    );
  }
}

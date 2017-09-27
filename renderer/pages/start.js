import { Component } from "react";
import { ipcRenderer } from "electron";
import fs from "fs";

import {
  Button,
  Table,
  LocaleProvider,
  Layout,
  Menu,
  Icon,
  Row,
  Col,
  Collapse,
  Tabs,
  Input
} from "antd";

const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;

const { Header, Footer, Sider, Content } = Layout;
const { SubMenu } = Menu;

import enUS from "antd/lib/locale-provider/en_US";
import Head from "next/head";
import Link from "next/link";

import CssHeader from "../components/Header";

let messageData = [];
let searchText = "";

export default class extends Component {
  state = {
    input: "",
    message: null,
    path: "",

    loading: false,
    searching: false,
    dataShow: [],
    genaralTab: "",
    detailsTab: "",

    searchDropdownVisible: false,
    searched: false
  };

  componentDidMount() {
    // start listening the channel message
    ipcRenderer.on("message", this.handleMessage);

    ipcRenderer.on("selected-directory", (event, path) => {
      //console.log(path);
      let directory = String(path);

      fs.readdir(directory, (err, files) => {
        messageData = [];
        let itemsProcessed = 0;
        this.setState({ loading: true });

        files.map((filename, index, array) => {
          let filepath = directory + "\\" + filename;
          //console.log(filepath);

          fs.readFile(filepath, "utf8", (err, data) => {
            if (err) {
              return console.log(err);
            }

            let dataPack = data.trim().split(/\n/);
            let messageObject = [];

            dataPack.map((singleLine, index) => {
              messageObject.push({
                date: singleLine.substring(0, 8),
                time: singleLine.substring(9, 21),
                type: singleLine.substring(
                  singleLine.indexOf("[") + 1,
                  singleLine.indexOf("]")
                ),
                message: singleLine
                  .substring(singleLine.indexOf("]") + 1)
                  .trim()
              });
            });
            messageData.push(...messageObject);
            itemsProcessed++;
            if (itemsProcessed === array.length) {
              this.setState({
                dataShow: [...messageData],
                loading: false
              });
            }
          });
        });
      });
    });
  }

  componentWillUnmount() {
    // stop listening the channel message
    ipcRenderer.removeListener("message", this.handleMessage);
  }

  handleMessage = (event, message) => {
    // receive a message from the main process and save it in the local state
    this.setState({ message });
  };

  handleChange = event => {
    this.setState({ input: event.target.value });
  };

  handleSubmit = event => {
    event.preventDefault();
    ipcRenderer.send("message", this.state.input);
    this.setState({ message: null });
  };

  handleBrowse = event => {
    ipcRenderer.send("open-file-dialog");
  };

  handleRowClick = data => {
    this.setState({ genaralTab: data, detailsTab: data });
  };

  onInputChange = e => {
    searchText = e.target.value;
  };

  onSearch = () => {
    //const { searchText } = this.state;
    const reg = new RegExp(searchText, "gi");
    if (searchText != "" && searchText.length > 2) {
      this.setState({
        searchDropdownVisible: false,
        searched: !!searchText,
        dataShow: messageData
          .map(record => {
            const match = record.message.match(reg);
            if (!match) {
              return null;
            }
            return {
              ...record,
              message: (
                <span>
                  {record.message
                    .split(reg)
                    .map(
                      (text, i) =>
                        i > 0
                          ? [
                              <span style={{ color: "#f50" }}>{match[0]}</span>,
                              text
                            ]
                          : text
                    )}
                </span>
              )
            };
          })
          .filter(record => !!record)
      });
    } else {
      this.setState({
        searchDropdownVisible: false,
        searched: !!searchText,
        dataShow: [...messageData]
      });
    }
  };

  render() {
    let dataSource = [];

    const columns = [
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
        width: 80
      },
      {
        title: "Time",
        dataIndex: "time",
        key: "time",
        width: 100
      },
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
        width: 200,
        filters: [
          {
            text: "Index Composition",
            value: "EmapiIndexComposition"
          },
          {
            text: "Emapi Auction Event",
            value: "EmapiAuctionEvent"
          }
        ],
        onFilter: (value, record) => record.type.includes(value)
      },
      {
        title: "Message",
        dataIndex: "message",
        key: "message",
        filterDropdown: (
          <div
            style={{
              padding: 8,
              borderBottomLeftRadius: 6,
              borderBottomRightRadius: 6,
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
              boxShadow: "0 1px 6px rgba(0, 0, 0, .2)",
              backgroundColor: "#fff"
            }}
          >
            <Input
              style={{
                width: 130,
                marginRight: 8
              }}
              ref={ele => (this.searchInput = ele)}
              placeholder="Search message"
              /*value={searchText}*/
              onChange={this.onInputChange}
              onPressEnter={this.onSearch}
            />
            <Button
              loading={this.state.searching}
              icon="search"
              shape="circle"
              type="primary"
              onClick={this.onSearch}
            />
          </div>
        ),
        filterIcon: (
          <Icon
            type="search"
            style={{ color: this.state.searched ? "#108ee9" : "#aaa" }}
          />
        ),
        searchDropdownVisible: this.state.searchDropdownVisible,
        onsearchDropdownVisibleChange: visible => {
          this.setState({searchDropdownVisible: visible },
            () => this.searchInput.focus()
          );
        }
      }
    ];
    this.state.dataShow.map((data, index) => {
      dataSource.push({
        key: index,
        date: data.date,
        time: data.time,
        type: data.type,
        message: data.message
      });
    });
    return (
      <LocaleProvider locale={enUS}>
        <div>
          <CssHeader title="Start Page!" />
          <Layout
            style={{
              maxHeight: "100vh",
              backgroundColor: "#f0f0f0"
            }}
          >
            <Layout
              className="header"
              style={{
                backgroundColor: "#ffffff",
                height: "4.5vh",
                marginBottom: "0.5vh"
              }}
            >
              Toolbar
            </Layout>

            <Layout>
              <Sider
                style={{
                  backgroundColor: "#ffffff",
                  padding: 0,
                  overflow: "auto"
                }}
              >
                <Menu
                  mode="inline"
                  defaultSelectedKeys={["1"]}
                  defaultOpenKeys={["sub1"]}
                  style={{ height: "100%", borderRight: 0 }}
                  multiple={false}
                >
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
                    <Menu.Item key="13">
                      Order Book Rule Group Parameters
                    </Menu.Item>
                    <Menu.Item key="14">
                      Order Book State Change Event
                    </Menu.Item>
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
                    <Menu.Item key="34">
                      EmapiTradableInstrumentReference
                    </Menu.Item>
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
              </Sider>
              <Content
                style={{
                  maxHeight: "90vh",
                  paddingLeft: 5,
                  paddingRight: 5,
                  paddingTop: 0,
                  paddingBottom: 0
                }}
              >
                <Row style={{ height: "40vh", backgroundColor: "#fff" }}>
                  <Table
                    style={{ backgroundColor: "#fff" }}
                    size="small"
                    dataSource={dataSource}
                    columns={columns}
                    scroll={{ y: "27vh" }}
                    pagination={{ showQuickJumper: true, pageSize: 50 }}
                    loading={this.state.loading}
                    onRowClick={record => this.handleRowClick(record.message)}
                  />
                </Row>
                <Row style={{ height: "50vh", backgroundColor: "#fff" }}>
                  <Tabs
                    tabPosition="left"
                    defaultActiveKey="1"
                    style={{ padding: 10 }}
                  >
                    <TabPane tab="Genaral" key="1">
                      {this.state.genaralTab}
                    </TabPane>
                    <TabPane tab="Details" key="2">
                      {this.state.detailsTab}
                    </TabPane>
                  </Tabs>
                </Row>
              </Content>

              <Sider style={{ backgroundColor: "#ffffff", padding: 0 }}>
                <Collapse defaultActiveKey={["1"]}>
                  <Panel header="Application" key="1">
                    <p>
                      <a onClick={this.handleBrowse}>
                        <Icon type="link" /> Import Logs...
                      </a>
                    </p>
                    <p>
                      <a onClick={this.handleBrowse}>
                        <Icon type="link" /> Export Logs...
                      </a>
                    </p>
                    <p>
                      <a>
                        <Icon type="link" /> Refresh
                      </a>
                    </p>
                    <p>
                      <a>
                        <Icon type="link" /> Help
                      </a>
                    </p>
                  </Panel>
                  <Panel header="Logs" key="2">
                    <p>123456</p>
                  </Panel>
                </Collapse>
              </Sider>
            </Layout>

            <Footer
              style={{
                height: "5vh",
                backgroundColor: "#f0f0f0",
                padding: 0,
                alignSelf: "center"
              }}
            >
              Footer
            </Footer>
          </Layout>
        </div>
      </LocaleProvider>
    );
  }
}

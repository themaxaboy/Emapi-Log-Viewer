import "../assets/css/antd.min.css";
import alasql from "../assets/js/alasql.min.js";
import emapiDocs from "../assets/json/emapi_codes.json";

import React from "react";
import { ipcRenderer } from "electron";
import fs from "fs";

import ReactJson from "react-json-view";
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
  Input,
  Progress,
  Spin,
  Card
} from "antd";
const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;
const { Header, Footer, Sider, Content } = Layout;
const { SubMenu } = Menu;
import enUS from "antd/lib/locale-provider/en_US";

let messageData = [];
const rootSubmenuKeys = [
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

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: "",
      message: null,

      loading: false,
      progress: 0,
      searching: false,
      dataShow: [],

      searchText: "",
      filterDropdownVisible: false,
      filtered: false,

      openKeys: ["sub1"],
      genaralTab: "",
      detailsTab: ""
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

  componentDidMount() {
    // start listening the channel message
    ipcRenderer.on("message", this.handleMessage);

    ipcRenderer.on("selected-directory", (event, path) => {
      this.setState({ loading: true }, this.readFileToDatebase(path));
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeListener("message", this.handleMessage);
  }

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

  readFileToDatebase = path => {
    let directory = path.toString();
    messageData = [];

    fs.readdir(directory, (err, files) => {
      let itemsProcessed = 0;

      files.map((filename, index, array) => {
        let filepath = directory + "\\" + filename;

        fs.readFile(filepath, "utf8", (err, data) => {
          let dataPack = data.trim().split(/\n/);

          dataPack.map((singleLine, index) => {
            messageData.push({
              date: singleLine.substring(0, 8),
              time: singleLine.substring(9, 21),
              type: singleLine.substring(
                singleLine.indexOf("[") + 1,
                singleLine.indexOf("]")
              ),
              message: singleLine
                .substring(singleLine.indexOf(" ", 24) + 1)
                .trim()
            });
          });

          itemsProcessed++;
          if (itemsProcessed % 10 == 0) {
            this.setState({
              progress: parseInt(itemsProcessed / array.length * 100)
            });
          }

          if (itemsProcessed === array.length) {
            this.setState({
              progress: 100
            });

            //Cheat and load your data directly
            alasql(
              "CREATE TABLE emapi (date date,time time,type string,message string)"
            );
            alasql.tables.emapi.data = messageData;
            this.setState({ dataShow: messageData }, () => {
              this.setState({ loading: false });
              messageData = [];
            });
          }
        });
      });
    });
  };

  handleMessage = (event, message) => {
    // receive a message from the main process and save it in the local state
    this.setState({ message });
  };

  handleSubmit = event => {
    event.preventDefault();
    ipcRenderer.send("message", this.state.input);
    this.setState({ message: null });
  };

  onBrowse = () => {
    ipcRenderer.send("open-file-dialog");
  };

  onRowClick = data => {
    let details = this.convertRawToDetails(data);
    this.setState({
      detailsTab: details,
      genaralTab: data
    });
  };

  convertRawToDetails = raw => {
    window.raw = raw;
    console.log(raw);
    raw = raw.toString();
    const msgId = raw.split("=", 1);
    const splitIdx = raw.indexOf("=");
    if (msgId && splitIdx >= 0) {
      const doc = emapiDocs[msgId] || null;
      let details = {};
      if (doc) {
        const fields = doc.fields;
        let data = raw.substring(splitIdx + 1);
        // remove bracket
        data = data.substring(1, data.length - 1);
        const chucks = data.split("|");
        chucks.forEach(function(item) {
          const subCode = item.split("=", 1);
          const subIdx = item.indexOf("=");
          const subData = subIdx >= 0 ? item.substring(subIdx + 1) : "";
          details[fields[subCode]["name"]] = subData;
        });
      }
      console.log(details);
      return details;
    }
    return "Cannot parse, please check parsing function.";
  };

  onInputChange = event => {
    this.setState({ searchText: event.target.value });
  };

  onSearch = () => {
    const { searchText } = this.state;
    const reg = new RegExp(searchText, "gi");
    this.setState(
      {
        searching: true,
        filterDropdownVisible: false,
        filtered: !!searchText,
        //dataShow: alasql(`SELECT * FROM emapi WHERE message LIKE "%${searchText}%" and type = "EmapiInstrument"`)
        dataShow: !searchText
          ? alasql(`SELECT * FROM emapi`)
          : alasql(`SELECT * FROM emapi`)
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
                                  <span style={{ color: "#f50" }}>
                                    {match[0]}
                                  </span>,
                                  text
                                ]
                              : text
                        )}
                    </span>
                  )
                };
              })
              .filter(record => !!record)
      },
      () => {
        this.setState({ searching: false });
      }
    );
  };

  render() {
    const columns = [
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
        width: 70
      },
      {
        title: "Time",
        dataIndex: "time",
        key: "time",
        width: 85
      },
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
        width: 180,
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
              value={this.state.searchText}
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
            style={{ color: this.state.filtered ? "#108ee9" : "#aaa" }}
          />
        ),
        filterDropdownVisible: this.state.filterDropdownVisible,
        onFilterDropdownVisibleChange: visible => {
          this.setState({ filterDropdownVisible: visible });
          setTimeout(() => {
            this.searchInput.focus();
          }, 100);
        }
      }
    ];

    return (
      <LocaleProvider locale={enUS}>
        <div>
          <Spin
            tip={"Loading..." + this.state.progress + "%"}
            size="large"
            spinning={this.state.loading}
          >
            <Layout
              style={{
                maxHeight: "100vh",
                backgroundColor: "#f0f0f0"
              }}
            >
              {/* <Layout
                className="header"
                style={{
                  backgroundColor: "#21252b",
                  height: "35px",
                  marginBottom: "5px"
                }}
              >
              Toolbar
              </Layout> */}

              <Layout>
                <Sider
                  style={{
                    backgroundColor: "#ffffff",
                    padding: 0,
                    overflowX: "hidden",
                    overflowY: "auto"
                  }}
                >
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
                      <Menu.Item key="56">
                        UpdatedIndicativePriceEvent
                      </Menu.Item>
                      <Menu.Item key="57">WaitForSSNEvent</Menu.Item>
                    </SubMenu>
                  </Menu>
                </Sider>

                <Content
                  style={{
                    maxHeight: "100vh",
                    paddingLeft: 5,
                    paddingRight: 5,
                    paddingTop: 0,
                    paddingBottom: 0
                  }}
                >
                  <Table
                    style={{
                      height: "50vh",
                      maxHeight: "50vh",
                      backgroundColor: "#fff"
                    }}
                    size="small"
                    dataSource={this.state.dataShow}
                    columns={columns}
                    scroll={{ y: "33vh" }}
                    pagination={{
                      showQuickJumper: true,
                      pageSize: 50
                    }}
                    onRowClick={record => this.onRowClick(record.message)}
                  />

                  <Tabs
                    defaultActiveKey="2"
                    style={{
                      height: "50vh",
                      maxHeight: "50vh",
                      backgroundColor: "#fff"
                    }}
                  >
                    <TabPane
                      tab="Genaral"
                      key="1"
                      style={{
                        paddingLeft: 10,
                        paddingRight: 10,
                        height: "40vh",
                        overflowX: "hidden",
                        overflowY: "auto"
                      }}
                    >
                      <Card>
                        <span
                          style={{ wordBreak: "break-all" }}
                        >
                          {this.state.genaralTab}
                        </span>
                      </Card>
                    </TabPane>
                    <TabPane
                      tab="Details"
                      key="2"
                      style={{
                        paddingLeft: 5
                      }}
                    >
                      <ReactJson
                        style={{
                          height: "40vh",
                          overflowX: "hidden",
                          overflowY: "auto",
                          wordBreak: "break-all"
                        }}
                        src={this.state.detailsTab}
                        iconStyle="circle"
                        displayDataTypes={false}
                      />
                    </TabPane>
                  </Tabs>
                </Content>

                <Sider style={{ backgroundColor: "#ffffff", padding: 0 }}>
                  <Collapse defaultActiveKey={["1"]}>
                    <Panel header="Action" key="1">
                      <p>
                        <a onClick={this.onBrowse}>
                          <Icon type="link" /> Import Logs...
                        </a>
                      </p>
                      <p>
                        <a>
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

              {/* <Footer
                style={{
                  overflow: 'auto',
                  position: 'fixed',
                  bottom: 0,
                  height: "22px",
                  maxWeight: "100vw",
                  backgroundColor: "#f0f0f0",
                  padding: 0,
                }}
              >
              Footer                
              </Footer> */}
            </Layout>
          </Spin>
        </div>
      </LocaleProvider>
    );
  }
}

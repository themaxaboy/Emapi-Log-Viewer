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
  Tabs
} from "antd";

const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;

const { Header, Footer, Sider, Content } = Layout;
const { SubMenu } = Menu;

import enUS from "antd/lib/locale-provider/en_US";
import Head from "next/head";
import Link from "next/link";

import CssHeader from "../components/Header";

export default class extends Component {
  state = {
    input: "",
    message: null,
    path: "",
    loading: false,
    dataHeader: [],
    genaralTab: ""
  };

  componentDidMount() {
    // start listening the channel message
    ipcRenderer.on("message", this.handleMessage);

    ipcRenderer.on("selected-directory", (event, path) => {
      //console.log(path);
      let directory = String(path);

      fs.readdir(directory, (err, files) => {
        this.setState({ loading: true, dataHeader: [] });
        files.forEach(filename => {
          let filepath = directory + "\\" + filename;
          //console.log(filepath);

          fs.readFile(filepath, "utf8", (err, data) => {
            if (err) {
              return console.log(err);
            }

            let dataHeaderPack = data.trim().split(/\n/);
            let messageObject = [];

            dataHeaderPack.map((singleLine, index) => {
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

            this.setState({
              dataHeader: [...this.state.dataHeader, ...messageObject]
            });
          });
        });
        this.setState({ loading: false });
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
    this.setState({ genaralTab: data });
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
        filters: [{
          text: 'Emapi Delay Class',
          value: 'EmapiDelayClass',
        }, {
          text: 'Emapi Trade Report Types',
          value: 'EmapiTradeReportTypes',
        }],
        onFilter: (value, record) => record.type.includes(value)
      },
      {
        title: "Message",
        dataIndex: "message",
        key: "message"
      }
    ];
    this.state.dataHeader.map((data, index) => {
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
              backgroundColor: "#f0f0f0",
              padding: 0
            }}
          >
            <Header
              style={{
                height: "5vh",
                backgroundColor: "#f0f0f0",
                padding: 0,
                alignSelf: "center"
              }}
            >
              Header
            </Header>

            <Layout>
              <Sider style={{ backgroundColor: "#ffffff", padding: 0 }}>
                <Menu
                  mode="inline"
                  defaultSelectedKeys={["1"]}
                  defaultOpenKeys={["sub1"]}
                  style={{ height: "100%", borderRight: 0 }}
                >
                  <SubMenu
                    key="sub1"
                    title={
                      <span>
                        <Icon type="user" />Emapi Logs
                      </span>
                    }
                  >
                    <Menu.Item key="1">Emapi TaxStart Snapshot</Menu.Item>
                    <Menu.Item key="2">Emapi Trade Report Types</Menu.Item>
                    <Menu.Item key="3">Emapi Allowed Order Types</Menu.Item>
                    <Menu.Item key="4">Emapi Instrument</Menu.Item>
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
                      Content of Tab Pane 2
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

import "../assets/css/antd.min.css";
import alasql from "../assets/js/alasql.min.js";
import emapiDocs from "../assets/json/emapi_codes.json";

import React from "react";
import { ipcRenderer } from "electron";
import fs from "fs";
import {
  Button,
  Table,
  LocaleProvider,
  Layout,
  Icon,
  Row,
  Col,
  Input,
  Progress,
  Spin
} from "antd";
const { Header, Footer, Sider, Content } = Layout;
import enUS from "antd/lib/locale-provider/en_US";

import SiderMenu from "./SiderMenu/SiderMenu";
import ActionMenu from "./ActionMenu/ActionMenu";
import InformationTabs from "./InformationTabs/InformationTabs";

export default class App extends React.Component {
  state = {
    input: "",
    message: null,

    loading: false,
    searching: false,
    dataShow: [],

    searchText: "",
    filterDropdownVisible: false,
    filtered: false,

    genaralTab: "",
    detailsTab: "",
    currentMenu: "",

    currentPath: "",
    selectedOption: ""
  };

  componentDidMount() {
    ipcRenderer.on("selected-directory", (event, path) => {
      this.setState({ loading: true }, this.readDirToDatebase(path));
    });

    ipcRenderer.on("selected-files", (event, files) => {
      this.setState({ loading: true }, this.readFilesToDatebase(files));
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeListener("message", this.handleMessage);
  }

  readDirToDatebase = directory => {
    let id = 0;
    directory = directory.toString();

    this.setState({
      dataShow: [],
      loading: true,
      currentPath: directory,
      selectedOption: "directory"
    });

    this.dropCreateDatabase();

    fs.readdir(directory, (err, files) => {
      let itemsProcessed = 0;

      files.map((filename, index, array) => {
        let filepath = directory + "\\" + filename;

        fs.readFile(filepath, "utf8", (err, data) => {
          let dataPack = data.trim().split(/\n/);

          dataPack.map((singleLine, index) => {
            alasql.tables.emapi.data.push({
              id: id++,
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
          if (itemsProcessed === array.length) {
            this.setState({ dataShow: alasql.tables.emapi.data }, () => {
              this.setState({ loading: false });
            });
          }
        });
      });
    });
  };

  readFilesToDatebase = files => {
    let id = 0;

    this.setState({
      dataShow: [],
      loading: true,
      currentPath: files,
      selectedOption: "files"
    });

    this.dropCreateDatabase();

    let itemsProcessed = 0;
    files.map((filename, index, array) => {
      fs.readFile(filename, "utf8", (err, data) => {
        let dataPack = data.trim().split(/\n/);

        dataPack.map((singleLine, index) => {
          alasql.tables.emapi.data.push({
            id: id++,
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
        if (itemsProcessed === array.length) {
          this.setState({ dataShow: alasql.tables.emapi.data }, () => {
            this.setState({ loading: false });
          });
        }
      });
    });
  };

  onRowClick = data => {
    let result = alasql(`SELECT message FROM emapi WHERE id = ${data.id}`);
    let details = this.convertRawToDetails(result[0].message);
    this.setState({
      detailsTab: { Type: data.type, Message: details },
      genaralTab: data.message
    });
  };

  convertRawToDetails = raw => {
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
          let subData = subIdx >= 0 ? item.substring(subIdx + 1) : "";

          if (subData == "T" || subData == "F") {
            subData == "T" ? (subData = true) : (subData = false);
          } else if (Number(subData) || subData == 0) {
            subData = Number(subData);
          } else if (
            new Date(subData) !== "Invalid Date" &&
            !isNaN(new Date(subData))
          ) {
            subData = new Date(subData);
          }

          details[fields[subCode]["name"]] = subData;
        });
      }
      //console.log(JSON.stringify(details));
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

  getDataSiderMenu = data => {
    this.setState({ currentMenu: data });
    console.log(this.state.currentMenu);
  };

  onRefresh = () => {
    if (this.state.selectedOption == "directory") {
      this.readDirToDatebase(this.state.currentPath);
    } else if (this.state.selectedOption == "files") {
      this.readFilesToDatebase(this.state.currentPath);
    }
  };

  getDataActionMenu = action => {
    action = action.target.getAttribute("data-action");
    if (action == "refresh") {
      this.onRefresh();
    } else if (action == "export") {
      window.print();
    }
  };

  dropCreateDatabase = () => {
    alasql("DROP TABLE IF EXISTS emapi");
    alasql(
      "CREATE TABLE emapi (id int,date date,time time,type string,message string)"
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
              backgroundColor: "#ffffff"
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
          <Spin tip={"Loading..."} size="large" spinning={this.state.loading}>
            <Layout
              style={{
                maxHeight: "100vh",
                backgroundColor: "#f0f0f0"
              }}
            >
              <Layout>
                <Sider
                  style={{
                    backgroundColor: "#ffffff",
                    padding: 0,
                    overflowX: "hidden",
                    overflowY: "auto"
                  }}
                >
                  <SiderMenu sendData={this.getDataSiderMenu} />
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
                      backgroundColor: "#ffffff"
                    }}
                    size="small"
                    dataSource={this.state.dataShow}
                    rowKey={record => record.id}
                    columns={columns}
                    scroll={{ y: "40vh" }}
                    pagination={{
                      style: {
                        margin: 10,
                        position: "absolute",
                        right: 0
                      },
                      showQuickJumper: true,
                      pageSize: 50,
                      size: "small"
                    }}
                    onRowClick={record => this.onRowClick(record)}
                  />

                  <InformationTabs
                    genaralTab={this.state.genaralTab}
                    detailsTab={this.state.detailsTab}
                  />
                </Content>

                <Sider style={{ backgroundColor: "#ffffff", padding: 0 }}>
                  <ActionMenu sendData={this.getDataActionMenu} />
                </Sider>
              </Layout>
            </Layout>
          </Spin>
          <style>{`
            ::-webkit-scrollbar-track {
              -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
              background-color: #f1f1f1;
            }

            ::-webkit-scrollbar {
              width: 6px;
              background-color: #f1f1f1;
            }

            ::-webkit-scrollbar-thumb {
              background-color: #c1c1c1;
            }
          `}</style>
        </div>
      </LocaleProvider>
    );
  }
}

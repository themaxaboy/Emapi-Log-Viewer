import { Component } from "react";
import { ipcRenderer } from "electron";
import fs from "fs";

import { Button, Table } from "antd";

import Head from "next/head";
import Link from "next/link";

import CssHeader from "../components/Header";

export default class extends Component {
  state = {
    input: "",
    message: null,
    path: "",
    dataHeader: []
  };

  componentDidMount() {
    // start listening the channel message
    ipcRenderer.on("message", this.handleMessage);

    ipcRenderer.on("selected-directory", (event, path) => {
      console.log(path);
      let directory = String(path);

      fs.readdir(directory, (err, files) => {
        files.forEach(filename => {
          let filepath = directory + "\\" + filename;
          console.log(filepath);

          fs.readFile(filepath, "utf8", (err, data) => {
            if (err) {
              return console.log(err);
            }

            let dataHeaderPack = [];

            data
              .trim()
              .split(/\n\r/)
              .map(dateSet => {
                dateSet
                  .trim()
                  .split(/\n/)
                  .map((dateLineHead, index) => {
                    if (index == 0) {
                      console.log(index + " : " + dateLineHead);
                      dataHeaderPack.push(dateLineHead);
                      return;
                    }
                  });
              });
            this.setState({
              dataHeader: [...this.state.dataHeader, ...dataHeaderPack]
            });
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

  render() {
    let dataSource = [];
    let columns = [
      {
        title: "Data",
        dataIndex: "data",
        key: "data"
      }
    ];
    this.state.dataHeader.map((data, index) => {
      dataSource.push({ key: index, data: data });
    });
    return (
      <div>
        <CssHeader title="Start Page!" />
        <Button type="primary" onClick={this.handleBrowse}>
          Primary
        </Button>
        <Table size="small" dataSource={dataSource} columns={columns} />
      </div>
    );
  }
}

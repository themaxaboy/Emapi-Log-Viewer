import { Component } from "react";
import { ipcRenderer } from "electron";
import fs from "fs";

import Head from "next/head";
import Link from "next/link";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Toolbar from "../components/Toolbar";

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

            data.trim().split(/\n\r/).map(dateSet => {
              dateSet
                .trim()
                .split(/\n/)
                .map((dateLineHead, index) => {
                  if (index == 0) {
                    //console.log(index + " : " + dateLineHead);
                    dataHeaderPack.push(dateLineHead);
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
    return (
      <div>
        <Header title="Emapi Log Viewer" />
        <div className="window">
          <header className="toolbar toolbar-header">
            <div className="toolbar-actions">
              <div className="btn-group">
                <button className="btn btn-default">
                  <span className="icon icon-home" />
                </button>
                <button className="btn btn-default">
                  <span className="icon icon-home icon-text" />
                  Filters
                </button>
                <button className="btn btn-default" onClick={this.handleBrowse}>
                  Browse...
                </button>
              </div>

              <button className="btn btn-default btn-dropdown pull-right">
                <span className="icon icon-megaphone" />
              </button>
            </div>
          </header>

          <div className="window-content">
            <div className="pane-group">
              <div className="pane pane-sm sidebar">
                <nav className="nav-group">
                  <h5 className="nav-group-title">Emapi Viewer</h5>
                  <span className="nav-group-item active">
                    <span className="icon icon-home" />
                    Emapi Logs
                  </span>
                </nav>
              </div>

              <div className="pane">
                <table className="table-striped">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.dataHeader.map((data, index) => {
                      return (
                        <tr>
                          <td>{index}</td>
                          <td>{data}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pane">
                <div className="tab-group">
                  <div className="tab-item active">General</div>
                  <div className="tab-item ">Details</div>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }
}

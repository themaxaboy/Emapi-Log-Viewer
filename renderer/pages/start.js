import { Component } from "react";
import { ipcRenderer } from "electron";

import Head from "next/head";
import Link from "next/link";

export default class extends Component {
  state = {
    input: "",
    message: null
  };

  componentDidMount() {
    // start listening the channel message
    ipcRenderer.on("message", this.handleMessage);
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

  render() {
    return (
      <div>
        <Head>
          <title>Hello Electron!</title>

          <link rel="stylesheet" href="/static/css/photon.min.css" />
        </Head>

        <h1>Hello Electron!</h1>

        <Link href="/about">
          <a>About Page</a>
        </Link>

        {this.state.message && <p>{this.state.message}</p>}

        <form onSubmit={this.handleSubmit}>
          <input type="text" onChange={this.handleChange} />
        </form>

        <div className="window">
          <header className="toolbar toolbar-header">
            <div className="toolbar-actions">
              <div className="btn-group">
                <button className="btn btn-default">
                  <span className="icon icon-home" />
                </button>
                <button className="btn btn-default">
                  <span className="icon icon-folder" />
                </button>
                <button className="btn btn-default active">
                  <span className="icon icon-cloud" />
                </button>
                <button className="btn btn-default">
                  <span className="icon icon-popup" />
                </button>
                <button className="btn btn-default">
                  <span className="icon icon-shuffle" />
                </button>
              </div>

              <button className="btn btn-default">
                <span className="icon icon-home icon-text" />
                Filters
              </button>

              <button className="btn btn-default btn-dropdown pull-right">
                <span className="icon icon-megaphone" />
              </button>
            </div>
          </header>

          <div className="window-content">
            <div className="pane-group">
              <div className="pane pane-sm sidebar">
                <nav className="nav-group">
                  <h5 className="nav-group-title">Favorites</h5>
                  <span className="nav-group-item">
                    <span className="icon icon-home" />
                    connors
                  </span>
                  <span className="nav-group-item active">
                    <span className="icon icon-light-up" />
                    Photon
                  </span>
                  <span className="nav-group-item">
                    <span className="icon icon-download" />
                    Downloads
                  </span>
                  <span className="nav-group-item">
                    <span className="icon icon-folder" />
                    Documents
                  </span>
                  <span className="nav-group-item">
                    <span className="icon icon-window" />
                    Applications
                  </span>
                  <span className="nav-group-item">
                    <span className="icon icon-signal" />
                    AirDrop
                  </span>
                  <span className="nav-group-item">
                    <span className="icon icon-monitor" />
                    Desktop
                  </span>
                </nav>
              </div>

              <div className="pane">
                <table className="table-striped">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Kind</th>
                      <th>Date Modified</th>
                      <th>Author</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>bars.scss</td>
                      <td>Document</td>
                      <td>Oct 13, 2015</td>
                      <td>connors</td>
                    </tr>
                    <tr>
                      <td>base.scss</td>
                      <td>Document</td>
                      <td>Oct 13, 2015</td>
                      <td>connors</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="pane">
                <div className="tab-group">
                  <div className="tab-item">
                    <span className="icon icon-cancel icon-close-tab" />
                    Tab
                  </div>
                  <div className="tab-item active">
                    <span className="icon icon-cancel icon-close-tab" />
                    Tab active
                  </div>
                  <div className="tab-item tab-item-fixed">
                    <span className="icon icon-plus" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <footer className="toolbar toolbar-footer">
            <h1 className="title">Footer</h1>
          </footer>
        </div>
      </div>
    );
  }
}

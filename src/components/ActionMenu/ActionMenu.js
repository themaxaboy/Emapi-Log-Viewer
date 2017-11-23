import React from "react";
import { ipcRenderer } from "electron";

import { Collapse, Icon } from "antd";

const Panel = Collapse.Panel;

export default class ActionMenu extends React.Component {
  onBrowse = () => {
    ipcRenderer.send("open-directory-dialog");
  };

  onBrowseFile = () => {
    ipcRenderer.send("open-file-dialog");
  };

  render() {
    return (
      <Collapse defaultActiveKey={["1"]}>
        <Panel header="Action" key="1">
          <p>
            <a onClick={this.onBrowse}>
              <Icon type="link" /> Import Logs Folder...
            </a>
          </p>
          <p>
            <a onClick={this.onBrowseFile}>
              <Icon type="link" /> Import Logs Files...
            </a>
          </p>
          <p>
            <a data-action="export" onClick={e => this.props.sendData(e)}>
              <Icon type="link" /> Export Logs...
            </a>
          </p>
          <p>
            <a data-action="refresh" onClick={e => this.props.sendData(e)}>
              <Icon type="link" /> Refresh
            </a>
          </p>
          <p>
            <a data-action="help" onClick={e => this.props.sendData(e)}>
              <Icon type="link" /> Help
            </a>
          </p>
        </Panel>
        <Panel header="Logs" key="2">
          <p />
        </Panel>
      </Collapse>
    );
  }
}

import React from "react";
import { Tabs, Card } from "antd";
import ReactJson from "react-json-view";

const TabPane = Tabs.TabPane;

export default class ActionMenu extends React.Component {
  render() {
    return (
      <Tabs
        defaultActiveKey="2"
        style={{
          height: "50vh",
          maxHeight: "50vh",
          backgroundColor: "#ffffff"
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
          {this.props.genaralTab ? (
            <Card>
              <span style={{ wordBreak: "break-all" }}>
                {this.props.genaralTab}
              </span>
            </Card>
          ) : (
            <Card>
              <span>No Data.</span>
            </Card>
          )}
        </TabPane>
        <TabPane
          tab="Details"
          key="2"
          style={{
            paddingLeft: 10
          }}
        >
          {this.props.detailsTab ? (
            <ReactJson
              style={{
                height: "42vh",
                overflowX: "hidden",
                overflowY: "auto",
                wordBreak: "break-all"
              }}
              name={false}
              src={this.props.detailsTab}
              iconStyle="circle"
              displayDataTypes={false}
            />
          ) : (
            <Card
              style={{
                paddingRight: 10
              }}
            >
              <span>No Data.</span>
            </Card>
          )}
        </TabPane>
      </Tabs>
    );
  }
}

import { Component } from "react";

let ReactJson;

export default class FriendlyView extends React.Component {
  constructor() {
    super();
    this.state = { show: false };
  }
  componentDidMount() {
    ReactJson = require("react-json-view");
    this.setState({ show: true });
  }
  render() {
    return (
      <div>
        {this.state.show ? <ReactJson src={"jsonData"} /> : "Loading"}
      </div>
    );
  }
}

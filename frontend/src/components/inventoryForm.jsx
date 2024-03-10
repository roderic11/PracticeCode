import React, { Component } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: `http://localhost:5000/api/inventory/`,
});

class InventoryForm extends Component {
  state = {
    product: [],
  };

  constructor() {
    super();
    api.get("/").then((res) => {
      console.log(res.data);
    });
  }

  render() {
    return <></>;
  }
}

export default InventoryForm;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiMonitor } from "react-icons/fi";
import { FaReceipt } from "react-icons/fa";
import { BsFillPersonLinesFill } from "react-icons/bs";
import "./officialOps.css";
import { Pagination, Stack } from "@mui/material";

function OfficialOperationDashboard() {
  const [operation, setOperation] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("/api/projects");
      const data = response.data;
      setOperation(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  function navigateToOperation() {
    navigate(`/BOM`);
  }

  function navigateToOperationDash() {
    navigate(`/operationDashboard`);
  }

  function navigateToMan() {
    navigate("/ManpowerInfo");
  }
  const getLogoText = (name) => {
    const words = name.split(" ");
    let logoText = "";
    if (words.length >= 1) {
      logoText += words[0][0]; // First letter of the first word
    }
    if (words.length >= 2) {
      logoText += words[1][0]; // First letter of the second word
    }
    return logoText.toUpperCase();
  };

  // Calculate the total number of pages
  const totalPages = Math.ceil(operation.length / itemsPerPage);

  // Get the current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = operation.slice(indexOfFirstItem, indexOfLastItem);

  // Function to handle page change
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };
  const handleGoBack = () => {
    // Use navigate(-1) to go back to the previous page in the history stack
    navigate(-1);
  };

  return (
    <div>
      {" "}
      <div className="container-admins">
        <section className="section-admins">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controllers">Operation Main Dashboard</div>
        </section>
        <section className="section-back" onClick={handleGoBack}>
          <FiArrowLeft />
          <div className="back">BACK</div>
        </section>
      </div>
      <div className="operation-mini-grids">
        <div
          className="operation-mini-grid-container-grid"
          onClick={() => navigateToOperation()}>
          <div className="fill-control">
            <FaReceipt className="AiFillControl" />
          </div>
          <div className="operation-title-containers">
            <div className="equipment-titles">Bill of Materials</div>
            <div className="equipment-infos">Create Project and Add Items</div>
          </div>
        </div>

        <div
          className="operation-mini-grid-container-grid"
          onClick={() => navigateToOperationDash()}>
          <div className="fill-control-grid">
            <FiMonitor className="AiFillControl" />
          </div>
          <div className="operation-title-containers">
            <div className="equipment-titles">Monitoring</div>
            <div className="equipment-infos">
              Track the status and performance of tools
            </div>
          </div>
        </div>

        <div
          className="operation-mini-grid-container-grid"
          onClick={() => navigateToMan()}>
          <div className="fill-control-grid">
            <BsFillPersonLinesFill className="AiFillControl" />
          </div>
          <div className="operation-title-containers">
            <div className="equipment-titles">Manpower Info</div>
            <div className="equipment-infos">
              Manpower Information and Create Employee's Arbitrary
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfficialOperationDashboard;

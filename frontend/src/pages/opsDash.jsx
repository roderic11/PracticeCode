import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { AiFillControl, AiFillSignal, AiFillSliders } from "react-icons/ai";

import { FiArrowLeft } from "react-icons/fi";
import { MdPeople } from "react-icons/md";
import { FaTools, FaPeopleCarry, FaPeopleLine } from "react-icons/fa";

function OpsDash() {
  const { id, name, location, items, projectId } = useLocation().state || {};
  const navigate = useNavigate();
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  const navigateToEquipment = (order) => {
    navigate(`/equipment/${id}`, {
      state: {
        id: id,
        name: name,
        projectId: projectId,
        location: location,
        items: items,
      },
    });
  };
  const navigateToTools = (order) => {
    navigate(`/toolsMain/${id}`, {
      state: {
        id: id,
        name: name,
        projectId: projectId,
        location: location,
        items: items,
      },
    });
  };
  const navigateToMancost = (order) => {
    navigate(`/ManpowerCostMain/${projectId}/${id}`, {
      state: {
        id: id,
        name: name,
        projectId: projectId,
        location: location,
        items: items,
      },
    });
  };
  const navigateToProjectStat = (order) => {
    navigate(`/ProjectStatus/${projectId}/${id}/${name}`, {
      state: {
        id: id,
        name: name,
        projectId: projectId,
        location: location,
        items: items,
      },
    });
  };
  const navigateToaccomplish = (order) => {
    navigate(`/DailyAccomplish/${id} `, {
      state: {
        id: id,
        name: name,
        projectId: projectId,
        location: location,
        items: items,
      },
    });
  };

  const navigateToMrf = (order) => {
    navigate(`/MrfEng/${projectId}/${id} `, {
      state: {
        id: id,
        name: name,
        projectId: projectId,
        location: location,
        items: items,
      },
    });
  };
  const handleGoBack = () => {
    navigate(-1);
  };
  return (
    <div>
      {" "}
      <div className="container-admin">
        <section className="section-admin">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controller">
            Operation Main Dashboard: {name}
          </div>
        </section>
        <section className="section-back" onClick={() => handleGoBack()}>
          <FiArrowLeft />
          <div className="back">BACK</div>
        </section>
      </div>
      <div className="operation-mini-grid">
        <div
          className="operation-mini-grid-container"
          onClick={() => navigateToEquipment(purchaseOrders[0])}>
          <div className="fill-control">
            <AiFillControl className="AiFillControl" />
          </div>
          <div className="operation-title-container">
            <div className="equipment-title">
              Equipment Install and Monitoring
            </div>
            <div className="equipment-info">
              Track the status and performance of equipment
            </div>
          </div>
        </div>
        <div
          className="operation-mini-grid-container"
          onClick={() => navigateToTools(purchaseOrders[0])}>
          <div className="fill-control">
            <FaTools className="AiFillControl" />
          </div>
          <div className="operation-title-container">
            <div className="equipment-title">Tools Monitoring</div>
            <div className="equipment-info">
              Track the status and performance of tools
            </div>
          </div>
        </div>
        <div
          className="operation-mini-grid-container"
          onClick={() => navigateToMancost(purchaseOrders[0])}>
          <div className="fill-control">
            <FaPeopleCarry className="AiFillControl" />
          </div>
          <div className="operation-title-container">
            <div className="equipment-title">Manpower Cost</div>
            <div className="equipment-info">
              The expenses incurred by a company in relation to its workforce.
            </div>
          </div>
        </div>

        <div
          className="operation-mini-grid-container"
          onClick={() => navigateToProjectStat(purchaseOrders[0])}>
          <div className="fill-control">
            <AiFillSignal className="AiFillControl" />
          </div>
          <div className="operation-title-container">
            <div className="equipment-title">Project Status</div>
            <div className="equipment-info">
              Track the project status and performance of the project
            </div>
          </div>
        </div>
        <div
          className="operation-mini-grid-container"
          onClick={() => navigateToaccomplish(purchaseOrders[0])}>
          <div className="fill-control">
            <AiFillSliders className="AiFillControl" />
          </div>
          <div className="operation-title-container">
            <div className="equipment-title">Daily Costing Report</div>
            <div className="equipment-info">
              See the tasks, achievement and activities of the project daily
            </div>
          </div>
        </div>

        <div
          className="operation-mini-grid-container"
          onClick={() => navigateToMrf()}>
          <div className="fill-control">
            <MdPeople className="AiFillControl" />
          </div>

          <div className="operation-title-container">
            <div className="equipment-title">Material Request Form</div>
            <div className="equipment-info">
              Create material Request based on project materials
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OpsDash;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { AiFillControl, AiFillSignal, AiFillSliders } from "react-icons/ai";
import { RiAdminFill } from "react-icons/ri";
import { FiArrowLeft } from "react-icons/fi";
import { MdPeople } from "react-icons/md";
import { FaTools, FaPeopleCarry, FaPeopleLine } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

function AdminDash() {
  const { id, name, location, items, projectId } = useLocation().state || {};
  const navigate = useNavigate();

  const navigateToadminActivities = () => {
    navigate("/AdminActivities");
  };

  const NavigateToAdmin = () => {
    navigate(`/Admin`);
  };

  const NavigateToDashboard = () => {
    navigate(`/Dashboard`);
  };

  const handleGoBack = () => {
    // Use navigate(-1) to go back to the previous page in the history stack
    navigate(-1);
  };
  return (
    <div>
      {" "}
      <div className="container-admin">
        <section className="section-admin">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controller">Admin Panel</div>
        </section>
        <section className="section-back" onClick={() => handleGoBack()}>
          <FiArrowLeft />
          <div className="back">BACK</div>
        </section>
      </div>
      <div className="operation-mini-grid">
        <div
          className="operation-mini-grid-container"
          onClick={() => navigateToadminActivities()}>
          <div className="fill-control">
            <AiFillControl className="AiFillControl" />
          </div>
          <div className="operation-title-container">
            <div className="equipment-title">Admin Activity</div>
            <div className="equipment-info">
              Decline and Approve requests from the procurement side
            </div>
          </div>
        </div>
        <div
          className="operation-mini-grid-container"
          onClick={() => NavigateToAdmin()}>
          <div className="fill-control">
            <RiAdminFill className="AiFillControl" />
          </div>
          <div className="operation-title-container">
            <div className="equipment-title">Admin Controller</div>
            <div className="equipment-info">Roles of Admin</div>
          </div>
        </div>
        <div
          className="operation-mini-grid-container"
          onClick={() => NavigateToDashboard()}>
          <div className="fill-control">
            <MdDashboard className="AiFillControl" />
          </div>
          <div className="operation-title-container">
            <div className="equipment-title">Main Dashboard</div>
            <div className="equipment-info">
              This allows Access to the main dashboard of the system. Note that
              selected users specific to the admin role has access.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDash;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { AiFillControl, AiFillSignal, AiFillSliders } from "react-icons/ai";
import { GiPriceTag, GiChecklist, GiPulleyHook } from "react-icons/gi";
import { FiArrowLeft } from "react-icons/fi";
import { MdPeople } from "react-icons/md";
import {
  FaTools,
  FaPeopleCarry,
  FaPeopleLine,
  FaTruckMoving,
  FaBox,
} from "react-icons/fa";
import { BsCartCheckFill } from "react-icons/bs";

function ProcurementDash() {
  const navigate = useNavigate();
  //Back button
  const handleGoBack = () => {
    // Use navigate(-1) to go back to the previous page in the history stack
    navigate(-1);
  };

  const navigateToMrf = () => {
    navigate(`/Mrf `);
  };

  const navigateToPricing = () => {
    navigate(`/Pricing `);
  };

  const navigateToPurchaseOrder = () => {
    navigate(`/purchaseOrderMain `);
  };

  const navigateToLogistics = () => {
    navigate(`/Logistics `);
  };
  const navigateToSupplier = () => {
    navigate(`/supplier `);
  };
  const navigateInTrans = () => {
    navigate(`/sitetrans `);
  };

  return (
    <div>
      <div>
        {" "}
        <div className="container-admin">
          <section className="section-admin">
            <div className="side-line" />
            <div className="side-lines" />
            <div className="admin-controller">Procurement Dashboard</div>
          </section>
          <section className="section-back" onClick={handleGoBack}>
            <FiArrowLeft />
            <div className="back">BACK</div>
          </section>
        </div>
        <div className="operation-mini-grid">
          <div
            className="operation-mini-grid-container"
            onClick={() => navigateToMrf()}>
            <div className="fill-control">
              <GiChecklist className="AiFillControl" />
            </div>
            <div className="operation-title-container">
              <div className="equipment-title">Material Request Form</div>
              <div className="equipment-info">
                Fill up to complete and start the process of Procurement
              </div>
            </div>
          </div>

          <div
            className="operation-mini-grid-container"
            onClick={() => navigateToPricing()}>
            <div className="fill-control">
              <GiPriceTag className="AiFillControl" />
            </div>
            <div className="operation-title-container">
              <div className="equipment-title">Pricing</div>
              <div className="equipment-info">
                Price and procure the items based on it's value
              </div>
            </div>
          </div>

          <div
            className="operation-mini-grid-container"
            onClick={() => navigateToPurchaseOrder()}>
            <div className="fill-control">
              <BsCartCheckFill className="AiFillControl" />
            </div>

            <div className="operation-title-container">
              <div className="equipment-title">Purchase Order</div>
              <div className="equipment-info">
                Access approved pricing list in here
              </div>
            </div>
          </div>

          <div
            className="operation-mini-grid-container"
            onClick={() => navigateToLogistics()}>
            <div className="fill-control">
              <FaTruckMoving className="AiFillControl" />
            </div>
            <div className="operation-title-container">
              <div className="equipment-title">Logistics</div>
              <div className="equipment-info">
                Track the status and delivery of equipment
              </div>
            </div>
          </div>
          {/*Figure how will this workout*/}

          <div
            className="operation-mini-grid-container"
            onClick={() => navigateToSupplier()}>
            <div className="fill-control">
              <FaBox className="AiFillControl" />
            </div>

            <div className="operation-title-container">
              <div className="equipment-title">Supplier Management</div>
              <div className="equipment-info">
                See the suppliers and its offered price
              </div>
            </div>
          </div>

          <div
            className="operation-mini-grid-container"
            onClick={() => navigateInTrans()}>
            <div className="fill-control">
              <GiPulleyHook className="AiFillControl" />
            </div>

            <div className="operation-title-container">
              <div className="equipment-title">Site transaction</div>
              <div className="equipment-info">
                Transact items from site to site by checking out items.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProcurementDash;

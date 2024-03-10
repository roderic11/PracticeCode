import React from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Image from "./access-denied.png";
import "./inventory.css";
const AccessDeniedModal = () => {
  const navigate = useNavigate();
  const handleAdminPanelClick = () => {
    navigate("/");
  };
  return (
    <div className="modal">
      <div className="item-overlay1">
        <div className="access-denied-modal">
          <img src={Image} />
          <h2>Access Denied</h2>
          <p>You do not have access to this page.</p>
          <div className="modal-buttons1">
            <button
              onClick={handleAdminPanelClick}
              id="gg"
              type="button"
              className="access-btn"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AccessDeniedModal;

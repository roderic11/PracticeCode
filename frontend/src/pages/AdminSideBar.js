import React from "react";
import logo from "./building.png";
import { AiOutlineMenuUnfold } from "react-icons/ai";
import { MdSettings } from "react-icons/md";
import { BiGridAlt, BiSitemap } from "react-icons/bi";
import { BsPersonSquare } from "react-icons/bs";
import "./AdminSidebar.css";

function AdminSideBar() {
  return (
    <div className="sidebar">
      <a href="/" className="sidebar-link">
        <div className="img">
          <AiOutlineMenuUnfold className="sidebar-icon" />
        </div>
        <div>Menu</div>
      </a>
      <a href="/inventory" className="sidebar-link">
        <div className="img">
          <BsPersonSquare className="sidebar-icon" />
        </div>
        <div>Access Manager</div>
      </a>
      <a href="/AdminActivites" className="sidebar-link">
        <div className="img">
          <BiGridAlt className="sidebar-icon" />
        </div>
        <div>Activities</div>
      </a>
      <a href="/purchaseOrder" className="sidebar-link">
        <div className="img">
          <BiSitemap className="sidebar-icon" />
        </div>
        <div>Department</div>
      </a>
      <a href="/settings" className="sidebar-link">
        <div className="img">
          <MdSettings className="sidebar-icon" />
        </div>
        <div>Settings</div>
      </a>
    </div>
  );
}

export default AdminSideBar;

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaWarehouse } from "react-icons/fa";
import { RiUserSearchFill } from "react-icons/ri";
import { BsFillCartCheckFill, BsHouseDown } from "react-icons/bs";
import {
  AiFillControl,
  AiFillSignal,
  AiFillSlidersRiUserSearchFill,
} from "react-icons/ai";
import { FiArrowLeft } from "react-icons/fi";
import {
  MdMonitor,
  MdAdminPanelSettings,
  MdHealthAndSafety,
} from "react-icons/md";
import { FaTools, FaPeopleCarry, FaPeopleLine } from "react-icons/fa";
import Spinner from "../components/Spinner";
import "./DashDesign.css";

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { goals, isLoading, isError, message } = useSelector(
    (state) => state.goals
  );

  useEffect(() => {
    if (isError) {
      console.log(message);
    }

    if (!user) {
      navigate("/login");
    }

    return () => {};
  }, [user, navigate, isError, message, dispatch]);

  const handleInventoryClick = () => {
    navigate("/Inventory");
  };

  const handleProcurementClick = () => {
    navigate("/procurementDash");
  };

  const handleOperationsClick = () => {
    navigate("/officialOperationDash");
  };

  const handleAdminPanelClick = () => {
    navigate("/AdminDash");
  };

  const handleSiteTransClick = () => {
    navigate("/sitetrans");
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div>
      {" "}
      <div className="container-admins">
        <section className="section-admins">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controllers">Main Dashboard</div>
        </section>
        <section className="section-backs">
          <FiArrowLeft />
          <div className="back">BACK</div>
        </section>
      </div>
      <div className="operation-mini-grids">
        <div
          className="operation-mini-grid-container-grid"
          onClick={handleInventoryClick}>
          <div className="fill-control">
            <FaWarehouse className="AiFillControl" />
          </div>
          <div className="operation-title-containers">
            <div className="equipment-titles">Inventory</div>
            <div className="equipment-infos">
              Track the status and performance of equipment
            </div>
          </div>
        </div>

        <div
          className="operation-mini-grid-container-grid"
          onClick={handleProcurementClick}>
          <div className="fill-control-grid">
            <BsFillCartCheckFill className="AiFillControl" />
          </div>
          <div className="operation-title-containers">
            <div className="equipment-titles">Procurement</div>
            <div className="equipment-infos">
              External sourcing, supplier management, and quality assurance for
              operational needs.
            </div>
          </div>
        </div>

        <div
          className="operation-mini-grid-container-grid"
          onClick={handleOperationsClick}>
          <div className="fill-control-grid">
            <MdMonitor className="AiFillControl" />
          </div>
          <div className="operation-title-containers">
            <div className="equipment-titles">Operation</div>
            <div className="equipment-infos">
              Create Bill of the material, execution, and control of processes
              to efficiently produce goods and services.
            </div>
          </div>
        </div>

        <div
          className="operation-mini-grid-container-grid"
          onClick={handleAdminPanelClick}>
          <div className="fill-control-grid">
            <MdAdminPanelSettings className="AiFillControl" />
          </div>
          <div className="operation-title-containers">
            <div className="equipment-titles">Admin Panel</div>
            <div className="equipment-infos">
              Authorized users to manage and control various aspects of a
              system.
            </div>
          </div>
        </div>

        <div className="operation-mini-grid-container-grid">
          <div className="fill-control-grid">
            <RiUserSearchFill className="AiFillControl" />
          </div>
          <div className="operation-title-containers">
            <div className="equipment-titles">Human Resource</div>
            <div className="equipment-infos">
              Oversee organizational personnel through strategic planning,
              including recruitment and more.
            </div>
          </div>
        </div>

        <div className="operation-mini-grid-container-grid">
          <div className="fill-control-grid">
            <MdHealthAndSafety className="AiFillControl" />
          </div>
          <div className="operation-title-containers">
            <div className="equipment-titles">
              Environment Health and Safety
            </div>
            <div className="equipment-infos">
              Enforce policies for workplace safety, environmental
              responsibility, and employee well-being.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import React, { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import axios from "axios";
import { Suspense, lazy } from "react";

//-----------Dashboard imports-------

import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import AdminDash from "./pages/AdminDash";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Inventory from "./pages/Inventory";
import BOM from "./pages/BOM";
import ProcurementDash from "./pages/procurementDash";
import OpsDash from "./pages/opsDash";
import AccessDeniedModal from "./pages/AccessDenied";

//------Imports for procurement ----------------

import BOMDetails from "./pages/BOMDetails";
import PriceSide from "./pages/pricing-side";
import Pricing from "./pages/Pricing";
import PriceStatus from "./pages/PriceStatus";
import PriceView from "./pages/PriceView";
import Supplier from "./pages/supplier";
import Logistics from "./pages/Logistics";
import LogisticsQR from "./pages/logisticsQR";
import PurchaseOrderMain from "./pages/purchaseOrderMain";
import PurchaseOrders from "./pages/purchaseOrders";
import DeliveryTracker from "./pages/deliveryTracker";
import Sitetrans from "./pages/sitetrans";
import LogisticsInTrans from "./pages/LogisticsIn-trans";
import LogisticsReceive from "./pages/Logistics-Receive";
import UpdateStorage from "./pages/updateStorage";
import MaterialRequestForm from "./pages/Mrf";

//---------For the admin side imports-----------

import Admin from "./pages/Admin";
import AdminActivities from "./pages/AdminActivities";
import AdminActivitiesSide from "./pages/AdminActivitiesSide";
import AdminActivitiesDetails from "./pages/AdminActivitiesDetails";
import FormInputs from "./pages/FormInputs";

//-------For the operations importd ----------------

import EquipmentsInstalled from "./pages/equipment";
import OperationDashboard from "./pages/operationDashboard";
import OfficialOperationDash from "./pages/officialOperationDash";
import ProductDelivery from "./pages/productDelivery";
import ToolsMain from "./pages/toolsMain";
import DailyAccomplish from "./pages/DailyAccomplish";
import ProjectStatus from "./pages/ProjectStatus";
import DeliveryTrackerOperation from "./pages/DeliveryTrackerOperation";
import ManpowerInfo from "./pages/ManpowerInfo";
import ManpowerCostMain from "./pages/ManpowerCostMain";
import MaterialRequestOps from "./pages/MrfEng";
import ProductPullout from "./pages/productPullout";
import MainWarehouse from "./pages/MainWarehouse";

//---------- apps and logics -------------------

const Spinner = () => {
  return (
    <div className="loadingSpinnerContainer">
      <div className="loadingSpinner"></div>
    </div>
  );
};

const App = () => {
  const [userRoles, setUserRoles] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    // Simulate an asynchronous operation that takes time to complete
    setTimeout(() => {
      setIsAppLoading(false);
    }, 2000); // Replace 2000 with the actual time it takes to load your app data
  }, []);

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const response = await axios.get(`/api/users/getUser/${user._id}`);
        const { data } = response;
        const roles = data.roles;
        setUserRoles(roles);
        console.log("User Roles:", roles);
      } catch (error) {
        console.error("Error fetching user roles:", error);
      }
    };

    if (user && user._id) {
      fetchUserRoles();
    }
  }, [user]);

  if (isAppLoading) {
    // Show the loading spinner while the app is loading
    return <Spinner />;
  }

  return (
    <>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          {userRoles.includes("Procurement") && (
            <>
              <Route path="/procurementDash" element={<ProcurementDash />} />
              <Route exact path="/pricing" element={<Pricing />} />
              <Route exact path="/pricing-side" element={<PriceSide />} />
              <Route exact path="/PriceStatus/:id" element={<PriceStatus />} />
              <Route exact path="/PriceView/:id" element={<PriceView />} />
              <Route exact path="/supplier" element={<Supplier />} />
              <Route exact path="/Logistics" element={<Logistics />} />
              <Route path="/Mrf" element={<MaterialRequestForm />} />
              <Route path="/sitetrans" element={<Sitetrans />} />
              <Route
                path="/purchaseOrderMain"
                element={<PurchaseOrderMain />}
              />
              <Route path="/purchaseOrders" element={<PurchaseOrders />} />
              <Route path="/deliveryTracker" element={<DeliveryTracker />} />
              <Route path="/AdminDash" element={<AdminDash />} />
              <Route path="/productDelivery" element={<ProductDelivery />} />
              <Route path="/sitetrans" element={<Sitetrans />} />
              <Route
                path="/purchaseOrderMain"
                element={<PurchaseOrderMain />}
              />
              <Route path="/purchaseOrders" element={<PurchaseOrders />} />
              <Route path="/FormInputs" element={<FormInputs />} />
              <Route path="/productPullout" element={<ProductPullout />} />
              <Route path="/MainWarehouse" element={<MainWarehouse />} />
            </>
          )}
          {userRoles.includes("Logistic") && (
            <>
              <Route path="/procurementDash" element={<ProcurementDash />} />
              <Route exact path="/Logistics" element={<Logistics />} />
              <Route
                path="/purchaseOrderMain"
                element={<PurchaseOrderMain />}
              />
              <Route path="/purchaseOrders" element={<PurchaseOrders />} />
              <Route path="/deliveryTracker" element={<DeliveryTracker />} />
              <Route path="/productDelivery" element={<ProductDelivery />} />
              <Route
                path="/purchaseOrderMain"
                element={<PurchaseOrderMain />}
              />
              <Route path="/purchaseOrders" element={<PurchaseOrders />} />
              <Route path="/FormInputs" element={<FormInputs />} />
              <Route path="/Logistics-Receive" element={<LogisticsReceive />} />
              <Route path="/LogisticsIn-trans" element={<LogisticsInTrans />} />
              <Route path="/productPullout" element={<ProductPullout />} />
            </>
          )}
          {userRoles.includes("Foreman") && (
            <>
              <Route path="/Logistics-Receive" element={<LogisticsReceive />} />
            </>
          )}
          {userRoles.includes("Warehouseman") && (
            <>
              <Route path="/Inventory" element={<Inventory />} />
              <Route path="/updateStorage" element={<UpdateStorage />} />
              <Route path="/Logistics-Receive" element={<LogisticsReceive />} />
              <Route path="/LogisticsIn-trans" element={<LogisticsInTrans />} />
              <Route path="/siteTrans" element={<Sitetrans />} />
              <Route path="/productPullout" element={<ProductPullout />} />
              <Route path="/MainWarehouse" element={<MainWarehouse />} />
            </>
          )}
          {userRoles.includes("Inventory Head") && (
            <>
              <Route path="/Inventory" element={<Inventory />} />
              <Route path="/updateStorage" element={<UpdateStorage />} />
              <Route path="/Logistics-Receive" element={<LogisticsReceive />} />
              <Route path="/LogisticsIn-trans" element={<LogisticsInTrans />} />
              <Route path="/siteTrans" element={<Sitetrans />} />
              <Route path="/procurementDash" element={<ProcurementDash />} />
              <Route
                path="/purchaseOrderMain"
                element={<PurchaseOrderMain />}
              />
              <Route path="/deliveryTracker" element={<DeliveryTracker />} />
              <Route exact path="/supplier" element={<Supplier />} />
              <Route path="/productDelivery" element={<ProductDelivery />} />
              <Route path="/productPullout" element={<ProductPullout />} />
              <Route path="/MainWarehouse" element={<MainWarehouse />} />
            </>
          )}

          {userRoles.includes("Operation") && (
            <>
              <Route
                path="/officialOperationDash"
                element={<OfficialOperationDash />}
              />
              <Route path="/BOM" element={<BOM />} />
              <Route
                exact
                path="/BOMDetails/:id/:name"
                element={<BOMDetails />}
              />
              <Route
                path="/operationDashboard"
                element={<OperationDashboard />}
              />
              <Route path="/toolsMain/:id" element={<ToolsMain />} />
              <Route path="/equipment/:id" element={<EquipmentsInstalled />} />
              <Route
                exact
                path="/ManpowerCostMain/:projectId/:id"
                element={<ManpowerCostMain />}
              />
              <Route
                path="/DailyAccomplish/:id"
                element={<DailyAccomplish />}
              />
              <Route
                path="/ProjectStatus/:id/:projectId/:name"
                element={<ProjectStatus />}
              />
              <Route
                exact
                path="/DeliveryTrackerOperation"
                element={<DeliveryTrackerOperation />}
              />
              <Route path="/manpowerInfo" element={<ManpowerInfo />} />
              <Route
                path="/MrfEng/:projectId/:id"
                element={<MaterialRequestOps />}
              />
              <Route path="/opsDash/:id" element={<OpsDash />} />
            </>
          )}
          {userRoles.includes("Site Engineer") && (
            <>
              <Route
                path="/officialOperationDash"
                element={<OfficialOperationDash />}
              />

              <Route
                path="/operationDashboard"
                element={<OperationDashboard />}
              />
              <Route path="/toolsMain/:id" element={<ToolsMain />} />
              <Route path="/equipment/:id" element={<EquipmentsInstalled />} />
              <Route
                exact
                path="/ManpowerCostMain/:projectId/:id"
                element={<ManpowerCostMain />}
              />
              <Route
                exact
                path="/DeliveryTrackerOperation"
                element={<DeliveryTrackerOperation />}
              />
              <Route
                path="/MrfEng/:projectId/:id"
                element={<MaterialRequestOps />}
              />
              <Route path="/opsDash/:id" element={<OpsDash />} />
              <Route
                path="/DailyAccomplish/:id"
                element={<DailyAccomplish />}
              />
            </>
          )}
          {userRoles.includes("Admin") && (
            <>
              {/*Dashboards*/}
              <Route path="/AdminDash" element={<AdminDash />} />
              <Route path="/procurementDash" element={<ProcurementDash />} />
              <Route
                path="/officialOperationDash"
                element={<OfficialOperationDash />}
              />
              <Route path="/Dashboard" element={<Dashboard />} />
              <Route path="/opsDash/:id" element={<OpsDash />} />
              <Route
                path="/operationDashboard"
                element={<OperationDashboard />}
              />

              {/*Admin Part*/}

              <Route path="/AdminActivities" element={<AdminActivities />} />
              <Route path="/details/:id" element={<AdminActivitiesDetails />} />
              <Route path="/Admin" element={<Admin />} />

              {/*Procurement part*/}

              <Route exact path="/pricing" element={<Pricing />} />
              <Route exact path="/pricing-side" element={<PriceSide />} />
              <Route exact path="/PriceStatus/:id" element={<PriceStatus />} />
              <Route exact path="/PriceView/:id" element={<PriceView />} />
              <Route exact path="/supplier" element={<Supplier />} />
              <Route exact path="/Logistics" element={<Logistics />} />
              <Route path="/Mrf" element={<MaterialRequestForm />} />
              <Route path="/sitetrans" element={<Sitetrans />} />
              <Route
                path="/purchaseOrderMain"
                element={<PurchaseOrderMain />}
              />
              <Route path="/purchaseOrders" element={<PurchaseOrders />} />
              <Route path="/deliveryTracker" element={<DeliveryTracker />} />
              <Route path="/sitetrans" element={<Sitetrans />} />
              <Route path="/FormInputs" element={<FormInputs />} />
              <Route path="/productDelivery" element={<ProductDelivery />} />
              <Route path="/productPullout" element={<ProductPullout />} />

              {/*Operations Part*/}
              <Route path="/BOM" element={<BOM />} />
              <Route
                exact
                path="/BOMDetails/:id/:name"
                element={<BOMDetails />}
              />
              <Route path="/toolsMain/:id" element={<ToolsMain />} />
              <Route path="/equipment/:id" element={<EquipmentsInstalled />} />
              <Route
                exact
                path="/ManpowerCostMain/:projectId/:id"
                element={<ManpowerCostMain />}
              />
              <Route
                path="/DailyAccomplish/:id"
                element={<DailyAccomplish />}
              />
              <Route
                path="/ProjectStatus/:id/:projectId/:name"
                element={<ProjectStatus />}
              />
              <Route
                exact
                path="/DeliveryTrackerOperation"
                element={<DeliveryTrackerOperation />}
              />
              <Route path="/manpowerInfo" element={<ManpowerInfo />} />
              <Route
                path="/MrfEng/:projectId/:id"
                element={<MaterialRequestOps />}
              />

              {/*Warehouse Access*/}
              <Route path="/Inventory" element={<Inventory />} />
              <Route path="/updateStorage" element={<UpdateStorage />} />
              <Route path="/Logistics-Receive" element={<LogisticsReceive />} />
              <Route path="/LogisticsIn-trans" element={<LogisticsInTrans />} />
              <Route path="/siteTrans" element={<Sitetrans />} />
              <Route path="/MainWarehouse" element={<MainWarehouse />} />
            </>
          )}

          {/* Add more user roles and their respective routes as needed */}

          <Route path="*" element={<AccessDeniedModal />} />
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
};

export default App;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BsCheck2Circle } from "react-icons/bs";
import { MdLocationPin } from "react-icons/md";
import { Pagination } from "@mui/material";
import { toast } from "react-toastify";
import { FiArrowLeft } from "react-icons/fi";
import "./PurchaseOrder.css";

function PurchaseOrderMain() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [deliveryTrackingNumbers, setDeliveryTrackingNumbers] = useState([]);
  const [page, setPage] = useState(1); // Current page number
  const itemsPerPage = 12; // Number of items to show per page
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  useEffect(() => {
    fetchData();
    fetchDeliveryData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("/api/comments/comment");
      const data = response.data;
      const approvedPurchaseOrders = data.filter((order) =>
        order.remarks.toLowerCase().includes("approve")
      );
      setPurchaseOrders(approvedPurchaseOrders);

      const totalPages = Math.ceil(
        approvedPurchaseOrders.length / itemsPerPage
      );
      setPage(1);
      setTotalPages(totalPages);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchDeliveryData = async () => {
    try {
      const response = await axios.get("/api/deliveries");
      const data = response.data;

      // Sort the deliveries based on the createdAt property
      const sortedDeliveries = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      const deliveries = sortedDeliveries.map((delivery) => ({
        id: delivery._id,
        trackingNumber: delivery.trackingNumber,
        tableData: delivery.tableData,
        title: delivery.title,
        view: delivery.view,
      }));

      setDeliveryTrackingNumbers(deliveries);
      console.log("Data Delivery: ", deliveries);
    } catch (error) {
      console.error("Error fetching delivery data:", error);
    }
  };

  const navigateToPurchaseOrder = (order) => {
    navigate("/purchaseOrders", {
      state: {
        id: order._id,
        title: order.title,
        remarks: order.remarks,
        date: order.date,
        time: order.time,
        location: order.location,
        dateNeeded: order.dateNeeded,
        dateRequested: order.dateRequested,
        targetDelivery: order.targetDelivery,
        tableData: order.tableData,
      },
    });
  };

  const navigateToDeliveryTracker = async (delivery, id) => {
    try {
      await axios.put(`api/deliveries/view/${id}`, {
        view: "Viewed",
      });
      navigate("/deliveryTracker", {
        state: delivery,
      });
    } catch (error) {
      toast.error("An error occured");
      console.log("You have encountered an error", error);
    }
  };
  const filteredTrackingNumbers = deliveryTrackingNumbers.filter((delivery) =>
    delivery.trackingNumber.includes(searchTerm)
  );

  const handleGoBack = () => {
    // Use navigate(-1) to go back to the previous page in the history stack
    navigate(-1);
  };

  return (
    <div>
      <div className="container-admin">
        <section className="section-admin">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controller">Purchase Order Dashboard</div>
        </section>
        <section className="section-back" onClick={handleGoBack}>
          <FiArrowLeft />
          <div className="back">BACK</div>
        </section>
      </div>
      <div className="purchase-order-main">
        <div className="purchase-order-submain">
          <div className="purchase-box-container">
            <div className="purchase-order-side-container">
              <div>Delivery Status</div>
              <div className="tracking-numbers-purchase">
                <b>Tracking Numbers:</b>
              </div>
              <input
                type="text"
                placeholder="Search Tracking Number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-track"
              />
              <div className="tracking-numbers-container">
                <div className="tracking-numbers-container-margin">
                  {filteredTrackingNumbers.map((delivery) => {
                    const { trackingNumber, id, view } = delivery;
                    const showNotificationCircle = !view || view !== "Viewed";

                    return (
                      <div
                        key={trackingNumber}
                        className="trackingNum"
                        onClick={() => navigateToDeliveryTracker(delivery, id)}>
                        <MdLocationPin className="location-pin-po" />
                        {trackingNumber}
                        {showNotificationCircle && (
                          <div className="notif-circle"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div>
              <div className="paginating-purchase">
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(event, value) => setPage(value)}
                  sx={{ justifyContent: "center", mt: 2 }}
                />
              </div>
              <div className="purchase-order-submain2">
                {purchaseOrders
                  .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                  .map((order) => {
                    const table = order.tableData;
                    console.log("TABLE: ", table);

                    const nonCheckedChangesCount = table.some(
                      (purchase) => purchase.changes === "Checked"
                    );
                    const everyCheckedChangesCount = table.every(
                      (purchase) => purchase.changes === "Checked"
                    );
                    return (
                      <div
                        key={order.id}
                        className="purchase-container"
                        onClick={() => navigateToPurchaseOrder(order)}>
                        <div className="title-purchase-with-check">
                          <b>{order.remarks}</b>{" "}
                          <BsCheck2Circle className="check-purchase" />{" "}
                        </div>
                        <div className="title-purchase">
                          Title: {order.title}
                        </div>
                        <div className="title-purchase">Date: {order.date}</div>
                        <div className="title-purchase">Time: {order.time}</div>
                        {nonCheckedChangesCount ? (
                          everyCheckedChangesCount ? (
                            <div></div>
                          ) : (
                            <div className="circle-notification-view-approved"></div>
                          )
                        ) : (
                          <div></div>
                        )}
                      </div>
                    );
                  })
                  .reverse()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PurchaseOrderMain;

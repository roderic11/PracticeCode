import React, { useState, useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { FaBox, FaShippingFast, FaCheckCircle } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Modal,
  Fade,
  Typography,
} from "@mui/material";
import "./PurchaseOrder.css";
const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options);
};
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1200,
  bgcolor: "background.paper",
  borderRadius: "10px",
  boxShadow: 24,
  padding: "20px",
  backgroundColor: "#f4f4f4",
};

function DeliveryTrackerOperation() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const location = useLocation();
  const { trackingNumber, tableData, id, title } = location.state || {};

  useEffect(() => {
    setItems(tableData || []);
  }, [tableData]);

  const getStatusIcon = (status) => {
    if (status === "Pick up") {
      return <FaBox className="icon-delivery" />;
    } else if (status === "In Transit") {
      return <FaShippingFast className="icon-delivery" />;
    } else if (status === "In transit") {
      return <FaShippingFast className="icon-delivery" />;
    } else if (status === "Received") {
      return <FaCheckCircle className="icon-delivery" />;
    }
    return null;
  };

  const getStatusText = (status) => {
    if (status === "Pick up") {
      return "Pickup";
    } else if (status === "In Transit") {
      return "In Transit";
    } else if (status === "In transit") {
      return "In Transit";
    } else if (status === "Received") {
      return "Received";
    }
    return "";
  };

  const sortedItems = [...items].sort((a, b) => {
    if (a.status === "Pick up") return -1;
    if (b.status === "Pick up") return 1;
    if (a.status === "In Transit") return -1;
    if (b.status === "In Transit") return 1;
    if (a.status === "Received") return 1;
    if (b.status === "Received") return -1;
    return 0;
  });

  // Find the location from Pick up status
  const pickUpLocation = sortedItems.find(
    (item) => item.status === "Pick up"
  )?.location;

  // Find the comment from Pick up status
  const commentLocation = sortedItems.find(
    (item) => item.status === "Pick up"
  )?.comment;

  // Find the comment from Received status
  const rcommentLocation = sortedItems.find(
    (item) => item.status === "Received"
  )?.comment;

  // Find the comment from In Transit status
  const inTransitLocation = sortedItems.find(
    (item) => item.status === "In Transit"
  )?.comment;
  // Find the required information from Received status
  const receivedLocation = sortedItems.find(
    (item) => item.status === "Received"
  )?.location;
  const receivedName = sortedItems.find(
    (item) => item.status === "Received"
  )?.name;
  const receivedDate = sortedItems.find(
    (item) => item.status === "Received"
  )?.date;
  const receivedTime = sortedItems.find(
    (item) => item.status === "Received"
  )?.time;
  const receivedStatus = sortedItems.find(
    (item) => item.status === "Received"
  )?.status;

  // Find the table from Pick up status
  const pickUpTable = sortedItems.find(
    (item) => item.status === "Pick up"
  )?.transactionTable;
  // Find the table from In Transit status
  const inTransitTable = sortedItems.find(
    (item) => item.status === "In Transit"
  )?.transactionTable;
  // Find the table from Received status
  const receivedTable = sortedItems.find(
    (item) => item.status === "Received"
  )?.transactionTable;

  const handleRowClick = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setModalOpen(false);
  };
  const handleGoBack = () => {
    window.history.back();
  };
  return (
    <div>
      <div className="container-admin">
        <section className="section-admin">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controller">Delivery Status</div>
        </section>
        <section className="section-back" onClick={handleGoBack}>
          <FiArrowLeft />
          <div className="back">BACK</div>
        </section>
      </div>
      <div className="delivery-container-main">
        <div className="delivery-container">
          {sortedItems.map((item, index) => (
            <div key={index} className={`delivery-container-${index + 1}`}>
              {item.status === "In Transit" && <div className="line-green" />}
              {item.status === "In transit" && <div className="line-green" />}
              <div className="circle-green">{getStatusIcon(item.status)}</div>
              <div className="pickup">{getStatusText(item.status)}</div>
              {item.status === "Received" && <div className="line-green" />}
            </div>
          ))}
        </div>
        <div className="travel-history-container">
          <div className="delivery-progress-rep">
            DELIVERY PROGRESS REPORT FOR {title}
          </div>

          <div className="travel-history-sub-container">
            <div className="travel-history-sub-container">
              <div>
                <TableContainer style={{ width: "100%" }} component={Paper}>
                  <div className="click-ops">
                    Click each row to see the transacted items
                  </div>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <b>Status</b>
                        </TableCell>
                        <TableCell>
                          <b>Name</b>
                        </TableCell>
                        <TableCell>
                          <b>Location</b>
                        </TableCell>
                        <TableCell>
                          <b>Date</b>
                        </TableCell>
                        <TableCell>
                          <b>Time</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedItems.map((item) => (
                        <TableRow
                          key={item.id}
                          hover
                          onClick={() => handleRowClick(item)}>
                          <TableCell>{item.status}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.location}</TableCell>
                          <TableCell>{item.date}</TableCell>
                          <TableCell>{item.time}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
              <div className="delivery-status-main-container">
                <div className="delivery-status-text">Status</div>
                <div className="delivery-received-box">
                  <div className="delivery-received">{receivedStatus}</div>
                  <div className="date-time-delivered">
                    {formatDate(receivedDate)} at {receivedTime}
                  </div>
                </div>
                <div className="project-delivered-box">
                  <div className="project-name-delivered">Project Name :</div>
                  <div className="project-name-delivered">{title}</div>
                </div>
                <div className="project-delivered-box">
                  <div className="project-name-delivered">Received by :</div>
                  <div className="project-name-delivered">{receivedName}</div>
                </div>
                <div className="tracking-delivery-container">
                  <div className="tracking-title">Tracking Number: </div>
                  <div className="tracking-value">{trackingNumber}</div>
                </div>
                <div className="delivered-where-box">
                  <div className="where">From: {pickUpLocation}</div>
                  <div className="where">To: {receivedLocation}</div>
                </div>
              </div>
            </div>
            <div>
              <Modal open={modalOpen} onClose={handleCloseModal}>
                <Fade in={modalOpen}>
                  <Box sx={modalStyle}>
                    {selectedItem?.status === "Pick up" && (
                      <div>
                        <Typography variant="h5" mb={2}>
                          PICK UP ITEMS
                        </Typography>
                        <Typography variant="h7" mb={3}>
                          <b>Comment: </b>
                          {commentLocation}
                        </Typography>
                        <TableContainer
                          style={{ width: "100%" }}
                          component={Paper}>
                          <div
                            style={{
                              maxHeight: `${rowsPerPage * 53}px`,
                              overflow: "auto",
                            }}>
                            <Table size="small" aria-label="a dense table">
                              <TableHead style={{ position: "sticky", top: 0 }}>
                                <TableRow>
                                  <TableCell>
                                    <b>Item Name</b>
                                  </TableCell>
                                  <TableCell>
                                    <b>Unit</b>
                                  </TableCell>
                                  <TableCell>
                                    <b>Quantity</b>
                                  </TableCell>
                                  <TableCell>
                                    <b>Unit Cost</b>
                                  </TableCell>
                                  <TableCell>
                                    <b>Material Cost</b>
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {pickUpTable?.map((transaction) => (
                                  <TableRow key={transaction.id}>
                                    <TableCell>
                                      {transaction.itemName}
                                    </TableCell>
                                    <TableCell>{transaction.unit}</TableCell>
                                    <TableCell>
                                      {transaction.quantity}
                                    </TableCell>
                                    <TableCell>
                                      {transaction.unitCost}
                                    </TableCell>
                                    <TableCell>
                                      {transaction.materialCost}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableContainer>
                      </div>
                    )}

                    {selectedItem?.status === "Received" && (
                      <div>
                        <Typography variant="h5" mb={2}>
                          RECIEVED ITEMS
                        </Typography>
                        <Typography variant="h7" mb={2}>
                          <b>Comment: </b> {rcommentLocation}
                        </Typography>
                        <TableContainer
                          style={{ width: "100%" }}
                          component={Paper}>
                          <div
                            style={{
                              maxHeight: `${rowsPerPage * 53}px`,
                              overflow: "auto",
                            }}>
                            <Table size="small" aria-label="a dense table">
                              <TableHead style={{ position: "sticky", top: 0 }}>
                                <TableRow>
                                  <TableCell>
                                    <b>Item Name</b>
                                  </TableCell>
                                  <TableCell>
                                    <b>Unit</b>
                                  </TableCell>
                                  <TableCell>
                                    <b>Quantity</b>
                                  </TableCell>
                                  <TableCell>
                                    <b>Unit Cost</b>
                                  </TableCell>
                                  <TableCell>
                                    <b>Material Cost</b>
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {receivedTable?.map((transaction) => (
                                  <TableRow key={transaction.id}>
                                    <TableCell>
                                      {transaction.itemName}
                                    </TableCell>
                                    <TableCell>{transaction.unit}</TableCell>
                                    <TableCell>
                                      {transaction.quantity}
                                    </TableCell>
                                    <TableCell>
                                      {transaction.unitCost}
                                    </TableCell>
                                    <TableCell>
                                      {transaction.materialCost}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableContainer>
                      </div>
                    )}

                    {selectedItem?.status === "In Transit" && (
                      <div>
                        <Typography variant="h5" mb={2}>
                          IN TRANSIT ITEMS
                        </Typography>
                        <Typography variant="h7" mb={3}>
                          <b>Comment: </b>
                          {inTransitLocation}
                        </Typography>
                        <TableContainer
                          style={{ width: "100%" }}
                          component={Paper}>
                          <div
                            style={{
                              maxHeight: `${rowsPerPage * 53}px`,
                              overflow: "auto",
                            }}>
                            <Table size="small" aria-label="a dense table">
                              <TableHead style={{ position: "sticky", top: 0 }}>
                                <TableRow>
                                  <TableCell>
                                    <b>Item Name</b>
                                  </TableCell>
                                  <TableCell>
                                    <b>Unit</b>
                                  </TableCell>
                                  <TableCell>
                                    <b>Quantity</b>
                                  </TableCell>
                                  <TableCell>
                                    <b>Unit Cost</b>
                                  </TableCell>
                                  <TableCell>
                                    <b>Material Cost</b>
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {inTransitTable?.map((transaction) => (
                                  <TableRow key={transaction.id}>
                                    <TableCell>
                                      {transaction.itemName}
                                    </TableCell>
                                    <TableCell>{transaction.unit}</TableCell>
                                    <TableCell>
                                      {transaction.quantity}
                                    </TableCell>
                                    <TableCell>
                                      {transaction.unitCost}
                                    </TableCell>
                                    <TableCell>
                                      {transaction.materialCost}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableContainer>
                      </div>
                    )}
                  </Box>
                </Fade>
              </Modal>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeliveryTrackerOperation;

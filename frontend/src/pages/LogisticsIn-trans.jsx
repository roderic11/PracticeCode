import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiArrowLeft } from "react-icons/fi";
import { useSelector } from "react-redux";
import axios from "axios";
import QRCode from "qrcode.react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import "./PurchaseOrder.css";

function LogisticsInTrans() {
  const { user } = useSelector((state) => state.auth);
  const routeLocation = useLocation();
  const [selectedItems, setSelectedItems] = useState([]);
  const [trackingNumbers, setTrackingNumbers] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [name, setName] = useState(user.name);
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [status, setStatus] = useState("");
  const [tableData, setTableData] = useState([]);
  const qrCodeRef = useRef();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showQRCode, setShowQRCode] = useState(false);
  const navigate = useNavigate();
  const [generateButtonVisible, setGenerateButtonVisible] = useState(true);
  const [selectedTransactionItems, setSelectedTransactionItems] = useState([]);
  const [inTransData, setSelectedInTransData] = useState([]);
  const [comments, setComments] = useState("");

  useEffect(() => {
    const queryParams = new URLSearchParams(routeLocation.search);
    const qrCodeData = queryParams.get("data");

    if (qrCodeData) {
      const data = JSON.parse(decodeURIComponent(qrCodeData));
      setTrackingNumbers(data.link.split("/").pop());
      setTableData(data.tableData || []);
      setTitle(data.title);
      setPlace(data.place);
      setTrackingNumber(data.trackingNumber);
    }
  }, [routeLocation.search]);

  useEffect(() => {
    if (qrCodeRef.current && tableData.length > 0) {
      const qrCodeData = {
        trackingNumbers,
        tableData,
        title,
        place,
        trackingNumber,
      };
      const qrCodeString = JSON.stringify(qrCodeData);
      qrCodeRef.current.makeCode(generateQRCodeWithLink(qrCodeString));
    }
  }, [tableData, trackingNumbers, title, place, trackingNumber]);

  useEffect(() => {
    if (trackingNumbers) {
      axios
        .get(`/api/deliveries/${trackingNumbers}`)
        .then((response) => {
          const { data } = response;

          const filteredItems =
            data && data.tableData
              ? data.tableData.filter((item) => item.status === "Pick up")
              : [];

          setSelectedItems(filteredItems);
          console.log("Transaction Table of Pick up:", filteredItems);
        })
        .catch((error) => {
          console.error("Error fetching delivery data:", error);
        });
    }
  }, [trackingNumbers]);

  const InTransitData = () => {
    if (trackingNumbers) {
      axios
        .get(`/api/deliveries/${trackingNumbers}`)
        .then((response) => {
          const { data } = response;

          const filteredItems = data.tableData.filter(
            (item) => item.status === "In Transit"
          );
          setSelectedInTransData(filteredItems);
          console.log("Transaction Table of Items:", filteredItems);
        })
        .catch((error) => {
          console.error("Error fetching delivery data:", error);
        });
    }
  };

  useEffect(() => {
    InTransitData();
  }, [trackingNumbers]);

  useEffect(() => {
    // Check if the generate button should be hidden based on the stored visibility state
    const isVisible = localStorage.getItem(
      `generateButtonVisible_${trackingNumbers}`
    );
    if (isVisible === "false") {
      setGenerateButtonVisible(false);
    }

    // Retrieve the QR code data from localStorage
    const storedQRCodeData = localStorage.getItem(
      `qrCodeData_${trackingNumbers}`
    );
    if (storedQRCodeData) {
      const parsedData = JSON.parse(storedQRCodeData);
      setTableData(parsedData.tableData);
      setShowQRCode(true);
    }
  }, [trackingNumbers]);

  useEffect(() => {
    // Save the QR code data to localStorage
    if (tableData.length > 0) {
      const qrCodeData = {
        tableData,
        trackingNumber,
        place,
        title,
      };
      const qrCodeString = JSON.stringify(qrCodeData);
      localStorage.setItem(`qrCodeData_${trackingNumbers}`, qrCodeString);
    }
  }, [tableData, trackingNumbers, trackingNumber, place, title]);

  const updateTableData = async () => {
    try {
      const currentDate = getCurrentDate();
      const currentTime = getCurrentTime();
      const currentTrackingNumbers = trackingNumbers;

      /*const pickupTable = selectedItems
        .filter((item) => item.status === "Pick up")
        .flatMap((item) =>
          item.transactionTable.map((transaction) => ({
            ItemName: transaction.ItemName,
            quantity: transaction.quantity,
            unit: transaction.unit,
            supplier: transaction.supplier,
            unitCost: transaction.unitCost,
            materialCost: transaction.materialCost,
          }))
        );*/

      const transactionData = selectedTransactionItems.map((transaction) => ({
        ItemName: transaction.ItemName,
        category: transaction.category,
        quantity: transaction.quantity,
        unit: transaction.unit,
        supplier: transaction.supplier,
        unitCost: transaction.unitCost,
        materialCost: transaction.materialCost,
      }));

      const updatedData = {
        id: currentTrackingNumbers,
        status: "In Transit",
        name,
        date: currentDate,
        time: currentTime,
        location: deliveryLocation,
        comment: comments,
        transactionTable: transactionData,
      };

      console.log(
        "updatedData.transactionTable:",
        updatedData.transactionTable
      );

      const rowIndex = tableData.findIndex(
        (data) => data.id === currentTrackingNumbers
      );

      if (rowIndex !== -1) {
        const updatedTableData = [...tableData];
        updatedTableData[rowIndex] = {
          ...updatedTableData[rowIndex],
          status: updatedData.status,
          name: updatedData.name,
          date: updatedData.date,
          time: updatedData.time,
          location: updatedData.location,
          comment: updatedData.comment,
          transactionTable: updatedData.transactionTable,
        };
        setTableData(updatedTableData);
      } else {
        setTableData([...tableData, updatedData]);
      }

      await axios.put(
        `/api/deliveries/${currentTrackingNumbers}/status`,
        updatedData
      );
      toast.success("The items are in transit now!");
      setName("");
      setDeliveryLocation("");
      setShowQRCode(true);
      setGenerateButtonVisible(false);
      // Store the visibility state of the generate button in local storage
      localStorage.setItem(`generateButtonVisible_${trackingNumbers}`, false);
    } catch (error) {
      console.error("Error updating table data:", error);
      toast.error("Error updating table data:", error);
    }
  };

  const getCurrentDate = () => {
    const currentDate = new Date().toLocaleDateString("en-US");
    return currentDate;
  };

  const getCurrentTime = () => {
    const currentTime = new Date().toLocaleTimeString("en-US");
    return currentTime;
  };

  const handleSaveData = () => {
    if (!name || !deliveryLocation || !comments) {
      toast.error("Please enter logistic personnel, plate number and comment.");
      return;
    }

    if (selectedTransactionItems.length === 0) {
      toast.error("Please select at least one item.");
      return;
    }

    if (inTransData.some((item) => item.status === "In Transit")) {
      toast.error("These items are already In Transit.");
      return;
    }
    setStatus("In Transit");
    updateTableData();
  };
  const handleSaveConfirmation = () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to transit these items?"
    );

    if (isConfirmed) {
      handleSaveData();
    }
  };
  const generateQRCodeWithLink = (data) => {
    const encodedData = encodeURIComponent(JSON.stringify(data));
    const baseURL = window.location.origin;
    return `${baseURL}/Logistics-Receive/?data=${encodedData}`;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleChange = (e, itemIndex, transactionIndex) => {
    const checked = e.target.checked;

    if (checked) {
      const selectedItem = selectedItems[itemIndex];
      const selectedTransaction =
        selectedItem.transactionTable[transactionIndex];
      setSelectedTransactionItems((prevItems) => [
        ...prevItems,
        selectedTransaction,
      ]);
    } else {
      setSelectedTransactionItems((prevItems) =>
        prevItems.filter(
          (transaction) =>
            transaction !==
            selectedItems[itemIndex].transactionTable[transactionIndex]
        )
      );
    }
  };

  useEffect(() => {
    console.log("Selected Items:", selectedTransactionItems);
  }, [selectedTransactionItems]);
  const handleGoBack = () => {
    navigate("/Logistics");
  };
  return (
    <div>
      <div className="container-admin">
        <section className="section-admin">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controller">Logistic: In Transit</div>
        </section>
        <section className="section-back" onClick={handleGoBack}>
          <FiArrowLeft />
          <div className="back">BACK</div>
        </section>
      </div>
      <div className="purchase-order-box">
        <div className="purchase-order-subbox">
          <div className="Project-details">TRANSACTION DETAILS</div>
          <div className="grid-container">
            <div className="grid-item">
              <div>Project Name: {title}</div>
            </div>
            <div className="grid-item">
              <div>Destination: {place}</div>
            </div>
            <div className="grid-item">
              <div>Tracking Number: {trackingNumber}</div>
            </div>
            <div className="grid-item">
              Items ID:
              {trackingNumbers ? (
                <span>{trackingNumbers}</span>
              ) : (
                <span>No Items ID</span>
              )}
            </div>
          </div>
        </div>
        <div className="purchase-order-input-container">
          <div className="Project-details">ENTER DELIVERY DETAILS</div>
          <div className="label-transaction">Logistic Personnel: </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(user.name)}
            placeholder="Enter Logistic Personnel"
          />
          <div className="label-transaction">Plate Number: </div>
          <textarea
            className="comment-textarea"
            value={deliveryLocation}
            onChange={(e) => setDeliveryLocation(e.target.value)}
            placeholder="Enter Vehicle's Plate Number"></textarea>
        </div>
        <div className="purchase-order-input-container">
          <div className="label-transaction">Comment: </div>
          <textarea
            className="comment-textarea"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Enter a Comment"></textarea>
          {generateButtonVisible &&
            !inTransData.some((item) => item.status === "In Transit") && (
              <button onClick={handleSaveConfirmation}>In Transit</button>
            )}
        </div>
        <div className="purchase-order-input-container-1">
          {showQRCode && trackingNumbers && (
            <div className="purchase-order-input-subcontainer-1">
              <div className="scan-me">Scan Me</div>
              <QRCode
                ref={qrCodeRef}
                value={generateQRCodeWithLink({
                  trackingNumbers,
                  trackingNumber,
                  place,
                  title,
                })}
                size={256}
                renderAs="svg"
                includeMargin={true}
                className="qr-code"
              />
              <p>Tracking Number: {trackingNumber}</p>
            </div>
          )}
        </div>
      </div>

      <div className="Products-delivered">PRODUCTS TO BE DELIVERED</div>

      {selectedItems ? (
        selectedItems
          .filter((item) => item.status === "Pick up")
          .map((item, itemIndex) => (
            <div key={item.id}>
              <TableContainer component={Paper} className="table-container">
                <div
                  style={{
                    maxHeight: `${rowsPerPage * 53}px`,
                    overflow: "auto",
                  }}>
                  <Table size="small" aria-label="a dense table">
                    <TableHead style={{ position: "sticky", top: 0 }}>
                      <TableRow>
                        <TableCell>
                          <b>Select</b>
                        </TableCell>
                        <TableCell>
                          <b>Item Name</b>
                        </TableCell>
                        <TableCell>
                          <b>Unit</b>
                        </TableCell>
                        <TableCell>
                          <b>Total Quantity</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {item.transactionTable.map(
                        (transaction, transactionIndex) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                value={selectedTransactionItems.some(
                                  (t) => t.id === transaction.id
                                )}
                                onChange={(e) =>
                                  handleChange(e, itemIndex, transactionIndex)
                                }
                              />
                            </TableCell>
                            <TableCell>{transaction.ItemName}</TableCell>
                            <TableCell>{transaction.unit}</TableCell>
                            <TableCell>{transaction.quantity}</TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </div>
                <TablePagination
                  style={{ position: "sticky", top: 0 }}
                  component="div"
                  count={item.transactionTable.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
            </div>
          ))
      ) : (
        <div>You have not scanned the items for In Transit</div>
      )}
    </div>
  );
}

export default LogisticsInTrans;

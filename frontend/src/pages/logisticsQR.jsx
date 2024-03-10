import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
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

function LogisticsQR() {
  const routeLocation = useLocation();
  const [selectedItems, setSelectedItems] = useState([]);
  const [trackingNumbers, setTrackingNumbers] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [name, setName] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [status, setStatus] = useState("");
  const [tableData, setTableData] = useState([]);
  const qrCodeRef = useRef();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showQRCode, setShowQRCode] = useState(false);
  const [generateButtonVisible, setGenerateButtonVisible] = useState(true);

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

      const pickupTable = selectedItems
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
        );
      console.log("pickupTable:", pickupTable);

      const updatedData = {
        id: currentTrackingNumbers,
        status: "In Transit",
        name,
        date: currentDate,
        time: currentTime,
        location: deliveryLocation,
        transactionTable: pickupTable,
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
    if (!name || !deliveryLocation) {
      toast.error("Please enter logistic personnel and plate number.");
      return;
    }

    setStatus("In Transit");
    updateTableData();
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

  return (
    <div className="body1">
      <h1>Logistics</h1>
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
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter Logistic Personnel"
          />

          <textarea
            className="comment-textarea"
            value={deliveryLocation}
            onChange={(e) => setDeliveryLocation(e.target.value)}
            placeholder="Enter Vehicle's Plate Number"></textarea>

          {generateButtonVisible && (
            <button onClick={handleSaveData}>In Transit</button>
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
          .map((item) => (
            <div key={item.id}>
              <TableContainer component={Paper} className="table-container">
                <div
                  style={{
                    maxHeight: `${rowsPerPage * 53}px`,
                    overflow: "auto",
                  }}>
                  <Table>
                    <TableHead style={{ position: "sticky", top: 0 }}>
                      <TableRow>
                        <TableCell>Item Name</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Unit</TableCell>
                        <TableCell>Supplier</TableCell>
                        <TableCell>Unit Cost</TableCell>
                        <TableCell>Material Cost</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {item.transactionTable.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.ItemName}</TableCell>
                          <TableCell>{transaction.quantity}</TableCell>
                          <TableCell>{transaction.unit}</TableCell>
                          <TableCell>{transaction.supplier}</TableCell>
                          <TableCell>{transaction.unitCost}</TableCell>
                          <TableCell>{transaction.materialCost}</TableCell>
                        </TableRow>
                      ))}
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

export default LogisticsQR;

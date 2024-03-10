import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import axios from "axios";
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

function LogisticsReceive() {
  const { user } = useSelector((state) => state.auth);
  const routeLocation = useLocation();
  const [selectedItems, setSelectedItems] = useState([]);
  const [trackingNumbers, setTrackingNumbers] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [name, setName] = useState(user.name);
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [status, setStatus] = useState("Received");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [generateButtonVisible, setGenerateButtonVisible] = useState(true);
  const [selectedTransactionItems, setSelectedTransactionItems] = useState([]);
  const [inReceivedData, setSelectedReceivedData] = useState([]);
  const [comments, setComments] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(routeLocation.search);
    const qrCodeData = queryParams.get("data");

    if (qrCodeData) {
      const data = JSON.parse(decodeURIComponent(qrCodeData));
      setTrackingNumbers(data.trackingNumbers);
      setTrackingNumber(data.trackingNumber);
      setTitle(data.title);
      setPlace(data.place);
    }
  }, [routeLocation.search]);

  useEffect(() => {
    const storedButtonVisibility = localStorage.getItem(trackingNumbers || "");

    if (storedButtonVisibility) {
      setGenerateButtonVisible(JSON.parse(storedButtonVisibility));
    }
  }, [trackingNumbers]);

  useEffect(() => {
    if (trackingNumbers) {
      axios
        .get(`/api/deliveries/${trackingNumbers}`)
        .then((response) => {
          const { data } = response;

          const filteredItems =
            data && data.tableData
              ? data.tableData.filter((item) => item.status === "In Transit")
              : [];

          setSelectedItems(filteredItems);
          console.log("Transaction Table of Pick up:", filteredItems);
        })
        .catch((error) => {
          console.error("Error fetching delivery data:", error);
        });
    }
  }, [trackingNumbers]);

  const InReceiveData = () => {
    if (trackingNumbers) {
      axios
        .get(`/api/deliveries/${trackingNumbers}`)
        .then((response) => {
          const { data } = response;

          const filteredItems = data.tableData.filter(
            (item) => item.status === "Received"
          );
          setSelectedReceivedData(filteredItems);
          console.log("Transaction Table of Items:", filteredItems);
        })
        .catch((error) => {
          console.error("Error fetching delivery data:", error);
        });
    }
  };

  useEffect(() => {
    InReceiveData();
  }, [trackingNumbers]);
  const updateTableData = async () => {
    try {
      const currentDate = getCurrentDate();
      const currentTime = getCurrentTime();

      /*const pickupTable = selectedItems
        .filter((item) => item.status === "In Transit")
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
        category: transaction.category,
        ItemName: transaction.ItemName,
        quantity: transaction.quantity,
        unit: transaction.unit,
        supplier: transaction.supplier,
        unitCost: transaction.unitCost,
        materialCost: transaction.materialCost,
      }));

      const updatedData = {
        id: trackingNumbers,
        status: "Received",
        name,
        date: currentDate,
        time: currentTime,
        location: place,
        comment: comments,
        transactionTable: transactionData,
      };

      // Send the updatedData to the server
      await axios.put(`/api/deliveries/${trackingNumbers}/status`, updatedData);
      toast.success("The items have been received!");
      setName("");
      setComments("");
      setDeliveryLocation(place);
      setGenerateButtonVisible(false);

      localStorage.setItem(trackingNumbers || "", JSON.stringify(false));
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
    if (!name || !comments) {
      toast.error("Please Enter Your Receiver's Name and Comment");
      return;
    }
    if (selectedTransactionItems.length === 0) {
      toast.error("Please select at least one item.");
      return;
    }
    if (inReceivedData.some((item) => item.status === "Received")) {
      toast.error("These items are already Received.");
      return;
    }
    setStatus("Received");
    updateTableData();
  };
  const handleSaveConfirmation = () => {
    const isConfirmed = window.confirm(
      "Are you sure these are the exact items?"
    );

    if (isConfirmed) {
      handleSaveData();
    }
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
    navigate("/Dashboard");
  };
  return (
    <div>
      <div className="container-admin">
        <section className="section-admin">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controller">Logistic: Received</div>
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
              <div>Tracking Number: {trackingNumber}</div>
            </div>
            <div className="grid-item">
              Items ID:
              {trackingNumbers ? (
                <p>{trackingNumbers}</p>
              ) : (
                <p>No tracking number available.</p>
              )}
            </div>
          </div>
        </div>
        <div className="purchase-order-input-container">
          <div className="Project-details">ENTER DELIVERY DETAILS</div>
          <div className="label-transaction">Receiver Personnel: </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(user.name)}
            placeholder="Enter Receiver Personnel"
          />
          <div className="label-transaction">Received Address: </div>
          <textarea
            className="comment-textarea"
            value={place}
            onChange={(e) => setDeliveryLocation(e.target.value)}
            placeholder="Enter Received Address"></textarea>
        </div>
        <div className="purchase-order-input-container">
          <div className="label-transaction">Comment: </div>
          <textarea
            className="comment-textarea"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Enter a Comment"></textarea>
          {generateButtonVisible &&
            !inReceivedData.some((item) => item.status === "Received") && (
              <button onClick={handleSaveConfirmation}>Received</button>
            )}
        </div>
      </div>

      <div>
        {selectedItems ? (
          selectedItems
            .filter((item) => item.status === "In Transit")
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
                            <b>Quantity</b>
                          </TableCell>
                          <TableCell>
                            <b>Unit</b>
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
                              <TableCell>{transaction.quantity}</TableCell>
                              <TableCell>{transaction.unit}</TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <TablePagination
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
          <div>Please select a title to view delivery details.</div>
        )}
      </div>
    </div>
  );
}

export default LogisticsReceive;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux"; // new imports
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
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
  Checkbox,
} from "@mui/material";
import "./PurchaseOrder.css";

import Modal from "react-modal";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options);
};
function ProductDelivery() {
  const { user } = useSelector((state) => state.auth); // from authenticated user based on logged in user
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState("");
  const [comments, setComments] = useState("");
  const [qrCodeData, setQRCodeData] = useState(null);
  const [page, setPage] = useState(0);
  const [showModal2, setShowModal2] = useState(false);
  const [showModal3, setShowModal3] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [senderName, setSenderName] = useState(user.name);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [generateButtonVisible, setGenerateButtonVisible] = useState(true);
  const [senderAddress, setSenderAddress] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [showQR, setShowQR] = useState(true);
  const [contactPerson, setcontactPerson] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryDetails, setDeliveryDetails] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [instructions, setInstructions] = useState("");
  const [status, setStatus] = useState("");
  const [deliveryId, setDeliveryId] = useState("");
  const [inPickUp, setSelectedPickUp] = useState([]);
  const [inInTransit, setSelectedInTransit] = useState([]);
  const [inReceived, setSelectedReceived] = useState([]);
  const [deliveriesId, setDeliveriesId] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModal4, setShowModal4] = useState(true);
  const [generateButtonVisibleDouble, setGenerateButtonVisibleDouble] =
    useState(false);
  const {
    id,
    title,
    remarks,
    date,
    time,
    tableData,
    location,
    dateNeeded,
    dateRequested,
    targetDelivery,
  } = useLocation().state || {};
  const navigate = useNavigate();
  useEffect(() => {
    // Set the initial items state using the tableData prop
    setItems(tableData || []);
  }, [tableData]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`/api/comments/comment/${id}`);
      const data = response.data;
      setDeliveriesId(data.deliveryId);
      setPurchaseOrders(data.tableData);
      console.log("PURCHASE INFO: ", data.tableData);
      console.log("PURCHASE ID: ", data.deliveryId);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchDelivery = () => {
    if (deliveriesId) {
      axios
        .get(`/api/deliveries`)
        .then((response) => {
          const { data } = response;
          const filteredDelivery = data.filter(
            (item) => item.trackingNumber === deliveriesId
          );
          const filteredId = filteredDelivery.map((delivery) => delivery._id);
          console.log("Filtered Delivery ID:", filteredId);
          setDeliveryId(filteredId);
          console.log("Filtered Delivery:", filteredDelivery);
          const filteredRemark = filteredDelivery.map(
            (delivery) => delivery.remark
          );
          console.log("Filtered Delivery Remark:", filteredRemark);
          setStatus(filteredRemark);
          // Pick up delivery info
          const filteredItems = filteredDelivery.map((delivery) =>
            delivery.tableData.filter((item) => item.status === "Pick up")
          );

          const status = filteredItems.flat().map((item) => item.status);
          setSelectedPickUp(status);
          console.log("Filtered Items Pick Up:", status);

          // In Transit delivery info
          const filteredItemsInTransit = filteredDelivery.map((delivery) =>
            delivery.tableData.filter((item) => item.status === "In Transit")
          );

          const statusInTransit = filteredItemsInTransit
            .flat()
            .map((item) => item.status);
          setSelectedInTransit(statusInTransit);
          console.log("Filtered Items In Transit:", statusInTransit);

          //Received Delivery Info
          const filteredItemsReceived = filteredDelivery.map((delivery) =>
            delivery.tableData.filter((item) => item.status === "Received")
          );

          const statusReceived = filteredItemsReceived
            .flat()
            .map((item) => item.status);
          setSelectedReceived(statusReceived);
          console.log("Filtered Items Received:", statusReceived);
        })
        .catch((error) => {
          console.error("Error fetching delivery data:", error);
        });
    }
  };
  useEffect(() => {
    fetchDelivery();
  }, [deliveriesId]);

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    // Check if the generate button should be hidden based on the stored visibility state
    const isVisible = localStorage.getItem(`generateButtonVisible_${id}`);

    const baseURL = window.location.origin;
    const qrData = {
      link: `${baseURL}/LogisticsIn-trans/${deliveryId}`,
      title: title,
      place: location,
      trackingNumber: deliveriesId,
    };
    const qrCodeData = JSON.stringify(qrData);

    // Retrieve the QR code data and tracking number from localStorage
    const storedQRCodeData = localStorage.getItem(`qrCodeData_${id}`);
    const storedTrackingNumber = localStorage.getItem(`trackingNumber_${id}`);
    if (qrCodeData && deliveriesId && isVisible === "false") {
      setQRCodeData(qrCodeData);
      setTrackingNumber(deliveriesId);
      setGenerateButtonVisible(false);
    } else {
      setQRCodeData(storedQRCodeData);
      setTrackingNumber(storedTrackingNumber);
    }
  }, [id, deliveryId, deliveriesId]);
  const generateRandomTrackingNumber = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    let trackingNumber = "";
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * letters.length);
      trackingNumber += letters[randomIndex];
    }
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * numbers.length);
      trackingNumber += numbers[randomIndex];
    }
    return trackingNumber;
  };

  const getCurrentDate = () => {
    const currentDate = new Date().toLocaleDateString("en-US");
    return currentDate;
  };

  const getCurrentTime = () => {
    const currentTime = new Date().toLocaleTimeString("en-US");
    return currentTime;
  };

  const handleGenerateQRCode = async () => {
    if (senderName === "" || locations === "" || comments === "") {
      toast.error("Please enter pick-up personnel, address and comment.");
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("Please select items for pickup.");
      return;
    }

    const trackingNumber = generateRandomTrackingNumber();
    setTrackingNumber(trackingNumber);

    const transactionData = selectedItems.map((item) => ({
      category: item.category,
      ItemName: item.ItemName,
      quantity: item.quantity,
      unit: item.unit,
      supplier: item.supplier,
      unitCost: item.unitCost,
      materialCost: item.materialCost,
    }));

    const delivery = {
      trackingNumber,
      title: title, // Store the displayed title
      place: location,
      purchaseId: id,

      tableData: [
        {
          status: "Pick up",
          name: senderName,
          date: getCurrentDate(),
          time: getCurrentTime(),
          location: locations,
          comment: comments,
          transactionTable: transactionData,
        },
      ],
    };

    // Update the purchaseOrders with the updated trackingNumber
    const updatedPurchaseOrders = {
      ...purchaseOrders,
      deliveryId: trackingNumber,
    };
    try {
      const response = await axios.post("/api/deliveries", delivery);
      const deliveryId = response.data._id;

      const qrData = {
        link: `http://localhost:3000/logistics/${deliveryId}`,
        title: title,
        place: location,
        trackingNumber: trackingNumber,
      };

      const qrCodeData = JSON.stringify(qrData);
      setQRCodeData(qrCodeData);

      // Send the updated purchaseOrders to the server
      await axios.put(`/api/comments/comment/${id}`, updatedPurchaseOrders);

      // await axios.delete(`/api/comments/comment/${id}`);

      toast.success("The items are for pickup now!");
      console.log(items);
      console.log(transactionData);
      setSenderName("");
      setLocations("");
      setComments("");
      setShowQR(true);
      setGenerateButtonVisible(false);
      setGenerateButtonVisibleDouble(false);
      setSelectedItems([]);
      fetchData();
      fetchDelivery();

      // Store the visibility state, QR code data, and tracking number in localStorage
      localStorage.setItem(`generateButtonVisible_${id}`, false);
      localStorage.setItem(`qrCodeData_${id}`, qrCodeData);
      localStorage.setItem(`trackingNumber_${id}`, trackingNumber);
    } catch (error) {
      console.error("Error creating delivery or deleting comment:", error);
      throw error;
    }
  };
  const handleSaveConfirmation = () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to save with these items?"
    );

    if (isConfirmed) {
      if (inPickUp[0] === "Pick up") {
        toast.error("These items are already Pick up.");
        return;
      }
      handleGenerateQRCode();
    }
  };
  const handleSaveConfirmationDouble = () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to save with these items?"
    );

    if (isConfirmed) {
      handleGenerateQRCode();
    }
  };
  const generateQRCodeWithLink = (text) => {
    const baseURL = window.location.origin;
    const urlPrefix = `${baseURL}/LogisticsIn-trans/?data=`;
    return urlPrefix + encodeURIComponent(text);
  };

  useEffect(() => {
    console.log("QR Code Data:", qrCodeData);
  }, [qrCodeData]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const getDisplayedItems = () => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const handleChange = (e, index) => {
    const checked = e.target.checked;

    if (checked === true) {
      const selectedItem = items[index];
      setSelectedItems((oldData) => [...oldData, selectedItem]);
    } else {
      setSelectedItems((oldData) =>
        oldData.filter((item) => item !== items[index])
      );
    }
  };

  useEffect(() => {
    console.log("Selected Items:", selectedItems);
  }, [selectedItems, qrCodeData]);

  //-----------pdf code for po--------------
  const handleCheckboxChange = (itemId) => {
    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.includes(itemId)) {
        return prevSelectedItems.filter((selectedId) => selectedId !== itemId);
      } else {
        return [...prevSelectedItems, itemId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item.id));
    }
  };

  const handleExportPDFClick = () => {
    setShowExportModal(true);
  };

  const handleModalClose = () => {
    setShowExportModal(false);
  };

  const filterItems = (query) => {
    const filtered = getDisplayedItems().filter((item) =>
      item.supplier.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredItems(filtered);
  };

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    setFilteredItems([]);
    setSelectedItems([]);
    if (query) {
      filterItems(query);
    }
  };
  const inputFields = document.querySelectorAll(".input-field"); // Replace with your selector for input fields
  const fieldsEmpty = areFieldsEmpty(inputFields);

  if (fieldsEmpty) {
    console.log("Some fields are empty");
  } else {
    console.log("All fields are filled");
  }

  function areFieldsEmpty(fields) {
    for (let i = 0; i < fields.length; i++) {
      if (!fields[i].value.trim()) {
        return true; // Empty field found
      }
    }
    return false; // No empty fields found
  }

  //---------------------------------------------------

  const handleGoBack = () => {
    navigate("/procurementDash");
  };
  useEffect(() => {
    // Check if the tracking number exists
    if (trackingNumber) {
      setGenerateButtonVisible(false);
    }
  }, [trackingNumber]);

  const handleYesClick = () => {
    setShowModal(true);
    fetchData();
    fetchDelivery();
  };
  const handleCancelClick = () => {
    setShowModal(false);
  };
  const handleCancelSuccessClick = () => {
    setShowModal2(false);
  };
  const handleCancelDeliveryClick = () => {
    setShowModal3(false);
  };

  const handleContinueClick = () => {
    const allItemsDelivered = purchaseOrders.every(
      (purchase) => purchase.changes === "Checked"
    );
    if (allItemsDelivered) {
      setShowModal2(true);
      setShowModal(false);
      toast.success("ALL ITEMS ARE DELIVERED SUCCESSFULLY");
      return;
    }
    if (!selectedItems.length > 0) {
      toast.error("Select an item first");
      return;
    }
    fetchData();
    fetchDelivery();
    // Check if the first status in the array is not "Updated"
    if (status.length === 0 || status[0] !== "Updated") {
      // If any selected item has an invalid status, show an error message and don't continue
      toast.error("ITEMS ARE ON DELIVERY");
      setShowModal3(true);
      setShowModal(false);
    } else {
      setComments("");
      setGenerateButtonVisibleDouble(true);
      setShowModal(false);
      setQRCodeData(null);
      setTrackingNumber(null);
      setShowQR(false);
      localStorage.removeItem(`generateButtonVisible_${id}`);
    }
  };
  const handleCancelSuccessClicks = () => {
    setShowModal4(false);
  };
  return (
    <div>
      <div className="container-admin">
        <section className="section-admin">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controller">
            <b>Pick Up</b>
          </div>
        </section>
        <section className="section-back" onClick={handleGoBack}>
          <FiArrowLeft />
          <div className="back">BACK</div>
        </section>
      </div>
      <div>
        <div className="purchase-order-box">
          <div className="purchase-order-subbox">
            <div className="Project-details">PROJECT DETAILS</div>
            <div className="grid-container">
              <div className="grid-item">
                <div>Project Name: {title}</div>
              </div>
              <div className="grid-item">
                <div>Date Needed: {formatDate(dateNeeded)}</div>
              </div>
              <div className="grid-item">
                <div>Date Requested: {formatDate(dateRequested)}</div>
              </div>
              <div className="grid-item">
                <div>Target Delivery: {formatDate(targetDelivery)}</div>
              </div>
              <div className="grid-item">
                <div>Remarks: {remarks}</div>
              </div>
              <div className="grid-item">
                <div>Date Approved: {formatDate(date)}</div>
              </div>
              <div className="grid-item">
                <div>Time Approved: {time}</div>
              </div>
              <div className="grid-item">
                <div>Delivery Location: {location}</div>
              </div>
            </div>
          </div>
          <div className="purchase-order-input-container">
            <div className="Project-details">ENTER DELIVERY DETAILS</div>
            <div className="label-transaction">Pick-up Personnel: </div>{" "}
            <input
              type="text"
              value={senderName}
              // display it also the "user.name" especially inside the onChange elements to remain unchanggeable
              onChange={(e) => setSenderName(user.name)}
              placeholder="Enter Pick Up Personnel"
            />
            <div className="label-transaction">Address: </div>
            <textarea
              className="comment-textarea"
              value={locations}
              onChange={(e) => setLocations(e.target.value)}
              placeholder="Enter Pick Up Address"></textarea>
          </div>
          <div className="purchase-order-input-container">
            <div className="label-transaction">Comment: </div>

            <textarea
              className="comment-textarea"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Enter Comment"></textarea>

            {generateButtonVisible && inPickUp[0] !== "Pick up" && (
              <button onClick={handleSaveConfirmation}>SAVE FOR PICK UP</button>
            )}
            {generateButtonVisibleDouble && (
              <button onClick={handleSaveConfirmationDouble}>
                SAVE FOR PICK UPs
              </button>
            )}
          </div>

          <div className="purchase-order-input-container-1">
            {showQR && (
              <>
                {" "}
                {qrCodeData && (
                  <div className="purchase-order-input-subcontainer-1">
                    <div className="scan-me">Scan Me</div>
                    <QRCode
                      value={generateQRCodeWithLink(qrCodeData)}
                      size={256}
                      renderAs="svg"
                      includeMargin={true}
                      className="qr-code"
                    />
                    <p>Tracking Number: {trackingNumber}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="Products-delivered">PRODUCTS TO BE DELIVERED</div>
        {purchaseOrders.some(
          (transactions) => transactions.changes === "Checked"
        ) ? (
          purchaseOrders.every(
            (transactions) => transactions.changes === "Checked"
          ) ? (
            <div>
              {showModal4 && (
                <div className="modal">
                  <div className="item-overlay">
                    <div className="access-denied-modal">
                      <div className="title-access">DELIVERED SUCCESSFUL</div>
                      <br />
                      <p className="yes-info">
                        You have successfully delivered all items!
                      </p>
                      <div className="modal-buttons">
                        <button onClick={handleCancelSuccessClicks}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {" "}
              <div className="yes-box">
                There are remaining undelivered items. Would you like to pick up
                these remaining items?
                <span className="yes-delivery" onClick={handleYesClick}>
                  Yes
                </span>
              </div>
            </div>
          )
        ) : (
          <div></div>
        )}
        {showModal2 && (
          <div className="modal">
            <div className="item-overlay">
              <div className="access-denied-modal">
                <div className="title-access">DELIVERED SUCCESSFUL</div>
                <br />
                <p className="yes-info">
                  You have successfully delivered all items!
                </p>
                <div className="modal-buttons">
                  <button onClick={handleCancelSuccessClick}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showModal3 && (
          <div className="modal">
            <div className="item-overlay">
              <div className="access-denied-modal">
                <div className="title-access">ITEMS ARE ON DELIVERY</div>
                <br />
                <p className="yes-info">
                  You are not allowed to transact again. Kindly wait for the
                  update of the items. This will prevent repetitive
                  transactions.
                </p>
                <div className="modal-buttons">
                  <button onClick={handleCancelDeliveryClick}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showModal && (
          <div className="modal">
            <div className="item-overlay">
              <div className="access-denied-modal">
                <div className="title-access">NOTICE!</div>
                <br />
                <p className="yes-info">
                  By clicking 'Yes,' you will be able to proceed and submit the
                  remaining items. Kindly finalize your delivery items before
                  continuing to the next process.
                </p>
                <div className="modal-buttons">
                  <button onClick={handleContinueClick}>Continue</button>
                  <button onClick={handleCancelClick}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
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
                {getDisplayedItems().map((item, i) => {
                  const totalUnitCost =
                    (parseInt(item.warehouseUnitcost) || 0) +
                    (parseInt(item.unitCost) || 0);
                  const totalMaterialCost =
                    parseInt(item.quantity) * totalUnitCost;

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          value={selectedItems.includes(item.id)}
                          onChange={(e) => handleChange(e, i)}
                          disabled={purchaseOrders.some(
                            (purchase) =>
                              purchase.ItemName === item.ItemName &&
                              purchase.changes === "Checked"
                          )}
                        />
                      </TableCell>
                      <TableCell>{item.ItemName}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <TablePagination
            style={{ position: "sticky", top: 0 }}
            component="div"
            count={items.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </div>
    </div>
  );
}

export default ProductDelivery;

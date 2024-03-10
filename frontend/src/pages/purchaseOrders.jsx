import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux"; // new imports
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { AiFillCloseCircle } from "react-icons/ai";

import QRCode from "qrcode.react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Box,
  Fade,
  TableHead,
  TablePagination,
  TableRow,
  Checkbox,
  Modal,
} from "@mui/material";
import "./PurchaseOrder.css";

import jsPDF from "jspdf";

const modalStyle = {
  position: "absolute",
  top: "50%",
  height: "700px",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1490,
  bgcolor: "background.paper",
  maxHeight: "700px",
  overflow: "auto",
  borderRadius: "5px",
  boxShadow: 24,
  padding: "20px",
  backgroundColor: "#f4f4f4",
};
const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options);
};
function PurchaseOrder() {
  const { user } = useSelector((state) => state.auth); // from authenticated user based on logged in user
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState("");
  const [qrCodeData, setQRCodeData] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [senderName, setSenderName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [generateButtonVisible, setGenerateButtonVisible] = useState(true);
  const [senderAddress, setSenderAddress] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [contactPerson, setcontactPerson] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryDetails, setDeliveryDetails] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [instructions, setInstructions] = useState("");
  const [poId, setpoId] = useState("");
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

  useEffect(() => {
    // Check if the generate button should be hidden based on the stored visibility state
    const isVisible = localStorage.getItem(`generateButtonVisible_${id}`);
    if (isVisible === "false") {
      setGenerateButtonVisible(false);
    }

    // Retrieve the QR code data and tracking number from localStorage

    const storedQRCodeData = localStorage.getItem(`qrCodeData_${id}`);
    const storedTrackingNumber = localStorage.getItem(`trackingNumber_${id}`);
    if (storedQRCodeData && storedTrackingNumber) {
      setQRCodeData(storedQRCodeData);
      setTrackingNumber(storedTrackingNumber);
    }
  }, [id]);

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
    if (senderName === "" || locations === "") {
      toast.error("Please enter pick-up personnel and address.");
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("Please select items for pickup.");
      return;
    }

    const trackingNumber = generateRandomTrackingNumber();
    setTrackingNumber(trackingNumber);

    const transactionData = selectedItems.map((item) => ({
      ItemName: item.ItemName,
      quantity: item.quantity,
      unit: item.unit,
      supplier: item.supplier,
      unitCost: item.unitCost,
      materialCost: item.proccuredMaterialCost,
    }));

    const delivery = {
      trackingNumber,
      title: title, // Store the displayed title
      place: location,
      tableData: [
        {
          status: "Pick up",
          name: senderName,
          date: getCurrentDate(),
          time: getCurrentTime(),
          location: locations,
          transactionTable: transactionData,
        },
      ],
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

      await axios.delete(`/api/comments/comment/${id}`);

      toast.success("The items are for pickup now!");
      console.log(items);
      console.log(transactionData);
      setSenderName("");
      setLocations("");
      setGenerateButtonVisible(false);

      // Store the visibility state, QR code data, and tracking number in localStorage
      localStorage.setItem(`generateButtonVisible_${id}`, false);
      localStorage.setItem(`qrCodeData_${id}`, qrCodeData);
      localStorage.setItem(`trackingNumber_${id}`, trackingNumber);
    } catch (error) {
      console.error("Error creating delivery or deleting comment:", error);
      throw error;
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
    console.log("Filtered Items" + filteredItems);
  }, [selectedItems, qrCodeData]);

  //-----------pdf code for po--------------
  const handleCheckboxChange = (item) => {
    console.log("Checkbox clicked for item:", item);

    setSelectedItems((prevSelectedItems) => {
      console.log("Previous selected items:", prevSelectedItems);

      if (prevSelectedItems.some((selectedItem) => selectedItem === item)) {
        console.log("Item already selected. Removing from selected items.");
        return prevSelectedItems.filter(
          (selectedItem) => selectedItem !== item
        );
      } else {
        console.log("Item not selected. Adding to selected items.");
        return [...prevSelectedItems, item];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item));
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
  const handleExportPDF = () => {
    const doc = new jsPDF("p", "pt", "a4");
    if (
      !date ||
      !vendorName ||
      !senderAddress ||
      !contactPerson ||
      !contactNo ||
      !deliveryAddress ||
      !deliveryDetails ||
      !poId
    ) {
      console.log("Some fields are empty. Cannot export PDF.");
      toast.error("Input fields are empty complete the forms");
      return; // Exit the function without exporting the PDF
    }
    // Set up the logo
    const logo = require("../pages/logo.jpg"); // Adjust the path to your logo file
    doc.addImage(logo, "JPG", 30, 30, 22.75, 37.75);

    // Add the letterhead
    const textContent = [
      { content: "LE&D Electrical Solutions", x: 55, y: 35 },
      { content: "3/F Builders Center Bldg., 170 Salcedo St.,", x: 55, y: 43 },
      {
        content: "Legaspi Village, San Lorenzo, Makati City, 1229",
        x: 55,
        y: 51,
      },
      { content: "Contact No.: (02) 70035940", x: 55, y: 59 },
      {
        content: "Email Address: info@ledelectricalsolutions.com",
        x: 55,
        y: 67,
      },
    ];

    doc.setFontSize(9); // Adjust the font size as needed
    doc.setFont("Helvetica", "Bold");
    doc.text("PO-ID: " + poId, 470, 50);

    doc.setFontSize(13);
    const textWidth =
      (doc.getStringUnitWidth("PURCHASE ORDER") * doc.internal.getFontSize()) /
      doc.internal.scaleFactor;
    const x = (doc.internal.pageSize.width - textWidth) / 2;
    doc.setFont("Helvetica", "bold");
    doc.text("PURCHASE ORDER", 220, 100); // Adjust the position as needed
    // Adjust the x-coordinate (e.g., 160) for the desired position
    // Adjust the position as needed
    // Export labels
    const labels = `Date: ${date}\nVendor: ${vendorName}\nAddress: ${senderAddress}\nContact Person: ${contactPerson}\nContact No.: ${contactNo}\nDelivery Address: ${deliveryAddress}\nDelivery Details:${deliveryDetails}`;
    doc.setFontSize(11);
    doc.setFont("Helvetica", "normal");
    doc.text(labels, 37.5, 118); // Adjust the position as needed

    // Table
    const tableColumn = [
      "Quantity",
      "Unit",
      "Description",
      "List Price",
      "Total Price",
    ];
    const tableRows = selectedItems.map((item) => {
      return [
        item.proccuredQuantity,
        item.unit,
        item.ItemName,
        item.unitCost,
        item.proccuredMaterialCost,
      ];
    });

    textContent.forEach(({ content, x, y }) => {
      doc.setFontSize(7);
      doc.text(content, x, y);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 200, // Adjust the startY position based on your styling needs
    });
    const boxWidth = 280;
    const boxHeight = 55;
    const boxX = 30;
    const boxY = doc.lastAutoTable.finalY + 30;
    doc.setDrawColor(0, 0, 0); // Black color for border
    doc.rect(boxX, boxY, boxWidth, boxHeight); // Draw rectangle border

    const totalMaterialCost = tableRows.reduce(
      (total, row) => total + parseFloat(row[4]),
      0
    );
    const totalVats = totalMaterialCost * 0.12;
    const totals = totalMaterialCost + totalVats;

    // Draw content inside the box
    doc.setFontSize(10);
    doc.setFont("Helvetica", "bold");
    doc.text("NOTES AND INSTRUCTIONS", boxX + 10, boxY - 7);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.text(instructions, boxX + 10, boxY + 15);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.text(
      "*This document is not valid for claiming input taxes",
      boxX + 10,
      boxY + 65
    );
    doc.text("Total Material Cost: " + "P" + totalMaterialCost, 330, boxY + 10);
    doc.text("VAT(12%): " + "P" + totalVats, 330, boxY + 20);
    doc.text("Others", 330, boxY + 30);
    const lineY = boxY + boxHeight / 2 + 10;
    // Calculate the x-coordinate for the line
    const lineX = doc.getTextWidth("SUBTOTAL:") + 280;
    const lineWidth = 130; // Set the desired width of the line

    // Calculate the x-coordinates for the line
    const lineStartX = lineX; // Starting position of the line
    const lineEndX = lineX + lineWidth; // Ending position of the line

    // Add a horizontal line
    doc.setLineWidth(1); // Set the line width
    doc.line(lineStartX, lineY, lineEndX, lineY); // Draw the line

    doc.text("Total: " + "P" + totals, 330, boxY + 50);

    doc.save("Purchase_Order.pdf");
  };

  const handleGoBack = () => {
    // Use navigate(-1) to go back to the previous page in the history stack
    navigate(-1);
  };
  const handlePickUp = () => {
    navigate("/productDelivery", {
      state: {
        id: id,
        title: title,
        remarks: remarks,
        date: date,
        time: time,
        location: location,
        dateNeeded: dateNeeded,
        dateRequested: dateRequested,
        targetDelivery: targetDelivery,
        tableData: tableData,
      },
    });
  };
  return (
    <div>
      <div className="container-admin">
        <section className="section-admin">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controller">
            <b>Purchase Order</b>
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
            <div className="Project-details">DELIVERY DETAILS</div>
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
                <div>Date: {formatDate(date)}</div>
              </div>
              <div className="grid-item">
                <div>Time: {time}</div>
              </div>
              <div className="grid-item">
                <div>Delivery Location: {location}</div>
              </div>
            </div>
          </div>

          <button type="submit" onClick={handleExportPDFClick}>
            Export PDF
          </button>
          <button type="submit" onClick={handlePickUp}>
            Proceed to Pick Up
          </button>

          <Modal
            open={showExportModal}
            onClose={handleModalClose}
            closeAfterTransition
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
          >
            <Box sx={modalStyle}>
              <Fade in={showExportModal}>
                <div>
                  <AiFillCloseCircle
                    onClick={handleModalClose}
                    className="AiFillCloseCircle"
                  />

                  <br />
                  <h1>Export PDF</h1>
                  <p>
                    {" "}
                    Fill up the appropriate details below to generate the pdf,
                    search the name of the supplier in the search box and select
                    the items needed to be procurred.
                  </p>
                  <br />
                  <div className="purchase-order-box-equip">
                    <div className="pdf-status-content">
                      <label htmlFor="senderAddress">
                        <b>Sender Address:</b>
                      </label>
                      <input
                        type="text"
                        id="senderAddress"
                        value={senderAddress}
                        onChange={(e) => setSenderAddress(e.target.value)}
                      />

                      <label htmlFor="contactPerson">
                        <b>Contact Person:</b>
                      </label>
                      <input
                        type="text"
                        id="contactPerson"
                        value={contactPerson}
                        onChange={(e) => setcontactPerson(e.target.value)}
                      />

                      <label htmlFor="vendorName">
                        <b>Vendor Name:</b>
                      </label>
                      <input
                        type="text"
                        id="vendorName"
                        value={vendorName}
                        onChange={(e) => setVendorName(e.target.value)}
                      />

                      <label htmlFor="contactNo">
                        <b>Contact No.:</b>
                      </label>
                      <input
                        type="text"
                        id="contactNo"
                        value={contactNo}
                        onChange={(e) => setContactNo(e.target.value)}
                      />
                    </div>

                    <div className="pdf-status-content2">
                      <label htmlFor="deliveryAddress">
                        <b>Delivery Address:</b>
                      </label>
                      <input
                        type="text"
                        id="deliveryAddress"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                      />
                      <label htmlFor="deliveryAddress">
                        <b>Purchase Order ID :</b>
                      </label>
                      <input
                        type="text"
                        id="deliveryAddress"
                        value={poId}
                        onChange={(e) => setpoId(e.target.value)}
                      />

                      <label htmlFor="deliveryDetails">
                        <b>Delivery Details:</b>
                      </label>
                      <input
                        id="deliveryDetails"
                        type="text"
                        value={deliveryDetails}
                        onChange={(e) => setDeliveryDetails(e.target.value)}
                      />

                      <label htmlFor="instructions">
                        <b>Instructions:</b>
                      </label>
                      <input
                        type="text"
                        id="instructions"
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                      />

                      <label>
                        <b>Search Supplier</b>
                      </label>
                      <input
                        type="text"
                        className="Project-details"
                        label="Search"
                        value={searchQuery}
                        onChange={handleSearch}
                      />
                    </div>
                  </div>

                  <Table>
                    <TableHead style={{ position: "sticky", top: 0 }}>
                      <TableRow>
                        <TableCell>
                          <b>Selected</b>
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
                        <TableCell>
                          <b>Supplier</b>
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
                      {filteredItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.some(
                                (selectedItem) => selectedItem === item
                              )}
                              onChange={() => handleCheckboxChange(item)}
                            />
                          </TableCell>

                          <TableCell>{item.ItemName}</TableCell>
                          <TableCell>{item.proccuredQuantity}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>{item.supplier}</TableCell>
                          <TableCell>{item.unitCost}</TableCell>
                          <TableCell>{item.materialCost}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <button onClick={handleModalClose}>Close</button>
                  <button onClick={handleExportPDF}>Export PDF</button>
                  <button onClick={handleSelectAll}>
                    {selectedItems.length === items.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>
              </Fade>
            </Box>
          </Modal>

          <div className="purchase-order-input-container-1">
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
          </div>
        </div>
        <div className="Products-delivered">PRODUCTS TO BE PROCURED</div>
        <TableContainer component={Paper} className="table-container">
          <div
            style={{
              maxHeight: `${rowsPerPage * 53}px`,
              overflow: "auto",
            }}
          >
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
                    <b>Warehouse</b>
                  </TableCell>
                  <TableCell>
                    <b>Available Warehouse Items</b>
                  </TableCell>
                  <TableCell>
                    <b>Warehouse Cost</b>
                  </TableCell>
                  <TableCell>
                    <b>Warehouse Material Cost</b>
                  </TableCell>
                  <TableCell>
                    <b>Proccured Quantity</b>
                  </TableCell>
                  <TableCell>
                    <b>Supplier</b>
                  </TableCell>
                  <TableCell>
                    <b>Supplier Unit Cost</b>
                  </TableCell>
                  <TableCell>
                    <b>Supplier Material Cost</b>
                  </TableCell>
                  <TableCell>
                    <b>Total Quantity</b>
                  </TableCell>
                  <TableCell>
                    <b>Total Unit Cost</b>
                  </TableCell>
                  <TableCell>
                    <b>Total Material Cost</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getDisplayedItems().map((item, i) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.ItemName}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.warehouse}</TableCell>
                    <TableCell>{item.stockRequest}</TableCell>
                    <TableCell>{item.warehouseUnitcost}</TableCell>
                    <TableCell>{item.warehouseMaterialCost}</TableCell>
                    <TableCell>{item.proccuredQuantity}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>{item.unitCost}</TableCell>
                    <TableCell>{item.proccuredMaterialCost}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      {parseInt(item.warehouseUnitcost) +
                        parseInt(item.unitCost)}
                    </TableCell>
                    <TableCell>
                      {parseInt(item.quantity) *
                        (parseInt(item.warehouseUnitcost) +
                          parseInt(item.unitCost))}
                    </TableCell>
                  </TableRow>
                ))}
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

export default PurchaseOrder;

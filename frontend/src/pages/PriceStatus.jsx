import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import { FiArrowLeft } from "react-icons/fi";
import html2canvas from "html2canvas";
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

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options);
};
function PriceStatus() {
  const place = useLocation();
  const [stat, setStatus] = useState("approved");
  const {
    title,
    remarks,
    date,
    time,
    tableData,
    comment,
    status,
    location,
    targetDelivery,
    dateNeeded,
    dateRequested,
  } = place.state || {};
  const [comments, setComments] = useState({
    title: title || "",
    location: location || " ",
    targetDelivery: targetDelivery || " ",
    remarks: remarks || "",
    date: date || "",
    dateNeeded: dateNeeded || "",
    dateRequested: dateRequested || "",
    time: time || "",
    comment: comment || "",
    tableData: tableData || [],
  });
  const [rowsPerPage, setRowsPerPage] = useState(10);
  /* useEffect(() => {
    if (tableData.length === 0) {
      // Fetch the comments data from the API using the ID
      fetchCommentsData();
    }
  }, [tableData]);

  const fetchCommentsData = async () => {
    try {
      const response = await axios.get(`/api/commentss/comments/${id}`);
      const commentsData = response.data;
      setComments(commentsData);
    } catch (error) {
      console.error("Failed to fetch comments data:", error);
      toast("Failed to fetch comments data");
    }
  };*/
  const handleGoBack = () => {
    window.history.back(); // Go back to the previous page
  };
  //-------------------------PDF-----------------------//
  const handleExportPDF = () => {
    const doc = new jsPDF("p", "pt", "a4");

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

    doc.setFontSize(13);
    const textWidth =
      (doc.getStringUnitWidth("MATERIALS REQUISITION FORM") *
        doc.internal.getFontSize()) /
      doc.internal.scaleFactor;
    const x = (doc.internal.pageSize.width - textWidth) / 2;
    doc.setFont("Helvetica", "bold");
    doc.text("MATERIALS REQUISITION FORM", 200, 100); // Adjust the position as needed

    // Export labels
    const labels = `Date: ${formatDate(comments.date)}\nSite Name: ${
      comments.location
    }\nDate Requested: ${formatDate(
      comments.dateRequested
    )}\nDate Needed: ${formatDate(
      comments.dateNeeded
    )}\nTarget Delivery Date: ${formatDate(comments.targetDelivery)}`;
    doc.setFontSize(11);
    doc.setFont("Helvetica", "normal");
    doc.text(labels, 39.5, 130); // Adjust the position as needed

    // Table
    const tableColumn = [
      "Quantity",
      "Unit",
      "Description",
      "Supplier",
      "List Price",
      "Total Price",
    ];
    const tableRows = comments.tableData.map((data) => [
      data.quantity,
      data.unit,
      data.ItemName,
      data.supplier,
      `P ${data.unitCost}`,
      `P ${data.materialCost}`,
    ]);

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
      (total, row) => total + parseFloat(row[5]),
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
    doc.text("Payment Term is COD/Cash Upon Pickup", boxX + 10, boxY + 15);
    doc.text("Request O.R Based on categorized Data", boxX + 10, boxY + 30);
    doc.text(
      "Warranty certificate be included with the materials",
      boxX + 10,
      boxY + 45
    );
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.text(
      "*This document is not valid for claiming input taxes",
      boxX + 10,
      boxY + 65
    );
    doc.text(
      "Total Material Cost: " + " P" + totalMaterialCost,
      330,
      boxY + 10
    );
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

    doc.save("material_request_form.pdf");
  };

  //----------------------------
  return (
    <div>
      <div className="container-admin">
        <section className="section-admin">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controller">
            <b>Price Status</b>
          </div>
        </section>
        <section className="section-back" onClick={handleGoBack}>
          <FiArrowLeft />
          <div className="back">BACK</div>
        </section>
      </div>
      <div className="purchase-order-box-equip">
        <div className="purchase-order-subbox-equip">
          <div className="status-contents">
            <b>{comments.title}</b>
            <b>Remarks: {comments.remarks}</b>
            <p>Location:{comments.location}</p>
            <p>Date Requested: {formatDate(comments.dateRequested)}</p>
            <p>Date Needed: {formatDate(comments.dateNeeded)}</p>
            <p>Date Modified: {formatDate(comments.date)}</p>
            <p>Time Modified: {comments.time}</p>
            <p>Target delivery date: {formatDate(comments.targetDelivery)}</p>
          </div>
        </div>
        <div className="comment-text-area">
          <b>Comment from Admin:</b>
          <br />
          <textarea
            className="comment-textarea"
            value={comments.comment}></textarea>
        </div>

        <button onClick={handleGoBack}>Back</button>
      </div>

      <TableContainer component={Paper}>
        <div
          style={{
            maxHeight: `${rowsPerPage * 40}px`,
            overflow: "auto",
          }}>
          <Table sx={{ minWidth: 950 }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>
                  <b>Item #</b>
                </TableCell>
                <TableCell>
                  <b>Item Name</b>
                </TableCell>
                <TableCell>
                  <b>Unit</b>
                </TableCell>
                {comments.tableData.some(
                  (data) => data.stockRequest !== null
                ) && (
                  <>
                    <TableCell>
                      <b>Stock Requests</b>
                    </TableCell>
                    <TableCell>
                      <b>Warehouse</b>
                    </TableCell>
                    <TableCell>
                      <b>Warehouse unit cost</b>
                    </TableCell>
                    <TableCell>
                      <b>Warehouse Material cost</b>
                    </TableCell>
                    <TableCell>
                      <b>Procured Quantity</b>
                    </TableCell>
                    <TableCell>
                      <b>Supplier</b>
                    </TableCell>
                  </>
                )}

                {comments.tableData.some(
                  (data) => data.stockRequest === null
                ) && (
                  <>
                    <TableCell>
                      <b>Supplier Unit Cost</b>{" "}
                    </TableCell>
                  </>
                )}
                <TableCell>
                  <b>Procured unit Cost</b>
                </TableCell>
                <TableCell>
                  <b>Procured Material Cost</b>
                </TableCell>
                <TableCell>
                  <b>Total Quantity</b>
                </TableCell>
                <TableCell>
                  <b>Total Unit Cost</b>
                </TableCell>
                <TableCell>
                  <b>Overall Material Cost</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comments.tableData.map((data, index) => (
                <TableRow hover key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell
                    style={{
                      maxWidth: "200px",
                      whiteSpace: "wrap",
                    }}>
                    {data.ItemName}
                  </TableCell>
                  <TableCell>{data.unit}</TableCell>
                  {data.stockRequest !== null && (
                    <>
                      <TableCell>{data.stockRequest}</TableCell>
                      <TableCell>{data.warehouse}</TableCell>
                      <TableCell>&#x20B1; {data.warehouseUnitcost}</TableCell>
                      <TableCell>
                        &#x20B1; {data.warehouseMaterialCost}
                      </TableCell>
                      <TableCell>{data.proccuredQuantity}</TableCell>
                      <TableCell>{data.supplier}</TableCell>
                    </>
                  )}
                  {data.stockRequest === null && (
                    <>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                    </>
                  )}

                  {data.stockRequest !== null && (
                    <>
                      <TableCell>&#x20B1; {data.unitCost}</TableCell>
                      <TableCell>&#x20B1; {data.materialCost}</TableCell>
                      <TableCell>{data.quantity}</TableCell>
                    </>
                  )}
                  {data.stockRequest === null && (
                    <>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                    </>
                  )}
                  <TableCell>
                    &#x20B1;{" "}
                    {parseFloat(data.warehouseUnitcost) +
                      parseFloat(data.unitCost)}
                  </TableCell>
                  <TableCell>
                    &#x20B1;{" "}
                    {parseFloat(data.quantity) *
                      (parseFloat(data.warehouseUnitcost) +
                        parseFloat(data.unitCost))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TableContainer>
    </div>
  );
}

export default PriceStatus;

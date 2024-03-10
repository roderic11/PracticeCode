import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft } from "react-icons/fi";
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
function PriceView() {
  const place = useLocation();
  const {
    submissionId,
    title,
    sender,
    date,
    tableData,
    location,
    dateRequested,
    dateNeeded,
    targetDelivery,
  } = place.state || {};
  const [submission, setSubmission] = useState({
    title: title || "",
    location: location || " ",
    dateRequested: dateRequested || "",
    dateNeeded: dateNeeded || "",
    targetDelivery: targetDelivery || " ",
    sender: sender || "",
    date: date || "",
    tableData: tableData || [],
  });
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const navigate = useNavigate();
  /* useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await axios.get(`/api/submissions/${submissionId}`);
        const { title, sender, date, tableData } = response.data;
        setSubmission({ title, sender, date, tableData,dateNeeded,dateRequested});
      } catch (error) {
        console.log(error.response);
      }
    };

    if (submissionId) {
      fetchSubmission();
    }
  }, [submissionId, title, sender, date,dateNeeded,dateRequested]);*/
  //  <p>Submission ID: {submissionId}</p>
  const handleGoBack = () => {
    window.history.back(); // Go back to the previous page
  };
  return (
    <div>
      <div className="container-admin">
        <section className="section-admin">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controller">
            <b>Summary Of Submitted Pricing</b>
          </div>
        </section>
        <section className="section-back" onClick={handleGoBack}>
          <FiArrowLeft />
          <div className="back">BACK</div>
        </section>
      </div>
      {submission && (
        <div>
          <div className="purchase-order-box-equip">
            <div className="purchase-order-subbox-equip">
              <div className="status-contents">
                <br />
                <b>{submission.title}</b>
                <p>location:{submission.location}</p>
                <p>Date needed: {formatDate(submission.dateNeeded)}</p>
                <p>Date Requested :{formatDate(submission.dateRequested)}</p>
                <p>Target Delivery :{formatDate(submission.targetDelivery)}</p>
                <p>Sender: {submission.sender}</p>
                <p>Pricing Date: {formatDate(submission.date)}</p>
                <br />
              </div>
            </div>
          </div>

          {submission.tableData && (
            <TableContainer component={Paper}>
              <div
                style={{
                  maxHeight: `${rowsPerPage * 40}px`,
                  overflow: "auto",
                }}>
                <Table size="small" aria-label="a dense table">
                  <TableHead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                    <TableRow>
                      <TableCell
                        style={{ maxWidth: "200px", whiteSpace: "wrap" }}>
                        <b>Item Name</b>
                      </TableCell>
                      <TableCell>
                        <b>Unit</b>
                      </TableCell>

                      <TableCell>
                        <b>Stock Requests</b>
                      </TableCell>
                      <TableCell>
                        <b>Warehouse</b>{" "}
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
                      <TableCell>
                        <b>Supplier Unit Cost</b>
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
                    {submission.tableData.map((data, index) => (
                      <TableRow hover key={index}>
                        <TableCell>{data.ItemName}</TableCell>
                        <TableCell>{data.unit}</TableCell>

                        {data.stockRequest !== null ? (
                          <>
                            <TableCell>{data.stockRequest}</TableCell>
                            <TableCell>{data.warehouse}</TableCell>
                            <TableCell>
                              &#x20B1; {data.warehouseUnitcost}
                            </TableCell>
                            <TableCell>
                              &#x20B1; {data.warehouseMaterialCost}
                            </TableCell>
                            <TableCell>{data.proccuredQuantity}</TableCell>
                            <TableCell>{data.supplier}</TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>-</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell>-</TableCell>
                          </>
                        )}

                        <TableCell> &#x20B1; {data.unitCost}</TableCell>
                        <TableCell>
                          {" "}
                          &#x20B1; {data.proccuredMaterialCost}
                        </TableCell>
                        <TableCell>{data.quantity}</TableCell>
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
          )}
        </div>
      )}
    </div>
  );
}

export default PriceView;

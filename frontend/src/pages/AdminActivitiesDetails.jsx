import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { FaRegTimesCircle } from "react-icons/fa";
import { BsFillCheckSquareFill } from "react-icons/bs";
import axios from "axios";
import { toast } from "react-toastify";
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
import "./Admin.css";
const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options);
};
function AdminActivitiesDetails() {
  const locations = useLocation();
  const {
    id,
    title,
    sender,
    date,
    tableData,
    location,
    dateRequested,
    dateNeeded,
    targetDelivery,
  } = locations.state || {};
  const [submission, setSubmission] = useState({
    id: id || "",
    title: title || "",
    sender: sender || "",
    date: date || "",
    location: location || "",
    dateRequested: dateRequested || "",
    dateNeeded: dateNeeded || "",
    targetDelivery: targetDelivery || "",
    tableData: tableData || [],
  });
  const [comment, setComment] = useState("");
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isApproved, setIsApproved] = useState(false);
  const [isDeclined, setIsDeclined] = useState(false);
  const [isActionTaken, setIsActionTaken] = useState(false);
  const [submissions, setSubmissions] = useState("");

  useEffect(() => {
    checkSubmissionStatus();
    fetchSubmissions();
  }, []);
  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(
        `/api/submissions/submit/${submission.id}`
      );
      const { remark } = response.data;

      setSubmissions(remark);
      console.log("Remark: ", remark);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  const checkSubmissionStatus = () => {
    const status = localStorage.getItem(`submission_status_${id}`);
    if (status === "approved") {
      setIsApproved(true);
      setIsActionTaken(true);
    } else if (status === "declined") {
      setIsDeclined(true);
      setIsActionTaken(true);
    }
  };
  const handleApprove = async () => {
    const now = new Date();
    const date = now.toLocaleDateString("en-PH");
    const time = now.toLocaleTimeString("en-PH", { timeZone: "Asia/Manila" });
    const confirmed = window.confirm("Are you sure you want to Approve?");
    if (!confirmed) {
      return; // Stop the submission process if user cancels
    }
    const data = {
      title: submission.title,
      remarks: "Approved",
      comment: comment,
      tableData: submission.tableData,
      location: submission.location,
      dateRequested: submission.dateRequested,
      dateNeeded: submission.dateNeeded,
      targetDelivery: submission.targetDelivery,
      date: date,
      time: time,
    };

    try {
      await axios.put(`/api/submissions/remark/${submission.id}`, {
        remark: "Approved",
      });
      await axios.post("/api/comments/comment", data);
      toast.success(`Pricing for ${submission.title} Approved`);
      setComment("");
      setIsApproved(true);
      setIsDeclined(false);
      setIsActionTaken(true);
      fetchSubmissions();
      localStorage.setItem(`submission_status_${id}`, "approved");
    } catch (error) {
      toast("Failed to submit data:", error);
    }
  };

  const handleDecline = async () => {
    const now = new Date();
    const date = now.toLocaleDateString("en-PH");
    const time = now.toLocaleTimeString("en-PH", { timeZone: "Asia/Manila" });
    const confirmed = window.confirm("Are you sure you want to Decline?");
    if (!confirmed) {
      return; // Stop the submission process if user cancels
    }

    const data = {
      title: submission.title,
      remarks: "Declined",
      comment: comment,
      tableData: submission.tableData,
      location: submission.location,
      dateRequested: submission.dateRequested,
      dateNeeded: submission.dateNeeded,
      targetDelivery: submission.targetDelivery,
      date: date,
      time: time,
    };

    try {
      await axios.put(`/api/submissions/remark/${submission.id}`, {
        remark: "Declined",
      });
      await axios.post("/api/comments/comment", data);
      toast.error(`Pricing for ${submission.title} Declined`);
      setComment("");
      setIsApproved(false);
      setIsDeclined(true);
      fetchSubmissions();
      setIsActionTaken(true);
      localStorage.setItem(`submission_status_${id}`, "declined");
    } catch (error) {
      toast.error("Failed to submit data:", error);
    }
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
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
          <div className="admin-controller">
            Review and Request Material Request
          </div>
        </section>
        <section className="section-back" onClick={handleGoBack}>
          <FiArrowLeft />
          <div className="back">BACK</div>
        </section>
      </div>
      {submission ? (
        <div>
          <div className="purchase-order-box">
            <div className="purchase-order-subbox">
              <div className="Project-details">MATERIAL REQUEST DETAILS</div>

              <div className="grid-container">
                <div className="grid-item">
                  <div>Title: {submission.title}</div>
                </div>
                <div className="grid-item">
                  <div>Location: {submission.location}</div>
                </div>
                <div className="grid-item">
                  <div>Date Needed: {formatDate(submission.dateNeeded)}</div>
                </div>
                <div className="grid-item">
                  <div>
                    Date Requested: {formatDate(submission.dateRequested)}
                  </div>
                </div>
                <div className="grid-item">
                  <div>
                    Target Delivery: {formatDate(submission.targetDelivery)}
                  </div>
                </div>
                <div className="grid-item">
                  <div>Sender: {submission.sender}</div>
                </div>

                <div className="grid-item">
                  <div>Date Modified: {formatDate(submission.date)}</div>
                </div>
                <div className="grid-item">
                  <div className="BsFillCheckSquareFill-logo-box">
                    {submissions === "Approved" ? (
                      <>
                        <BsFillCheckSquareFill className="BsFillCheckSquareFill-logo" />
                        <span className="approve-submission-text">
                          {submissions}
                        </span>
                      </>
                    ) : submissions === "Declined" ? (
                      <>
                        <FaRegTimesCircle className="FaRegTimesCircle-logo" />
                        <span className="decline-submission-text">
                          {submissions}
                        </span>
                      </>
                    ) : (
                      <span>No Remark</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="purchase-order-input-container">
              <div className="Project-details">ENTER YOUR REMARKS</div>
              <textarea
                className="comment-textarea"
                value={comment}
                onChange={handleCommentChange}
                placeholder="Enter your comment"></textarea>
              {!isActionTaken && (
                <div>
                  {!isActionTaken &&
                    submissions !== "Approved" &&
                    submissions !== "Declined" && (
                      <div className="button-act-details">
                        <button onClick={handleApprove}>Approve</button>
                        <button onClick={handleDecline}>Decline</button>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>

          {submission.tableData.length > 0 && (
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
                        <b>Item Name</b>
                      </TableCell>
                      <TableCell>
                        <b>Unit</b>
                      </TableCell>
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
                      <TableRow key={index}>
                        <TableCell>{data.ItemName}</TableCell>
                        <TableCell>{data.unit}</TableCell>

                        {data.stockRequest !== null ? (
                          <>
                            <TableCell>{data.stockRequest}</TableCell>
                            <TableCell>{data.warehouse || 0}</TableCell>
                            <TableCell>
                              &#x20B1; {data.warehouseUnitcost || 0}
                            </TableCell>
                            <TableCell>
                              &#x20B1; {data.warehouseMaterialCost || 0}
                            </TableCell>
                            <TableCell>{data.proccuredQuantity || 0}</TableCell>
                            <TableCell>{data.supplier || " "}</TableCell>
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

                        <TableCell>&#x20B1; {data.unitCost}</TableCell>
                        <TableCell>&#x20B1; {data.materialCost}</TableCell>
                        <TableCell>{data.quantity}</TableCell>
                        <TableCell>
                          &#x20B1;{" "}
                          {parseFloat(data.warehouseUnitcost) +
                            parseFloat(data.unitCost) || 0}
                        </TableCell>
                        <TableCell>
                          &#x20B1;{" "}
                          {parseFloat(data.quantity) *
                            (parseFloat(data.warehouseUnitcost) +
                              parseFloat(data.unitCost)) || 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <TablePagination
                style={{ position: "sticky", top: 0 }}
                component="div"
                count={submission.tableData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          )}
        </div>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
}

export default AdminActivitiesDetails;

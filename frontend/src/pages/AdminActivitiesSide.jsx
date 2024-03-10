import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Admin.css";
import { toast } from "react-toastify";

function AdminActivitiesSide() {
  const [responseCount, setResponseCount] = useState(0);
  const [project, setProjects] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [approvedCount, setApprovedCount] = useState(0);
  const [declinedCount, setDeclinedCount] = useState(0);
  const [noRemarkCount, setNoRemarkCount] = useState(0);

  useEffect(() => {
    fetchSubmissions();
    getCurrentDateTime();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get("/api/submissions/submit");
      const submissions = response.data;
      setResponseCount(submissions.length);

      const approvedSubmissions = submissions.filter(
        (submission) => submission.remark === "Approved"
      );
      setApprovedCount(approvedSubmissions.length);

      const declinedSubmissions = submissions.filter(
        (submission) => submission.remark === "Declined"
      );
      setDeclinedCount(declinedSubmissions.length);

      const noRemark = submissions.filter(
        (submission) =>
          submission.remark !== "Declined" && submission.remark !== "Approved"
      );

      console.log("Number of No Remark: ", noRemark.length);
      setNoRemarkCount(noRemark.length);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  const getCurrentDateTime = () => {
    const date = new Date();
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    const formattedDateTime = date.toLocaleString(undefined, options);
    setCurrentDateTime(formattedDateTime);
  };

  return (
    <div className="admin-activities-side-main">
      <div className="admin-activities-sub-main">
        <div className="admin-activities-container1">
          <div className="todays-act">Todays Activities</div>
          <div className="act-date">{currentDateTime}</div>
        </div>
        <div className="admin-activities-container4">
          <div className="admin-activities-subcontainer3">
            <div className="approval">Total Pending Approval</div>
            <div className="today">Today</div>
          </div>
          <div className="respondents">{noRemarkCount} For Approval</div>
          <div>
            <hr className="approval-hr" />
          </div>
          <div className="info-approval">
            This is the total pending approval pricing as of today.
          </div>
        </div>
        <div className="admin-activities-container2">
          <div className="admin-activities-subcontainer2">
            <div className="responses">Total Declined Requests</div>
            <div className="today">Today</div>
          </div>
          <div className="respondents">{declinedCount} Declined</div>
          <div>
            <hr />
          </div>
          <div className="info-responses">
            This is the total declined pricing as remarked by the Admin.
          </div>
        </div>
        <div className="admin-activities-container3">
          <div className="admin-activities-subcontainer3">
            <div className="approval">Total Approved Requests</div>
            <div className="today">Today</div>
          </div>
          <div className="respondents">{approvedCount} Approved</div>
          <div>
            <hr className="approval-hr" />
          </div>
          <div className="info-approval">
            This is the total approved pricing as remarked by the Admin.
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminActivitiesSide;

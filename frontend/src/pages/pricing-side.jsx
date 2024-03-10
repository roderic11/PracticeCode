import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaRegTimesCircle } from "react-icons/fa";
import { BsFillCheckSquareFill } from "react-icons/bs";

function PriceSide() {
  const [selectedPriceTitle, setSelectedPriceTitle] = useState("");
  const [selectedPriceStatus, setSelectedPriceStatus] = useState("");
  const [priceOptions, setPriceOptions] = useState([]);
  const [statusPrices, setStatusPrices] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchPriceOptions();
    fetchStatusPrices();
  }, []);

  const fetchPriceOptions = async () => {
    try {
      const response = await axios.get("/api/submissions/submit");
      const submissions = response.data;

      const options = submissions.map((submission) => ({
        value: submission._id,
        label: submission.title,
        data: submission,
        view: submission.view,
      }));

      setPriceOptions(options);
    } catch (error) {
      console.error("Failed to fetch price options:", error);
      toast.error("Failed to fetch price options");
    }
  };

  const fetchStatusPrices = async () => {
    try {
      const response = await axios.get("/api/comments/comment");
      const comments = response.data;

      // Sort comments array in descending order based on date and time
      comments.sort((a, b) => {
        const dateComparison = new Date(b.date) - new Date(a.date);
        if (dateComparison === 0) {
          return new Date(b.time) - new Date(a.time);
        }
        return dateComparison;
      });

      const titles = comments.map((comment) => ({
        value: comment._id,
        label: comment.title,
        data: comment,
        remarks: comment.remarks,
        view: comment.view,
      }));
      setStatusPrices(titles);
    } catch (error) {
      console.error("Failed to fetch status prices:", error);
      toast.error("Failed to fetch status prices");
    }
  };

  const handlePriceSelection = async (selectedOption, id) => {
    try {
      await axios.put(`api/submissions/view/${id}`, {
        view: "Viewed",
      });
      const { value, data } = selectedOption;
      const {
        title,
        sender,
        date,
        tableData,
        location,
        dateRequested,
        targetDelivery,
        dateNeeded,
      } = data;
      setSelectedPriceTitle(selectedOption.label);
      navigate(`/PriceView/${value}`, {
        state: {
          submissionId: value,
          title: title,
          dateRequested: dateRequested,
          targetDelivery: targetDelivery,
          dateNeeded: dateNeeded,
          location: location,
          sender: sender,
          date: date,
          tableData: tableData,
        },
      });
    } catch (error) {
      toast.error("An error occured");
      console.log("You have encountered an error", error);
    }
  };

  const handlePriceStatus = async (selectedIndex, id) => {
    try {
      await axios.put(`api/comments/view/${id}`, {
        view: "Viewed",
      });
      const selectedOption = statusPrices[selectedIndex];
      const { data } = selectedOption;
      const {
        title,
        remarks,
        date,
        time,
        tableData,
        comment,
        location,
        dateRequested,
        targetDelivery,
        dateNeeded,
      } = data;
      setSelectedPriceStatus(selectedOption.label);

      const nextPageRoute = `/PriceStatus/${selectedOption.value}`;

      navigate(nextPageRoute, {
        state: {
          title: title,
          location: location,
          remarks: remarks,
          date: date,
          dateRequested: dateRequested,
          targetDelivery: targetDelivery,
          dateNeeded: dateNeeded,
          time: time,
          tableData: tableData,
          comment: comment,
        },
      });
    } catch (error) {
      toast.error("An error occured");
      console.log("You have encountered an error", error);
    }
  };

  return (
    <div className="side-container">
      <div className="side-sub-container-1">
        <div className="side-container-1">
          <div className="List-Price"> PRICING SUMMARY </div>
          <div className="pricing-side-info">
            {" "}
            See Summary of Submitted Pricing{" "}
          </div>
        </div>
        <div className="side-container-2">
          <div className="side-subcontainer-2">
            {priceOptions
              .map((option) => {
                const showNotificationCircle =
                  !option.view || option.view !== "Viewed";
                return (
                  <>
                    <div
                      key={option.value}
                      className="created-price"
                      onClick={() =>
                        handlePriceSelection(option, option.value)
                      }>
                      {option.label}
                      {showNotificationCircle && (
                        <div className="circle-notification-view"> </div>
                      )}
                    </div>
                  </>
                );
              })
              .reverse()}
          </div>
        </div>
      </div>
      <div className="side-sub-container-2">
        <div className="side-container-1">
          <div className="List-Price"> PRICING STATUS </div>
          <div className="pricing-side-info">
            {" "}
            Select Project to check status{" "}
          </div>
        </div>
        <div className="side-container-2">
          <div className="side-subcontainer-2">
            {statusPrices.map((statusPrice, index) => {
              const showNotificationCircles =
                !statusPrice.view || statusPrice.view !== "Viewed";
              return (
                <>
                  <div
                    key={index}
                    className={`created-price-label ${
                      statusPrice.remarks === "Approved"
                        ? "approved"
                        : "declined"
                    }`}
                    onClick={() => handlePriceStatus(index, statusPrice.value)}>
                    {statusPrice.remarks === "Approved" ? (
                      <BsFillCheckSquareFill className="BsFillCheckSquareFill-logo" />
                    ) : (
                      <FaRegTimesCircle className="FaRegTimesCircle-logo" />
                    )}
                    {statusPrice.label}
                    {showNotificationCircles && (
                      <div className="circle-notification-view"> </div>
                    )}
                  </div>
                </>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PriceSide;

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import "./PurchaseOrder.css";
import { Pagination, Stack, Box } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

function OperationDashboard() {
  const [operation, setOperation] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;
  const [isLoading, setIsLoading] = useState(true); // Initialize loading state as true
  const navigate = useNavigate();
  const [userProjectId, setUserProjectId] = useState([]);
  const [userRoles, setUserRoles] = useState([]);

  useEffect(() => {
    // Fetch user data and project data
    const fetchInitialData = async () => {
      try {
        const userResponse = await axios.get(`/api/users/getUser/${user._id}`);
        const { projectId, roles, name } = userResponse.data;

        setUserProjectId(projectId);
        setUserRoles(roles);

        console.log("User: ", name);
        console.log("User's Project ID: ", projectId);
        console.log("User Info: ", roles);

        // Fetch project data and filter based on user's role and project ID
        const projectsResponse = await axios.get("/api/projects");
        const data = projectsResponse.data;

        // Filter out projects with remark "Accomplished"
        const filteredData = data.filter(
          (project) =>
            project.remarks !== "Accomplished" &&
            project.remarks !== "Inactive" &&
            project.remarks !== "Discontinued"
        );

        // Filter data based on user's role and project ID
        const finalData = roles.includes("Site Engineer")
          ? filteredData.filter((project) =>
              projectId.includes(project.projectId)
            )
          : filteredData;

        setOperation(finalData);
        setIsLoading(false);
        console.log("Project: ", finalData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    if (user) {
      fetchInitialData();
    }
  }, [user]);

  const navigateToOperation = (order) => {
    navigate(`/opsDash/${order._id}`, {
      state: {
        id: order._id,
        name: order.name,
        projectId: order.projectId,
        location: order.location,
        items: order.items,
      },
    });
  };

  const getLogoText = (name) => {
    const words = name.split(" ");
    let logoText = "";
    if (words.length >= 1) {
      logoText += words[0][0]; // First letter of the first word
    }
    if (words.length >= 2) {
      logoText += words[1][0]; // First letter of the second word
    }
    return logoText.toUpperCase();
  };

  // Calculate the total number of pages
  const totalPages = Math.ceil(operation.length / itemsPerPage);

  // Get the current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = operation.slice(indexOfFirstItem, indexOfLastItem);

  // Function to handle page change
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
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
          <div className="admin-controller">Project Operation Dashboard</div>
        </section>
        <section className="section-back" onClick={handleGoBack}>
          <FiArrowLeft />
          <div className="back">BACK</div>
        </section>
      </div>
      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100px",

            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}>
          <CircularProgress />
        </Box>
      ) : operation.length === 0 ? (
        <div>No items to display.</div>
      ) : (
        <>
          <div className="stack-operation">
            <Stack spacing={2}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
              />
            </Stack>
          </div>
          <div className="operation-dashboard-grid">
            {currentItems.map((order) => (
              <div
                className="operation-dashboard-container"
                key={order.id}
                onClick={() => navigateToOperation(order)}>
                <div className="company-name-logo">
                  <div>{getLogoText(order.name)}</div>
                </div>
                <div className="client-name">{order.name}</div>
                <div className="client-location">{order.location}</div>
                <div className="client-subject">{order.subject}</div>
                <div className="client-projectId">ID: {order.projectId}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default OperationDashboard;

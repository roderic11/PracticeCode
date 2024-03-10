import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaTrashAlt, FaPen, FaComment } from "react-icons/fa";
import { FcOk } from "react-icons/fc";
import { toast } from "react-toastify";
import {
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import "./inventoryMain.css";
import { FiArrowLeft } from "react-icons/fi";
import { Subject } from "@mui/icons-material";
const BOM = () => {
  const [rowsPerPage, setRowsPerPage] = useState(13);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [boms, setBOMs] = useState([]);

  const [selectedBOMId, setSelectedBOMId] = useState(null);
  const [selectedBOMContent, setSelectedBOMContent] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All"); // Default to show all data

  //For Modal ------------------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  //For edititing-----
  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editId, setEditId] = useState("");

  const navigate = useNavigate();
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("/api/projects");
      const data = response.data;

      setBOMs(data);
    } catch (error) {
      console.error(error);
      setMessage("Error fetching data.");
    }
  };

  const editProject = (id, name, location, subject) => {
    setEditId(id);
    setEditName(name);
    setEditLocation(location);
    setEditSubject(subject);
    setModalOpen(true);
  };

  const openEditModal = () => {
    setModalOpen(true);
  };
  const closeEditModal = () => {
    setModalOpen(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const generateRandomTrackingNumber = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    let trackingNumber = "";
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * letters.length);
      trackingNumber += letters[randomIndex];
    }
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * numbers.length);
      trackingNumber += numbers[randomIndex];
    }
    return trackingNumber;
  };

  //-----------------

  const filteredData = boms.filter((bom) => {
    if (selectedFilter === "All") {
      return true; // Show all data
    }
    return bom.remarks.toLowerCase() === selectedFilter.toLowerCase();
  });

  const handleFilterChange = (event) => {
    setSelectedFilter(event.target.value);
  };
  // save edited Items
  const saveEdited = async (editId, e) => {
    e.preventDefault();
    const confirmation = window.confirm(
      "Are you sure you want to save edited data?"
    );
    if (!confirmation) {
      return; // Abort saving if the user cancels the confirmation
    }

    try {
      await axios.put(`/api/projects/${editId}`, {
        name: editName,
        location: editLocation,
        subject: editSubject,
      });

      toast.success("Project updated successfully.");
      fetchData(); // You need to implement this function to fetch the updated project.

      closeEditModal();
    } catch (error) {
      console.error(error);
      toast.error("Error updating project.");
      // You may want to provide an error message or take appropriate action on failure.
    }
  };
  //modified#3:
  const deleteProject = async (editId, name) => {
    try {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete project ${name}`
      );
      if (!confirmDelete) {
        return;
      }

      await axios.delete(`/api/projects/${editId}`);
      toast.success("Deleted Successfully.");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Error deleting item.");
    }
  };

  //-------------
  const createBOM = async (e) => {
    e.preventDefault();

    const confirmation = window.confirm(
      "Are you sure you want to create a new project?"
    );
    if (!confirmation) {
      return; // Abort saving if the user cancels the confirmation
    }

    if (!name || !location || !subject) {
      toast.error("Please fill in all the required fields.");
      return;
    }

    const projectId = generateRandomTrackingNumber();
    const existingProjects = boms.map((bom) => ({
      name: bom.name.trim().toLowerCase(),
      location: bom.location.trim().toLowerCase(),
    }));

    // Check if the project name and location already exist
    if (
      existingProjects.some(
        (existingProject) =>
          existingProject.name === name.toLowerCase() ||
          existingProject.location === location.toLowerCase()
      )
    ) {
      toast.error(
        "Project name and location already exist. Please choose a different name and location."
      );
      return;
    }

    try {
      const response = await axios.post("/api/projects", {
        name,
        location,
        subject,
        projectId: projectId,
        remarks: "Active",
      });

      setMessage("New project created.");

      const projectName = name;
      const siteName = location;

      console.log("projectId:", projectId);
      // Check if the project name and location already exist
      if (
        existingProjects.some(
          (existingProject) =>
            existingProject.name === name.toLowerCase() ||
            existingProject.location === location.toLowerCase()
        )
      ) {
        toast.error(
          "Project name and location already exist. Please choose a different name and location."
        );
        return;
      }

      try {
        await axios.post("/api/storages", {
          projectName,
          siteName,
          projectId: projectId,
          remark: "Active",
        });

        setMessage("New project and storage created.");

        const updatedBOMs = await axios.get("/api/projects");
        setBOMs(updatedBOMs.data);
      } catch (error) {
        console.error(error);
        setMessage("Error creating storage.");
      }
    } catch (error) {
      console.error(error);
      if (error.response) {
        setMessage(`Error creating project: ${error.response.data.message}`);
      } else if (error.request) {
        setMessage(
          "Error creating project: No response received from the server."
        );
      }
    }

    setName("");
    setLocation("");
    setSubject("");
    closeModal();
  };

  const handleGoBack = () => {
    // Use navigate(-1) to go back to the previous page in the history stack
    navigate(-1);
  };
  const handleBOMClick = (id, name) => {
    setSelectedBOMId(id, name);
  };
  const N = 0;

  return (
    <div>
      <div className="container-admin">
        <section className="section-admin">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controller">Bill of Materials</div>
        </section>
        <section className="section-back" onClick={handleGoBack}>
          <FiArrowLeft />
          <div className="back">BACK</div>
        </section>
      </div>
      <div className="bom-box">
        <div className="calend-man">
          <b> Project Archives</b>
        </div>
        <button onClick={openModal}>Create BOM</button>
        <select
          className="select-bom"
          value={selectedFilter}
          onChange={handleFilterChange}
        >
          <option value="All">Show All</option>
          <option value="Accomplished">Accomplished</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Discontinued">Discontinued</option>
        </select>
      </div>
      {modalOpen && (
        <div className="modal-overlay-admin">
          <div className="modal-content-admin">
            <br />
            <h2>Edit Bill Of Materials</h2>
            <form onSubmit={saveEdited}>
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
              <br />

              <label htmlFor="location">Location:</label>
              <input
                type="text"
                id="location"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                required
              />
              <br />

              <label htmlFor="subject">Subject:</label>
              <input
                type="text"
                id="subject"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                required
              />
              <br />
            </form>
            <button onClick={(e) => saveEdited(editId, e)}>Save Changes</button>

            <button onClick={closeEditModal}>Close</button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay-admin">
          <div className="modal-content-admin">
            <br />
            <h2>Bill of Materials</h2>
            <form onSubmit={createBOM}>
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <br />

              <label htmlFor="location">Location:</label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
              <br />

              <label htmlFor="subject">Subject:</label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
              <br />
            </form>
            <button onClick={createBOM}>Create BOM</button>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
      <div className="manpower-sub">
        <TableContainer component={Paper}>
          <div
            style={{
              maxHeight: `${rowsPerPage * 40}px`,
              overflow: "auto",
            }}
          >
            <Table size="small" aria-label="a dense table">
              <TableHead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <TableRow>
                  <TableCell
                    style={{ backgroundColor: "#146C94", color: "white" }}
                  >
                    <Typography variant="h9" fontWeight="bold">
                      Name
                    </Typography>
                  </TableCell>
                  <TableCell
                    style={{ backgroundColor: "#146C94", color: "white" }}
                  >
                    <Typography variant="h9" fontWeight="bold">
                      Location
                    </Typography>
                  </TableCell>
                  <TableCell
                    style={{ backgroundColor: "#146C94", color: "white" }}
                  >
                    <Typography variant="h9" fontWeight="bold">
                      Subject
                    </Typography>
                  </TableCell>
                  <TableCell
                    style={{ backgroundColor: "#146C94", color: "white" }}
                  >
                    <Typography variant="h9" fontWeight="bold">
                      Project ID
                    </Typography>
                  </TableCell>
                  <TableCell
                    style={{ backgroundColor: "#146C94", color: "white" }}
                  >
                    <Typography variant="h9" fontWeight="bold">
                      Status
                    </Typography>
                  </TableCell>
                  <TableCell
                    style={{ backgroundColor: "#146C94", color: "white" }}
                  >
                    <Typography variant="h9" fontWeight="bold">
                      Actions
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((bom, index) => (
                  <TableRow
                    key={bom._id}
                    onClick={() => handleBOMClick(bom._id, bom.name)}
                  >
                    <TableCell sx={{ backgroundColor: "white" }}>
                      <Link to={`/BOMDetails/${bom._id}/${bom.name}`}>
                        {bom.name}
                      </Link>
                    </TableCell>

                    <TableCell sx={{ backgroundColor: "white" }}>
                      {bom.location}
                    </TableCell>
                    <TableCell sx={{ backgroundColor: "white" }}>
                      {bom.subject}
                    </TableCell>
                    <TableCell sx={{ backgroundColor: "white" }}>
                      {bom.projectId}
                    </TableCell>
                    <TableCell sx={{ backgroundColor: "white" }}>
                      <div
                        className="daily-mini-container-BOM"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          color:
                            bom.remarks === "Accomplished"
                              ? "green"
                              : bom.remarks === "Active"
                              ? "orange"
                              : bom.remarks === "Inactive"
                              ? "red"
                              : bom.remarks === "Discontinued"
                              ? "Lightgrey"
                              : "inherit",
                          backgroundColor:
                            bom.remarks === "Accomplished"
                              ? "#c4e898"
                              : bom.remarks === "Active"
                              ? "#faf5c9"
                              : bom.remarks === "Inactive"
                              ? "#ffcccb"
                              : bom.remarks === "Discontinued"
                              ? "Darkgrey"
                              : "inherit",
                        }}
                      >
                        <div
                          className="status-circle"
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "40%",
                            marginRight: "8px",
                            backgroundColor:
                              bom.remarks === "Accomplished"
                                ? "green"
                                : bom.remarks === "Active"
                                ? "orange"
                                : bom.remarks === "Inactive"
                                ? "red"
                                : bom.remarks === "Discontinued"
                                ? "grey"
                                : "inherit",
                          }}
                        />
                        {bom.remarks}
                      </div>
                    </TableCell>
                    <TableCell>
                      <FaPen
                        className="edit-boms"
                        onClick={() =>
                          editProject(
                            bom._id,
                            bom.name,
                            bom.location,
                            bom.subject
                          )
                        }
                      />
                      <FaTrashAlt
                        className="edit-boms"
                        onClick={() => deleteProject(bom._id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TableContainer>
      </div>
    </div>
  );
};

export default BOM;

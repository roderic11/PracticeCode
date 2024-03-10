import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiArrowLeft } from "react-icons/fi";
import { AiTwotoneDelete, AiTwotoneEdit } from "react-icons/ai";
import {
  Modal,
  Fade,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import "./EquipmentsInstalled.css";
import { toast } from "react-toastify";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 450,
  height: 240,
  bgcolor: "background.paper",
  borderRadius: "10px",
  boxShadow: 24,
  padding: "20px",
  backgroundColor: "white",
};

const ManpowerInfo = () => {
  const [showModal, setShowModal] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [personnelName, setPersonnelName] = useState("");
  const [arbitraryNumber, setArbitraryNumber] = useState("");
  const [personnelData, setPersonnelData] = useState([]);
  const [editIndex, setEditIndex] = useState(-1); // Index of the row being edited
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPersonnelData();
  }, []);

  const fetchPersonnelData = async () => {
    try {
      const response = await axios.get("/api/manpowerInfo/read");
      setPersonnelData(response.data);
    } catch (error) {
      console.error("Error fetching personnel data:", error);
    }
  };

  const addPersonnel = async () => {
    setShowModal(true);
    setEditIndex(-1); // Reset the edit index when adding new personnel
  };

  const closeModal = () => {
    setShowModal(false);
    setPersonnelName("");
    setArbitraryNumber("");
    setEditIndex(-1); // Reset the edit index when closing the modal
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "personnelName") {
      setPersonnelName(value);
    } else if (name === "arbitraryNumber") {
      setArbitraryNumber(value.trim()); // Update the state variable correctly
    }
  };

  const handleAddPersonnelSubmit = async () => {
    // Check for missing fields
    if (!personnelName.trim() || !arbitraryNumber.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    // Check if arbitraryNumber is a negative value
    if (Number(arbitraryNumber) < 0) {
      toast.error("Arbitrary Number must be a non-negative value.");
      return;
    }
    // Confirmation before submitting
    const confirmed = window.confirm("Are you sure you want to submit it?");
    if (!confirmed) {
      return;
    }

    const newPersonnel = {
      name: personnelName.trim(),
      arbitraryNumber: arbitraryNumber,
    };

    if (editIndex !== -1) {
      // Update existing personnel data
      try {
        await axios.put(
          `/api/manpowerInfo/updateManpowerInfo/${personnelData[editIndex]._id}`,
          newPersonnel
        );
        const updatedPersonnelData = personnelData.map((personnel, index) =>
          index === editIndex ? newPersonnel : personnel
        );
        setPersonnelData(updatedPersonnelData);
        toast.success("Saved Changes!");
      } catch (error) {
        console.error("Error updating personnel:", error);
      }
    } else {
      // Check if personnel with the same name already exists
      const existingPersonnel = personnelData.find(
        (personnel) =>
          personnel.name.trim().toLowerCase() ===
          newPersonnel.name.toLowerCase()
      );

      if (existingPersonnel) {
        alert("Personnel with the same name already exists.");
        return;
      }

      // Add new personnel data
      try {
        await axios.post("/api/manpowerInfo/create", newPersonnel);
        setPersonnelData([...personnelData, newPersonnel]);
        toast.success("Saved Successfully!");
      } catch (error) {
        console.error("Error creating personnel:", error);
      }
    }

    setPersonnelName("");
    setArbitraryNumber("");
    setEditIndex(-1);
    setShowModal(false);
    fetchPersonnelData();
  };

  const deletePersonnel = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await axios.delete(`/api/manpowerInfo/delete/${id}`);
        const updatedPersonnelData = personnelData.filter(
          (personnel) => personnel._id !== id
        );
        setPersonnelData(updatedPersonnelData);
        toast.success("Deleted Successfully!");
      } catch (error) {
        console.error("Error deleting personnel:", error);
      }
    }
  };

  const editPersonnel = (index) => {
    const { name, arbitraryNumber } = filteredPersonnelData[index];
    const originalIndex = personnelData.findIndex(
      (personnel) =>
        personnel.name === name && personnel.arbitraryNumber === arbitraryNumber
    );
    setPersonnelName(name);
    setArbitraryNumber(arbitraryNumber);
    setEditIndex(originalIndex);
    setShowModal(true);
  };
  const handleGoBack = () => {
    window.history.back();
  };
  const filteredPersonnelData = personnelData
    .filter((personnel) =>
      personnel.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div>
      <div className="container-admin">
        <section className="section-admin">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controller">Manpower Information</div>
        </section>
        <section className="section-back" onClick={handleGoBack}>
          <FiArrowLeft />
          <div className="back">BACK</div>
        </section>
      </div>
      <div className="search-maninfo">
        <div>
          <button className="addP" onClick={addPersonnel}>
            Add Personnel
          </button>
        </div>
        <input
          type="text"
          placeholder="Search Personnel"
          className="input-maninfo"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {filteredPersonnelData.length > 0 && (
        <TableContainer component={Paper}>
          <div
            style={{
              maxHeight: `${rowsPerPage * 53}px`,
              overflow: "auto",
            }}>
            <Table
              sx={{ minWidth: 650 }}
              size="small"
              aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>Name</b>
                  </TableCell>
                  <TableCell>
                    <b>Number</b>
                  </TableCell>
                  <TableCell>
                    <b>Actions</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPersonnelData.map((personnel, index) => (
                  <TableRow
                    key={index}
                    style={{
                      backgroundColor: index % 2 === 0 ? "white" : "#f0f0f0",
                    }}>
                    <TableCell>{personnel.name}</TableCell>
                    <TableCell>{personnel.arbitraryNumber}</TableCell>
                    <TableCell>
                      <AiTwotoneEdit
                        className="icon-maninfo1"
                        onClick={() => editPersonnel(index)}
                      />
                      <AiTwotoneDelete
                        className="icon-maninfo"
                        onClick={() =>
                          deletePersonnel(personnel._id, personnel.name)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TableContainer>
      )}

      <Modal open={showModal} onClose={closeModal}>
        <Fade in={showModal}>
          <Box sx={{ ...modalStyle }}>
            <Typography variant="h6" mb={2}>
              {editIndex !== -1 ? "Edit Personnel" : "Add Personnel"}
            </Typography>
            <div>Name: </div>
            <input
              type="text"
              name="personnelName"
              value={personnelName}
              onChange={handleInputChange}
            />
            <div>Arbitrary Number: </div>
            <input
              type="number"
              name="arbitraryNumber"
              value={arbitraryNumber}
              onChange={handleInputChange}
            />
            <div>
              <button onClick={handleAddPersonnelSubmit}>
                {editIndex !== -1 ? "Update" : "Submit"}
              </button>
              <button onClick={closeModal}>Cancel</button>
            </div>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
};

export default ManpowerInfo;

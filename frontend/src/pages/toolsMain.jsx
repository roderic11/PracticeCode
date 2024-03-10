import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EquipmentsInstalled.css";
import { toast } from "react-toastify";
import { BiPlus } from "react-icons/bi";
import Select from "react-select";
import { AiFillCloseCircle, AiFillControl } from "react-icons/ai";
import { FiArrowLeft, FiPlus, FiTrash } from "react-icons/fi";
import { FaPeopleCarry } from "react-icons/fa";
import {
  BsArrowDownShort,
  BsArrowUpShort,
  BsCalendarDate,
} from "react-icons/bs";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  Button,
  Fade,
  Collapse,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tab,
  Tabs,
} from "@mui/material";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1490,
  height: 700,
  bgcolor: "background.paper",
  borderRadius: "10px",
  boxShadow: 24,
  padding: "20px",
  backgroundColor: "#f4f4f4",
};
const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options);
};

const ToolsMain = () => {
  const [value, setValue] = React.useState(0);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [tableData, setTableData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [comment, setComment] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [secondTableData, setSecondTableData] = useState([]);
  const [storageData, setStorageData] = useState([]);
  const [manInfo, setManInfo] = useState([]);
  const { id, name, location, items, projectId } = useLocation().state || {};
  const [selectedItem, setSelectedItem] = useState("");
  const [maxRows, setMaxRows] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTabDate, setSelectedTabDate] = useState(null);
  const [thirdTableData, setThirdTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [valueTab, setValueTab] = React.useState(0);
  const [openRowIndex, setOpenRowIndex] = useState(null);
  const [dropdown, setDropdown] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [workTime, setWorkTime] = useState("");
  const [workActivity, setWorkActivity] = useState("");
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [personComment, setPersonComment] = useState("");
  const [monitoringTable, setMonitoringTable] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Set the initial items state using the tableData prop
    setSelectedItem(items || []);
    setSecondTableData(items || []);
  }, [items]);
  useEffect(() => {
    // Retrieve the selected tab index from local storage
    const storedTab = localStorage.getItem("selectedTab");
    const parsedTab = parseInt(storedTab, 10);

    if (!isNaN(parsedTab)) {
      setValueTab(parsedTab);
    }
  }, []);
  const options = storageData[0]?.siteTable.map((item, itemIndex) => ({
    value: item.ItemName,
    label: item.ItemName,
  }));
  const handleItemChange = (index, event) => {
    const newTableData = [...tableData];
    const selectedItem = event ? event.value : "";
    const selectedStorageItem = storageData[0]?.siteTable.find(
      (item) => item.ItemName === selectedItem
    );

    if (selectedStorageItem) {
      newTableData[index] = {
        ...newTableData[index],
        item: selectedItem,
        category: selectedCategory,
        description: selectedStorageItem.description,
        number: 0,
      };
    } else {
      newTableData[index] = {
        ...newTableData[index],
        item: selectedItem,
        description: "",
        number: 0,
      };
    }

    setTableData(newTableData);
  };
  useEffect(() => {
    const fetchManpowerInfo = async () => {
      try {
        const response = await axios.get("/api/manpowerInfo/read");
        const data = response.data;
        const manInfos = data.map((man) => ({
          name: man.name,
          arbitraryNumber: man.arbitraryNumber,
        }));
        setManInfo(manInfos);
      } catch (error) {
        console.error("Error fetching man info", error);
      }
    };
    fetchManpowerInfo();
  }, []);
  // Storage Database to fetch the data
  const fetchStorageData = async (location) => {
    try {
      const response = await axios.get(`/api/storages?siteName=${location}`);
      const data = response.data;
      const storages = data
        .filter((item) => item.siteName === location)
        .map((storage) => ({
          id: storage._id,
          siteName: storage.siteName,
          projectName: storage.projectName,
          siteTable: storage.siteTable
            .filter((item) => item.category.toLowerCase() === "tools")
            .map((item) => ({
              ItemName: item.ItemName,
              unit: item.unit,
              quantity: item.quantity,
              supplier: item.supplier,
              unitCost: item.unitCost,
              materialCost: item.materialCost,
              category: item.category,
            })),
        }));
      // Update the maxRows state based on the number of ItemName
      const maxRows = storages[0]?.siteTable.length || 0;
      setMaxRows(maxRows);
      setStorageData(storages);
      console.log("Data from Storages", storages);
      console.log("Site Table", storages[0].siteTable); // Log the siteTable value
    } catch (error) {
      console.error("Error fetching storage data", error);
    }
  };
  const fetchToolsInstalledData = async () => {
    try {
      const response = await axios.get(
        `/api/opsTools/read?projectId=${projectId}`
      );
      const data = response.data;
      const equipmentData = data.find(
        (equipment) => equipment.projectId === projectId
      );
      const monitoringToolsTable = equipmentData.monitoringToolsTable;
      console.log("MONITORING TOOLS TABLE: ", monitoringToolsTable);
      setMonitoringTable(monitoringToolsTable);

      if (equipmentData) {
        const formattedEquipmentTable = equipmentData.toolsTable.flatMap(
          (tools) =>
            tools.toolsItemsTable.map((item) => ({
              ToolsItemName: item.ToolsItemName,
              ToolsSN: item.ToolsSN,
              ToolsRemarks: item.ToolsRemarks,
              ToolsInCharge: item.ToolsInCharge,
              ToolsStart: item.ToolsStart,
              ToolsEnd: item.ToolsEnd,
              workDate: tools.workDate,
              workActivity: tools.workActivity,
              personnel: tools.personnel,
              workTime: tools.workTime,
            }))
        );

        setThirdTableData(formattedEquipmentTable);
      } else {
        setThirdTableData([]);
      }

      console.log("Fetched equipment installed data:", thirdTableData);
    } catch (error) {
      console.error("Error fetching equipment installed data:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (projectId) {
      fetchToolsInstalledData();
    }

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  useEffect(() => {
    if (location) {
      fetchStorageData(location);
    }
  }, [location]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`/api/projects/${id}`);
        const itemsData = response.data;
        setDropdown(itemsData);
      } catch (error) {
        console.error(error);
        toast.error("Error fetching project details.");
      }
    };

    fetchItems();
  }, [id]);

  const handleAddRow = () => {
    setTableData((prevState) => [
      ...prevState,
      { itemName: "", description: "", number: "" },
    ]);
  };

  const deleteRow = (index) => {
    const deletedItem = tableData[index]?.item;

    setTableData((prevState) => prevState.filter((_, i) => i !== index));

    setComment((prevState) => {
      const newComment = { ...prevState };
      delete newComment[deletedItem];
      return newComment;
    });
  };

  const validateInputs = () => {
    const existingDates = thirdTableData.map((item) =>
      formatDate(item.workDate)
    );

    if (!selectedDate) {
      toast.error("Please select a date");
      return false;
    }
    if (existingDates.includes(formatDate(selectedDate))) {
      toast.error("The selected date already exists in the tabs");
      return false;
    }
    if (!workActivity) {
      toast.error("Please enter a work activity");
      return false;
    }
    if (!workTime) {
      toast.error("Please enter a work time");
      return false;
    }
    if (tableData.length === 0) {
      toast.error("Please choose items before saving");
      return false;
    }
    for (const row of tableData) {
      if (
        !row.item ||
        //!row.tagNumber ||
        //!row.remarks ||
        !row.nameBorrower ||
        !row.startTime ||
        !row.endTime
      ) {
        toast.error("Please fill in all the required fields for each row");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.get(
        `/api/opsTools/read?projectId=${projectId}`
      );
      const existingEquipmentData = response.data.find(
        (storage) => storage.projectId === projectId
      );

      const newToolsItemTable = tableData
        .filter((row) => row.item) // Filter out rows without an item selected
        .map((row) => {
          const matchedTableData = storageData[0]?.siteTable.find(
            (item) => item.ItemName === row.item
          );

          return {
            ToolsItemName: row.item,
            ToolsSN: row.tagNumber || "N/A",
            ToolsRemarks: row.remarks || "N/A",
            ToolsInCharge: row.nameBorrower,
            ToolsStart: row.startTime,
            ToolsEnd: row.endTime,
          };
        });

      if (!existingEquipmentData) {
        // Create a new projectId and equipmentTable
        const equipmentData = {
          projectId: projectId,
          projectName: name,
          projectLocation: location,
          toolsTable: [
            {
              personnel: user.name,
              workDate: selectedDate,
              workTime: workTime,
              workActivity: workActivity,
              toolsItemsTable: newToolsItemTable,
            },
          ],
        };

        const createResponse = await axios.post(
          "/api/opsTools/create",
          equipmentData
        );

        // Handle success message or any other logic
        toast.success("Equipment created successfully");
      } else {
        // Create a new equipment table with new items
        const updatedEquipmentTable = [
          ...existingEquipmentData.toolsTable,
          {
            personnel: user.name,
            workDate: selectedDate,
            workTime: workTime,
            workActivity: workActivity,
            toolsItemsTable: newToolsItemTable,
          },
        ];

        const { _id } = existingEquipmentData;

        const updateResponse = await axios.put(
          `/api/opsTools/updateTools/${_id}`,
          {
            ...existingEquipmentData,
            toolsTable: updatedEquipmentTable,
          }
        );

        // Handle success message or any other logic

        toast.success("Tools updated successfully");
      }
      fetchToolsInstalledData();
      // Fetch tools installed data only once after the update
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Failed to save changes");
    }
  };

  const handleDropdownChange = (event, index, column) => {
    const { value } = event.target;
    setTableData((prevState) => {
      const newData = [...prevState];
      newData[index][column] = value;
      return newData;
    });
  };

  const handleSaveConfirmation = () => {
    const isConfirmed = window.confirm("Are you sure you want to save?");

    if (isConfirmed) {
      if (!validateInputs()) {
        return;
      }

      setTableData([]);
      setSelectedDate("");
      setWorkTime("");
      setWorkActivity("");

      handleSubmit();
      setModalOpen(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  const handleTabClick = (date) => {
    const index = tabsDates.findIndex((tabDate) =>
      formatDate(tabDate).toLowerCase().includes(searchQuery.toLowerCase())
    );

    setValueTab(index !== -1 ? index : 0);
    setSelectedTabIndex(index !== -1 ? index : 0);

    setSelectedTabDate(date);
  };
  const handleChange = (date) => {
    setValueTab();
  };
  const handleModalClick = async () => {
    try {
      // Fetch storage data for the current location
      await fetchStorageData(location);
      setModalOpen(true);
    } catch (error) {
      console.error("Error fetching storage data:", error);
    }
  };

  const convertToStandardTime = (time) => {
    const splitTime = time.split(":");
    const hours = parseInt(splitTime[0]);
    const minutes = parseInt(splitTime[1]);

    let formattedTime = "";

    if (hours === 0) {
      formattedTime = `12:${minutes.toString().padStart(2, "0")} AM`;
    } else if (hours < 12) {
      formattedTime = `${hours}:${minutes.toString().padStart(2, "0")} AM`;
    } else if (hours === 12) {
      formattedTime = `12:${minutes.toString().padStart(2, "0")} PM`;
    } else {
      const standardHours = hours - 12;
      formattedTime = `${standardHours}:${minutes
        .toString()
        .padStart(2, "0")} PM`;
    }

    return formattedTime;
  };

  const handleInputChange = (event, index, inputKey) => {
    const { value } = event.target;
    setTableData((prevState) => {
      const newData = [...prevState];
      newData[index][inputKey] = value;
      return newData;
    });
  };
  const handleRowClick = (itemIndex) => {
    setOpenRowIndex((prevExpandedRow) =>
      prevExpandedRow === itemIndex ? null : itemIndex
    );
  };

  const filteredThirdTableData = thirdTableData.filter((item) =>
    formatDate(item.workDate)
      .toLowerCase()
      .includes(
        selectedTabDate ? formatDate(selectedTabDate).toLowerCase() : ""
      )
  );

  // Filter out duplicate workActivity and workTime values
  const uniqueWorkActivities = Array.from(
    new Set(filteredThirdTableData.map((item) => item.workActivity))
  );
  const uniqueWorkTimes = Array.from(
    new Set(filteredThirdTableData.map((item) => item.workTime))
  );
  const combinedData = thirdTableData.map((item) => ({
    workDate: item.workDate,
    workActivity: item.workActivity,
    workTime: item.workTime,
    toolsItems: item.toolsItemsTable,
  }));

  // Add the selected item to each row
  const dataWithSelectedItem = combinedData.map((item) => ({
    ...item,
    selectedItem: selectedItem.find(
      (selectedItem) => selectedItem.workDate === item.workDate
    ),
  }));

  // Combine all the items from toolsItems into a single array for the table
  const tableItems = dataWithSelectedItem.reduce((acc, curr) => {
    if (Array.isArray(curr.selectedItem)) {
      return [...acc, ...curr.selectedItem];
    }
    return acc;
  }, []);

  const tabsDates = Array.from(
    new Set(combinedData.map((item) => item.workDate))
  );

  tabsDates.sort((a, b) => new Date(b) - new Date(a));
  const filteredTableItems = selectedTabDate
    ? tableItems.filter((item) => item.workDate === selectedTabDate)
    : tableItems;

  const getCurrentDate = () => {
    const currentDate = new Date().toLocaleDateString("en-US");
    return currentDate;
  };

  const getCurrentTime = () => {
    const currentTime = new Date().toLocaleTimeString("en-US");
    return currentTime;
  };
  const handleDelete = async () => {
    if (!selectedTabDate) {
      toast.error("Please select a date to delete.");
      return;
    }
    if (!personComment) {
      setOpenModalDelete(true);
      toast.error("Please enter your changes!");
      return;
    }
    try {
      const response = await axios.get(
        `/api/opsTools/read?projectId=${projectId}`
      );
      const toolsData = response.data.find(
        (equipment) => equipment.projectId === projectId
      );

      if (!toolsData) {
        toast.error("No tools data found for the selected date.");
        return;
      }

      const toolsIndex = toolsData.toolsTable.findIndex(
        (tools) => formatDate(tools.workDate) === formatDate(selectedTabDate)
      );

      if (toolsIndex === -1) {
        toast.error("No tools data found for the selected date.");
        return;
      }

      // Remove the selected entry from the toolsTable
      toolsData.toolsTable.splice(toolsIndex, 1);

      const modifiedInformation = {
        dateModified: getCurrentDate(),
        timeModified: getCurrentTime(),
        personModified: user.name,
        dateUsedModified: formatDate(selectedTabDate),
        personComment: personComment,
      };

      const monitoringToolsTable = toolsData.monitoringToolsTable || [];
      monitoringToolsTable.push(modifiedInformation);

      // Update the toolsData on the server
      await axios.put(`/api/opsTools/updateTools/${toolsData._id}`, {
        toolsTable: toolsData.toolsTable,
        monitoringToolsTable: monitoringToolsTable,
      });

      setPersonComment("");
      setOpenModalDelete(false);
      toast.success("Tools table deleted successfully");

      // Fetch the updated tools installed data after deletion
      fetchToolsInstalledData();
    } catch (error) {
      console.error("Error deleting tools table:", error);
      toast.error("Failed to delete tools table");
    }
  };

  const DeleteConfirmationModal = () => {
    setOpenModalDelete(true);
  };
  const handleDeleteConfirmation = () => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete ${formatDate(selectedTabDate)} ?`
    );

    if (isConfirmed) {
      handleDelete();
    }
  };
  const navigateToMancost = (order) => {
    navigate(`/ManpowerCostMain/${projectId}/${id}`, {
      state: {
        id: id,
        name: name,
        projectId: projectId,
        location: location,
        items: items,
      },
    });
  };
  const navigateToEquipment = (order) => {
    navigate(`/equipment/${id}`, {
      state: {
        id: id,
        name: name,
        projectId: projectId,
        location: location,
        items: items,
      },
    });
  };
  const handleGoBack = () => {
    window.history.back();
  };
  const handleCancelDeleteClick = () => {
    setOpenModalDelete(false);
  };
  const hasMatchingDates = monitoringTable.some(
    (matchingMonitor) =>
      matchingMonitor.dateUsedModified === formatDate(selectedTabDate)
  );
  const handleCancelHistoryClick = () => {
    setSidebarOpen(false);
  };
  return (
    <div>
      <div>
        <div className="container-admin">
          <section className="section-admin">
            <div className="side-line" />
            <div className="side-lines" />
            <div className="admin-controller">Tools: {name}</div>
          </section>
          <section className="section-back" onClick={handleGoBack}>
            <FiArrowLeft />
            <div className="back">BACK</div>
          </section>
        </div>
        {openModalDelete && (
          <div className="modal">
            <div className="item-overlay3">
              <div className="title-access">Fill in your changes: </div>

              <p className="yes-info-delete">
                Before deleting, kindly provide some information about the
                changes you want to make on{" "}
                {formatDate(selectedTabDate) || "(Select Date)"}.
              </p>
              <textarea
                className="text-area-comment-delete"
                placeholder="Enter your changes..."
                value={personComment}
                onChange={(e) => setPersonComment(e.target.value)}
              />
              <div className="modal-buttons">
                <button onClick={handleDeleteConfirmation}>Continue</button>
                <button onClick={handleCancelDeleteClick}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        <div className="purchase-order-box-equip">
          <div className="purchase-order-subbox-equip">
            <div className="Project-details">PROJECT DETAILS</div>
            <div className="grid-item">
              <div>Project Name: {name} </div>
            </div>
            <div className="grid-container-equip">
              <div className="grid-item-equip">
                <div>Site Name: {location} </div>
              </div>
              <div className="grid-item-equip">
                <div>Project ID: {projectId} </div>
              </div>

              <div
                className="mancost-button"
                onClick={() => handleModalClick()}>
                <FiPlus className="fiplus-ops" />
                Tools used for today
              </div>

              {selectedTabDate && (
                <div className="Fi-trash" onClick={DeleteConfirmationModal}>
                  <FiTrash />
                  Delete
                </div>
              )}
            </div>
          </div>

          <div className="purchase-order-input-container-tools">
            {selectedTabDate ? (
              <React.Fragment>
                {uniqueWorkActivities.map((workActivity, index) => (
                  <div
                    key={`workActivity-${index}`}
                    className="purchase-order-input-container-tools">
                    <div className="Project-details">WORK ACTIVITY</div>
                    <div className="project-details-man">{workActivity}</div>
                  </div>
                ))}

                {/* Render unique workTime values */}
                {uniqueWorkTimes.map((workTime, index) => (
                  <div
                    key={`workTime-${index}`}
                    className="purchase-order-input-container-tools">
                    <div className="Project-details">WORK TIME</div>
                    <div className="project-details-man">{workTime}</div>
                  </div>
                ))}
              </React.Fragment>
            ) : (
              // Show a message if no date is selected
              <div className="pls-select-date">Please select a date.</div>
            )}
          </div>
          <div className="purchase-order-input-container-tools2">
            <div className="Project-details">SEE OTHER ACTIVITIES</div>
            <div className="purchase-order-input-container-tools1">
              <div
                className="daily-mini-container"
                onClick={() => navigateToMancost()}>
                <FaPeopleCarry className="Fapeoplecarry-daily-acc" />
                Manpower Cost
              </div>
              <div
                className="daily-mini-container-2"
                onClick={() => navigateToEquipment()}>
                <AiFillControl className="Fapeoplecarry-daily-acc-2" />
                Equipment
              </div>
            </div>
            <div className="Project-details">SEE TOOLS USED BY DATE</div>
            <input
              type="search"
              placeholder="Search Work Date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-track"
            />
            <Box
              sx={{
                maxWidth: { xs: 320, sm: 480 },
                minWidth: { xs: 320, sm: 480 },
                boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;",
                padding: "2px",
                bgcolor: "background.paper",
                border: "1px solid #146C94",
                borderRadius: "6px",
              }}>
              <Tabs
                value={valueTab}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="scrollable auto tabs example">
                {tabsDates
                  .filter((date) =>
                    formatDate(date)
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  )
                  .map((date, index) => (
                    <Tab
                      key={index}
                      label={formatDate(date)}
                      onClick={() => handleTabClick(date)} // Use handleChange here
                    />
                  ))}
              </Tabs>
            </Box>
          </div>
        </div>
      </div>
      {sidebarOpen && (
        <div className="modal">
          <div className="item-overlay4">
            <div className="title-access">These are the changes you made.</div>
            <div className="box-modal-ops-changes">
              {monitoringTable
                .map((matchingMonitor) => {
                  if (
                    matchingMonitor.dateUsedModified ===
                    formatDate(selectedTabDate)
                  ) {
                    return (
                      <Box
                        sx={{
                          maxWidth: {
                            xs: 320,
                            sm: 480,
                          },
                          bgcolor: "background.paper",
                          minWidth: {
                            xs: 320,
                            sm: 480,
                          },
                          boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;",
                          padding: "6px",
                          border: "1px solid #146C94",
                          borderRadius: "6px",
                        }}
                        margin={1}
                        key={matchingMonitor.dateModified}>
                        <Typography
                          gutterBottom
                          component="div"
                          sx={{ fontSize: "13px" }} // Change the font size here
                        >
                          Modified by: <b>{matchingMonitor.personModified}</b>
                        </Typography>
                        <Typography
                          gutterBottom
                          component="div"
                          sx={{ fontSize: "13px" }} // Change the font size here
                        >
                          Date Modified:{" "}
                          <b>{formatDate(matchingMonitor.dateModified)}</b>
                        </Typography>
                        <Typography
                          gutterBottom
                          component="div"
                          sx={{ fontSize: "13px" }} // Change the font size here
                        >
                          Time Modified: <b>{matchingMonitor.timeModified}</b>
                        </Typography>
                        <Typography
                          gutterBottom
                          component="div"
                          sx={{ fontSize: "13px" }} // Change the font size here
                        >
                          Changes: <b>{matchingMonitor.personComment}</b>
                        </Typography>
                        <Typography
                          gutterBottom
                          component="div"
                          sx={{ fontSize: "13px" }} // Change the font size here
                        >
                          Modified Date Used:{" "}
                          <b>{matchingMonitor.dateUsedModified}</b>
                        </Typography>
                      </Box>
                    );
                  }
                  return null;
                })
                .reverse()}
            </div>
            <div className="modal-buttons">
              <button onClick={handleCancelHistoryClick}>Exit</button>
            </div>
          </div>
        </div>
      )}
      <div>
        <div>
          <TableContainer component={Paper}>
            <div>
              {hasMatchingDates && (
                <Button
                  sx={{ margin: "8px" }}
                  variant="outlined"
                  onClick={() => setSidebarOpen(true)}>
                  View Changes
                </Button>
              )}
            </div>
            <div
              style={{
                maxHeight: `${rowsPerPage * 53}px`,
                overflow: "auto",
              }}>
              <Table
                sx={{ minWidth: 650 }}
                size="small"
                aria-label="a dense table">
                <TableHead style={{ position: "sticky", top: 0 }}>
                  <TableRow>
                    <TableCell>
                      <strong>See Details</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Tools Name</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Tool Tag/Serial Number</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Personnel In-charge</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Start Time</strong>
                    </TableCell>
                    <TableCell>
                      <strong>End Time</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Work Date</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {thirdTableData
                    .filter((item) =>
                      formatDate(item.workDate)
                        .toLowerCase()
                        .includes(
                          selectedTabDate
                            ? formatDate(selectedTabDate).toLowerCase()
                            : ""
                        )
                    )
                    .map((item, itemIndex) => (
                      <React.Fragment key={itemIndex}>
                        <TableRow
                          onClick={() => handleRowClick(itemIndex)}
                          style={{
                            backgroundColor:
                              itemIndex % 2 === 0 ? "white" : "#f0f0f0",
                          }}>
                          <TableCell>
                            {openRowIndex === itemIndex ? (
                              <BsArrowDownShort className="icons-equip" />
                            ) : (
                              <BsArrowUpShort className="icons-equip" />
                            )}
                          </TableCell>
                          <TableCell
                            style={{
                              maxWidth: "200px",
                              whiteSpace: "wrap",
                            }}>
                            {item.ToolsItemName}
                          </TableCell>
                          <TableCell>{item.ToolsSN}</TableCell>
                          <TableCell>{item.ToolsInCharge}</TableCell>
                          <TableCell>
                            {convertToStandardTime(item.ToolsStart)}
                          </TableCell>
                          <TableCell>
                            {convertToStandardTime(item.ToolsEnd)}
                          </TableCell>
                          <TableCell>{formatDate(item.workDate)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            style={{ paddingBottom: 0, paddingTop: 0 }}
                            colSpan={7}>
                            <Collapse
                              in={openRowIndex === itemIndex}
                              timeout="auto"
                              unmountOnExit>
                              <Box margin={1}>
                                <Typography gutterBottom component="div">
                                  Tool Detail for <b>{item.ToolsItemName}</b>
                                </Typography>
                                <div className="collapse-detail">
                                  {item.ToolsRemarks}
                                </div>
                                <Typography gutterBottom component="div">
                                  Submitted By: <b>{item.personnel}</b>
                                </Typography>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                </TableBody>
              </Table>
            </div>
            <TablePagination
              style={{ position: "sticky", top: 0 }}
              component="div"
              count={thirdTableData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </div>
      </div>
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description">
        <Box sx={modalStyle}>
          <Fade in={modalOpen}>
            <div style={{ maxHeight: "650px", overflowY: "auto" }}>
              <div className="purchase-order-box-equip">
                <section className="section-admin-man">
                  <div className="side-line-man" />
                  <div className="side-lines-man" />
                  <div className="admin-controller-man">
                    TOOLS USED FOR TODAY
                  </div>
                </section>

                <div>
                  <div className="text-date-installed">Date Used:</div>
                  <input
                    className="search-input-track"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div className="work-details">
                  <div>
                    <div className="text-date-installed">Work Time: </div>
                    <input
                      type="text"
                      className="search-input-track-activity-input"
                      placeholder="Enter Work Time..."
                      value={workTime}
                      onChange={(event) => setWorkTime(event.target.value)}
                    />
                  </div>
                </div>
                <div className="work-details">
                  <div className="text-date-installed">Work Activity: </div>
                  <textarea
                    type="text"
                    placeholder="Enter Work Activity..."
                    className="search-input-track-activity"
                    value={workActivity}
                    onChange={(event) => setWorkActivity(event.target.value)}
                  />
                </div>
              </div>

              <AiFillCloseCircle
                onClick={handleCloseModal}
                className="AiFillCloseCircle-ops "
              />
              <TableContainer component={Paper}>
                <div
                  style={{
                    maxHeight: `${rowsPerPage * 53}px`,
                    minHeight: `450px`,
                    overflow: "auto",
                    marginRight: "5px",
                  }}>
                  <Table
                    sx={{ minWidth: 650 }}
                    size="small"
                    aria-label="a dense table">
                    <TableHead
                      style={{ position: "sticky", top: 0, zIndex: 1 }}>
                      <TableRow>
                        <TableCell>
                          <strong>Tools Name</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Unit</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Tag Number</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Remarks</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Personnel In-Charge</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Start Time</strong>
                        </TableCell>
                        <TableCell>
                          <strong>End Time</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Action</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tableData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Select
                              options={options}
                              value={
                                tableData[index]?.item
                                  ? {
                                      value: tableData[index].item,
                                      label: tableData[index].item,
                                    }
                                  : null
                              }
                              isClearable
                              onChange={(selectedOption) =>
                                handleItemChange(index, selectedOption)
                              }
                              placeholder="Select Tool"
                              styles={{
                                container: (provided) => ({
                                  ...provided,
                                  maxWidth: "200px",
                                  whiteSpace: "wrap",
                                }),
                              }}
                            />
                          </TableCell>
                          {tableData[index]?.item && (
                            <React.Fragment>
                              <TableCell>
                                {
                                  storageData[0]?.siteTable.find(
                                    (item) =>
                                      item.ItemName === tableData[index]?.item
                                  )?.unit
                                }
                              </TableCell>

                              <TableCell>
                                <input
                                  placeholder="Enter Tag Number"
                                  type="text"
                                  value={row.tagNumber || "N/A"}
                                  onChange={(event) =>
                                    handleInputChange(event, index, "tagNumber")
                                  }
                                />
                              </TableCell>

                              <TableCell>
                                <textarea
                                  placeholder="Enter Remarks"
                                  className="text-area-comment"
                                  type="text"
                                  value={row.remarks || "N/A"}
                                  onChange={(event) =>
                                    handleInputChange(event, index, "remarks")
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <select
                                  className="select-category-man"
                                  value={row.nameBorrower}
                                  onChange={(event) =>
                                    handleDropdownChange(
                                      event,
                                      index,
                                      "nameBorrower"
                                    )
                                  }>
                                  <option value="">Select Manpower</option>
                                  {manInfo.map((man, index) => (
                                    <option key={index} value={man.name}>
                                      {man.name}
                                    </option>
                                  ))}
                                </select>
                              </TableCell>
                              <TableCell>
                                <input
                                  className="startTime-ops"
                                  type="time"
                                  value={row.startTime}
                                  onChange={(event) =>
                                    handleInputChange(event, index, "startTime")
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <input
                                  className="startTime-ops"
                                  type="time"
                                  value={row.endTime}
                                  onChange={(event) =>
                                    handleInputChange(event, index, "endTime")
                                  }
                                />
                              </TableCell>
                            </React.Fragment>
                          )}
                          <TableCell>
                            <button
                              className="equipDelButton"
                              onClick={() => deleteRow(index)}>
                              X
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TableContainer>

              <div className="button-container">
                <button className="add-row-button" onClick={handleAddRow}>
                  Add Row
                </button>
                <button
                  className="save-changes-button"
                  onClick={handleSaveConfirmation}>
                  Submit
                </button>
              </div>
            </div>
          </Fade>
        </Box>
      </Modal>
    </div>
  );
};

export default ToolsMain;

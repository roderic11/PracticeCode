import React, { useState, useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { BiPlus } from "react-icons/bi";
import axios from "axios";
import { AiFillCloseCircle } from "react-icons/ai";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import { RiTodoFill } from "react-icons/ri";
import { useSelector } from "react-redux";
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
  TablePagination,
  Collapse,
  BottomNavigationAction,
  BottomNavigation,
  Pagination,
  Stack,
  Tab,
  Tabs,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1490,
  bgcolor: "background.paper",
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
function MaterialRequestOps() {
  const { user } = useSelector((state) => state.auth);
  const { id, name, location, items, projectId } = useLocation().state || {};
  const [secondTableData, setSecondTableData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [requestQuantities, setRequestQuantities] = useState({});
  const [dateRequested, setDateRequested] = useState(null);
  const [dateNeeded, setDateNeeded] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mrfNames, setMrfNames] = useState([]);
  const [selectedMRFItems, setSelectedMRFItems] = useState([]);
  const [mrfData, setMrfData] = useState({});
  const [selectedMrfName, setSelectedMrfName] = useState("");
  const [selectedScope, setSelectedScope] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const [value, setValue] = useState("All");
  const [username, setUsername] = useState(user.name);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(secondTableData);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [categorySearchQueries, setCategorySearchQueries] = useState({});
  const [dateNeededData, setDateNeededData] = useState("");

  const [dateRequestedData, setDateRequestedData] = useState("");
  useEffect(() => {
    setSecondTableData(
      items?.map((item, index) => ({ ...item, itemId: index })) || []
    );
  }, [items]);
  const fetchMrfNames = async () => {
    try {
      const response = await axios.get(
        `/api/MaterialRequestOps/material-requests?projectId=${projectId}`
      );

      // Filter the response data to get the relevant mrfName values
      const filteredData = response.data.filter(
        (item) => item.projectId === projectId
      );

      // Extract the mrfName values from the filtered data
      const mrfNamesArray = filteredData
        .map((item) => item.tableData.map((data) => data.mrfName))
        .flat();

      setMrfNames(mrfNamesArray);

      // Build mrfDataObject, dateNeededData, and dateRequestedData
      const mrfDataObject = {};
      const dateNeededData = {};
      const dateRequestedData = {};

      // Display the items array for each mrfName
      filteredData.forEach((item) => {
        item.tableData.forEach((data) => {
          const mrfName = data.mrfName;
          const dateNeeded = data.dateNeeded;
          const dateRequested = data.dateRequested;
          const items = data.items || [];
          mrfDataObject[mrfName] = items;
          dateNeededData[mrfName] = dateNeeded;
          dateRequestedData[mrfName] = dateRequested;
        });
      });

      setMrfData(mrfDataObject);
      setDateNeededData(dateNeededData);
      setDateRequestedData(dateRequestedData);
    } catch (error) {
      console.error("Error fetching mrfNames:", error);
    }
  };
  useEffect(() => {
    const storedMrfName = localStorage.getItem(projectId);
    if (storedMrfName && mrfNames.includes(storedMrfName)) {
      setSelectedMrfName(storedMrfName);
      const selectedItems = mrfData[storedMrfName] || [];
      setSelectedMRFItems(selectedItems);
    }

    fetchMrfNames();
  }, [projectId]);

  const handleCloseModal = () => {
    setModalOpen(false);
  };
  const openModal = () => {
    setModalOpen(true);
  };
  const handleGoBack = () => {
    window.history.back();
  };

  const getCurrentDate = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleQuantityChange = (itemId, quantity) => {
    setRequestQuantities((prevQuantities) => ({
      ...prevQuantities,
      [itemId]: quantity,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!dateNeeded) {
        toast.error("Please enter a date needed");
        return;
      }
      const hasQuantityRequest = Object.values(requestQuantities).some(
        (quantity) => quantity > 0
      );

      if (!hasQuantityRequest) {
        setIsLoading(false);
        toast.error("Please input at least one request quantity for an item.");
        return;
      }
      const exceedsAvailableQuantity = secondTableData.some((row) => {
        const requestedQuantity = requestQuantities[row.itemId] || 0;
        return requestedQuantity > row.quantity;
      });

      if (exceedsAvailableQuantity) {
        secondTableData.forEach((row) => {
          const requestedQuantity = requestQuantities[row.itemId] || 0;
          if (requestedQuantity > row.quantity) {
            toast.error(
              `Requested quantity for ${row.product} exceeds available quantity.`
            );
          }
        });

        return;
      }

      setIsLoading(true);
      const response = await axios.get(
        `/api/MaterialRequestOps/material-requests?projectId=${projectId}`
      );
      const existingRequestData = response.data.find(
        (storage) => storage.projectId === projectId
      );

      const newToolsItemTable = secondTableData
        .filter(
          (row) =>
            row.product && row.quantity && requestQuantities[row.itemId] > 0
        ) // Filter items with a mrfValue > 0
        .map((row) => {
          return {
            scope: row.category,
            subCategory: row.subCategory,
            product: row.product,
            unit: row.unit,
            quantity: row.quantity,
            mrfValue: requestQuantities[row.itemId] || 0,
          };
        });

      if (newToolsItemTable.length === 0) {
        setIsLoading(false);
        toast.error(
          "Please enter stock request quantity for at least one item."
        );
        return;
      }

      let mrfNumber = 1; // Default value for the MRF number
      if (existingRequestData) {
        // If there are existing MRFs, get the latest MRF number and increment it
        const latestMRF = existingRequestData.tableData.slice(-1)[0].mrfName;
        mrfNumber = parseInt(latestMRF.split("MRF")[1]) + 1;
      }

      const mrfName = `MRF${mrfNumber}`;

      if (!existingRequestData) {
        const equipmentData = {
          projectId: projectId,
          name: name,
          location: location,
          tableData: [
            {
              username: username,
              mrfName: mrfName,
              dateRequested: getCurrentDate(),
              dateNeeded: dateNeeded,
              remarks: " ",

              items: newToolsItemTable,
            },
          ],
        };

        const createResponse = await axios.post(
          "/api/MaterialRequestOps/material-requests",
          equipmentData
        );

        setIsLoading(false);
        setDateNeeded("");
        setRequestQuantities("");
        fetchMrfNames();

        toast.success("Submitted Successfully");
      } else {
        const updatedRequestTable = [
          ...existingRequestData.tableData,
          {
            username: username,
            mrfName: mrfName,
            dateRequested: getCurrentDate(),
            dateNeeded: dateNeeded,
            remarks: " ",

            items: newToolsItemTable,
          },
        ];

        const { _id } = existingRequestData;

        const updateResponse = await axios.put(
          `/api/MaterialRequestOps/material-requests/${_id}`,
          {
            ...existingRequestData,
            tableData: updatedRequestTable,
          }
        );
        setIsLoading(false);
        setDateNeeded("");
        setRequestQuantities("");

        fetchMrfNames();
        toast.success("Submitted Successfully");
      }
      setModalOpen(false);
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Failed to save changes");
    }
  };
  const handleSaveConfirmation = () => {
    const isConfirmed = window.confirm("Are you sure you want to submit?");

    if (isConfirmed) {
      handleSubmit();
    }
  };
  const handleMRFClick = (mrfName) => {
    setSelectedMrfName(mrfName);
    const selectedItems = mrfData[mrfName] || [];
    setSelectedMRFItems(selectedItems);

    localStorage.setItem(projectId, mrfName);
  };
  const handleScopeChange = (event) => {
    setSelectedScope(event.target.value);
  };

  const handleSubCategoryChange = (event) => {
    setSelectedSubCategory(event.target.value);
  };

  const allScopes = [...new Set(secondTableData.map((item) => item.category))];
  const allSubCategories = [
    ...new Set(secondTableData.map((item) => item.subCategory)),
  ];

  const filteredMRFItems = selectedMRFItems.filter((item) => {
    const isScopeMatch =
      selectedScope === "All" || item.scope === selectedScope;
    const isSubCategoryMatch =
      selectedSubCategory === "All" || item.subCategory === selectedSubCategory;

    return isScopeMatch && isSubCategoryMatch;
  });
  const getItemsByCategory = (category) => {
    if (category === "All") {
      return secondTableData;
    } else {
      return secondTableData.filter((item) => item.category === category);
    }
  };
  const handleChange = (event, newValue) => {
    setValue(newValue);

    if (categorySearchQueries[newValue]) {
      setProductSearchQuery(categorySearchQueries[newValue]);
    } else {
      setProductSearchQuery("");
    }
  };
  const handleProductSearchInputChange = (event) => {
    setCategorySearchQueries((prevQueries) => ({
      ...prevQueries,
      [value]: event.target.value,
    }));
    setProductSearchQuery(event.target.value);
  };
  useEffect(() => {
    if (!categorySearchQueries[value]) {
      setProductSearchQuery("");
    }
  }, [value, categorySearchQueries]);
  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };
  const filteredMrfNames = mrfNames.filter((mrfName) => {
    const lowercaseSearchQuery = searchQuery.toLowerCase();
    const lowercaseMrfName = mrfName.toLowerCase();
    return lowercaseMrfName.includes(lowercaseSearchQuery);
  });

  const filterItemsWithRequestQuantities = (items) => {
    return items.filter((item) => requestQuantities[item.itemId] > 0);
  };
  const getMrfNamesDescending = () => {
    const sortedMrfNames = [...filteredMrfNames].sort((a, b) => {
      const aNumber = parseInt(a.replace("MRF", ""));
      const bNumber = parseInt(b.replace("MRF", ""));
      return bNumber - aNumber;
    });
    return sortedMrfNames;
  };

  const customFilterFunction = (items) => {
    const lowercaseSearchQuery = searchQuery.toLowerCase();
    const lowercaseProductSearchQuery = productSearchQuery.toLowerCase();

    return items.filter((item) => {
      const isMainSearchMatch = item.product
        .toLowerCase()
        .includes(lowercaseSearchQuery);

      const isProductSearchMatch = item.product
        .toLowerCase()
        .includes(lowercaseProductSearchQuery);

      return isMainSearchMatch && isProductSearchMatch;
    });
  };
  return (
    <div>
      <div className="container-admin">
        <section className="section-admin">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controller">Material Request: {name}</div>
        </section>
        <section className="section-back" onClick={handleGoBack}>
          <FiArrowLeft />
          <div className="back">BACK</div>
        </section>
      </div>
      <div className="manpower-box">
        <div className="side-container-manpowercost">
          <div className="calend-man">REQUESTED MATERIALS</div>
          <input
            type="search"
            placeholder="Search MRF Name..."
            className="search-input-track"
            value={searchQuery}
            onChange={handleSearchInputChange}
          />

          <div className="side-container-manpowercost-sub1">
            <div className="side-container-manpowercost-sub2">
              {getMrfNamesDescending().map((mrfName, index) => (
                <div
                  className={`calendar-manpower ${
                    selectedMrfName === mrfName ? "selected-mrf" : ""
                  }`}
                  key={index}
                  onClick={() => handleMRFClick(mrfName)}>
                  <RiTodoFill className="BS-calendar" />
                  <div className="manpower-date">{mrfName}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="purchase-order-box-equip">
            <div className="purchase-order-subbox-equip-material-request">
              <div className="grid-container-equip">
                <div className="selected-mrf-title">
                  Date Requested:{" "}
                  <b>{formatDate(dateRequestedData[selectedMrfName])}</b>
                </div>
                <div className="selected-mrf-title">
                  Date Needed:{" "}
                  <b>{formatDate(dateNeededData[selectedMrfName])}</b>
                </div>
                <div className="selected-mrf-title">
                  Selected MRF: <b>{selectedMrfName}</b>
                </div>
                <div onClick={openModal} className="mancost-button">
                  <BiPlus className="create-new-button-logo" />
                  Create MRF
                </div>
              </div>
            </div>
            <div className="purchase-order-subbox-equip-material-request">
              <div className="text-date-installed">
                <b>Select Scope</b>
              </div>
              <select value={selectedScope} onChange={handleScopeChange}>
                <option value="All">All</option>
                {allScopes.map((scope) => (
                  <option key={scope} value={scope}>
                    {scope}
                  </option>
                ))}
              </select>
            </div>
            <div className="purchase-order-subbox-equip-material-request">
              <div className="text-date-installed">
                <b>Select Sub Category</b>
              </div>
              <select
                value={selectedSubCategory}
                onChange={handleSubCategoryChange}>
                <option value="All">All</option>
                {allSubCategories.map((subCategory) => (
                  <option key={subCategory} value={subCategory}>
                    {subCategory}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <TableContainer component={Paper}>
              <div
                style={{
                  maxHeight: `${rowsPerPage * 40}px`,
                  overflow: "auto",
                }}>
                <Table
                  sx={{ minWidth: 950 }}
                  size="small"
                  aria-label="a dense table">
                  <TableHead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                    <TableRow>
                      <TableCell>
                        <b>Item Name</b>
                      </TableCell>
                      <TableCell>
                        <b>Unit</b>
                      </TableCell>

                      <TableCell>
                        <b>MRF Value</b>
                      </TableCell>
                      <TableCell>
                        <b>Scope</b>
                      </TableCell>
                      <TableCell>
                        <b>Sub Category</b>
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {filteredMRFItems.map((item, itemIndex) => (
                      <TableRow
                        key={`${selectedMrfName}-${itemIndex}`}
                        hover
                        style={{
                          backgroundColor:
                            itemIndex % 2 === 0 ? "#f0f0f0" : "white",
                        }}>
                        <TableCell
                          style={{ maxWidth: "200px", whiteSpace: "wrap" }}>
                          {item?.product}
                        </TableCell>
                        <TableCell
                          style={{ maxWidth: "200px", whiteSpace: "wrap" }}>
                          {item?.unit}
                        </TableCell>
                        <TableCell
                          style={{ maxWidth: "200px", whiteSpace: "wrap" }}>
                          {item?.mrfValue}
                        </TableCell>
                        <TableCell
                          style={{ maxWidth: "200px", whiteSpace: "wrap" }}>
                          {item?.scope}
                        </TableCell>
                        <TableCell
                          style={{ maxWidth: "200px", whiteSpace: "wrap" }}>
                          {item?.subCategory}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TableContainer>
          </div>
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
            <div
              style={{
                maxHeight: "600px",
                overflowY: "auto",
                minHeight: "600px",
              }}>
              <AiFillCloseCircle
                onClick={handleCloseModal}
                className="AiFillCloseCircle"
              />

              <div>
                <div className="material-request-form-title">
                  Material Request Form
                </div>
                <div className="instruction-material-req-form">
                  <b>Instruction:</b> To submit a material request, first choose
                  the relevant category, and click on tabs to view items within
                  each section efficiently. Select an item and specify the
                  quantity you need. For multiple items in the same category,
                  use the tabs to repeat the process. Review the material
                  request summary for accuracy, then click "Submit" to proceed
                  or "Cancel" to cancel the process. You can review and see the
                  filled out material requests under "View All Requests." You
                  only have one attempt, make sure you have reviewed your forms
                  carefully before submitting.
                </div>

                <div className="material-req-ops-modal-box">
                  <Box
                    sx={{
                      maxWidth: { xs: 320, sm: 600 },

                      bgcolor: "background.paper",
                    }}>
                    <Tabs
                      value={value}
                      onChange={handleChange}
                      variant="scrollable"
                      scrollButtons="auto"
                      aria-label="scrollable auto tabs example">
                      <Tab label="View All Requests" value="All" />

                      {allScopes.map((scope, index) => (
                        <Tab label={scope} key={index} value={scope} />
                      ))}
                    </Tabs>
                  </Box>
                  <div className="dateneeded-mat-ops">
                    <div className="text-date-installed">Date Needed:</div>
                    <input
                      type="date"
                      className="search-input-track"
                      value={dateNeeded}
                      onChange={(e) => setDateNeeded(e.target.value)}
                    />
                  </div>
                </div>

                <TableContainer component={Paper}>
                  <div
                    style={{
                      maxHeight: `${rowsPerPage * 53}px`,
                      overflow: "auto",
                      marginRight: "5px",
                    }}>
                    <input
                      type="search"
                      className="select-sub-modal-mat"
                      placeholder="Search Item Name.."
                      value={productSearchQuery}
                      onChange={handleProductSearchInputChange}
                    />

                    <Table
                      sx={{ minWidth: 650 }}
                      size="small"
                      aria-label="a dense table">
                      <TableHead
                        style={{ position: "sticky", top: 0, zIndex: 1 }}>
                        <TableRow>
                          <TableCell>
                            <b>Item Name</b>
                          </TableCell>
                          <TableCell>
                            <b>Unit</b>
                          </TableCell>

                          <TableCell>
                            <b>Quantity Available</b>
                          </TableCell>
                          <TableCell>
                            <b>Category</b>
                          </TableCell>
                          <TableCell>
                            <b>Sub Category</b>
                          </TableCell>
                          <TableCell>
                            <b>Quantity Request</b>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {customFilterFunction(
                          value === "All"
                            ? filterItemsWithRequestQuantities(secondTableData) // Use filterItemsWithRequestQuantities for "All"
                            : getItemsByCategory(value)
                        ).map((row, index) => (
                          <TableRow
                            hover
                            key={index}
                            style={{
                              backgroundColor:
                                index % 2 === 0 ? "#f0f0f0" : "white",
                            }}>
                            <TableCell
                              style={{
                                maxWidth: "200px",
                                whiteSpace: "wrap",
                              }}>
                              {row.product}
                            </TableCell>
                            <TableCell
                              style={{
                                maxWidth: "200px",
                                whiteSpace: "wrap",
                              }}>
                              {row.unit}
                            </TableCell>

                            <TableCell
                              style={{
                                maxWidth: "200px",
                                whiteSpace: "wrap",
                              }}>
                              {row.quantity}
                            </TableCell>
                            <TableCell
                              style={{
                                maxWidth: "200px",
                                whiteSpace: "wrap",
                              }}>
                              {row.category}
                            </TableCell>

                            <TableCell
                              style={{
                                maxWidth: "200px",
                                whiteSpace: "wrap",
                              }}>
                              {row.subCategory}
                            </TableCell>
                            <TableCell>
                              <input
                                type="number"
                                placeholder="Request Quantity"
                                value={requestQuantities[row.itemId] || ""}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    row.itemId,
                                    e.target.value
                                  )
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TableContainer>
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
                ) : (
                  <div>
                    {value === "All" && (
                      <div className="submission-box-ops">
                        <div>
                          <button onClick={handleSaveConfirmation}>
                            Submit
                          </button>

                          <button onClick={handleCloseModal}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Fade>
        </Box>
      </Modal>
    </div>
  );
}

export default MaterialRequestOps;

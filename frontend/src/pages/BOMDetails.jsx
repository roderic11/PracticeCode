import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import stringSimilarity from "string-similarity";

import { toast } from "react-toastify";
import { FiArrowLeft } from "react-icons/fi";
import { FaTrashAlt, FaPen, FaComment } from "react-icons/fa";
import * as XLSX from "xlsx";
import { AiFillCloseCircle } from "react-icons/ai";
import { read, utils } from "xlsx";
import { Check, Cancel } from "@mui/icons-material";
import { useSelector } from "react-redux";
import {
  CircularProgress,
  Paper,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Fade,
  TableHead,
  Typography,
  TablePagination,
  TableRow,
  Menu,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
const modalStyle = {
  position: "absolute",
  top: "50%",
  height: "650px",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1490,
  bgcolor: "background.paper",
  maxHeight: "650px",
  overflow: "auto",
  borderRadius: "5px",
  boxShadow: 24,
  padding: "20px",
  backgroundColor: "#f4f4f4",
};
const BOMDetails = () => {
  const [message, setMessage] = useState("");
  const [boms, setBOMs] = useState([]);
  const { user } = useSelector((state) => state.auth);
  //for modal opening & others ----------------------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCommentOpen, setIsCommentModalOpen] = useState(false); // new addition to the code
  const [rows, setRows] = useState([]);
  const { id, name } = useParams();
  const [items, setItems] = useState([]);
  const [selectedSub, setSelectedSub] = useState("");
  const [itemId, setItemId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [prevItems, setPrevItems] = useState([]);

  //for editing items api-------------------
  const [editVisibility, setEditVisibility] = useState("");
  const [editItemId, setEditItemId] = useState("");
  const [editProduct, setEditProduct] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editCost, setEditCost] = useState(" ");
  const [editComment, setEditComment] = useState(" "); // new addition to the code
  const [viewModal, setViewModal] = useState(false);

  //for table Data api ---------------------
  const [category, setCategory] = useState("");
  const [comment, setComment] = useState(" ");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [existingCategories, setExistingCategories] = useState([]);
  const [existingSubCategories, setExistingSubCategories] = useState([]);
  const [hasRemarks, setHasRemarks] = useState(false);
  const [page, setPage] = useState(0);
  const rowsPerPage = 12;
  const [tableData, setTableData] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [projectRemark, setProjectRemark] = useState([]);
  const navigate = useNavigate();

  //for TableData api -----------------------
  const [selectedScope, setSelectedScope] = useState("");
  const [selectedComment, setSelectedComment] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [isApplyClicked, setIsApplyClicked] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visibility, setVisibility] = useState("show"); // 'show' is the default option

  const CustomDropdown = ({ id, selectedOption, setSelectedOption }) => {};

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCancel = () => {
    handleClose();
  };

  const fetchItems = async () => {
    try {
      const response = await axios.get(`/api/projects/${id}`);
      const itemsData = response.data;
      setItems(itemsData);

      const categories = itemsData.map((item) => item.category);
      const subCategories = itemsData.map((item) => item.subCategory);
      const itemId = itemsData.map((item) => item._id);
      setExistingCategories(categories);
      setExistingSubCategories(subCategories);
      setItemId(itemId);

      setLoading(false);
    } catch (error) {
      console.error(error);
      setError("Error fetching project details.");
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchItems();
  }, [id]);

  const handleGoBack = () => {
    window.history.back();
  };

  const handleRowChange = (index, field, value) => {
    const updatedRows = rows.map((row, rowIndex) => {
      if (rowIndex === index) {
        return {
          ...row,
          [field]: value,
        };
      }
      return row;
    });
    setRows(updatedRows);
  };

  //modified#1

  const addRow = () => {
    setRows([...rows, { product: "", unit: "", quantity: "", cost: " " }]);
  };

  const removeRow = (index) => {
    const updatedRows = [...rows];
    updatedRows.splice(index, 1);
    setRows(updatedRows);
  };

  //this is for the radio button visibility:
  const handleVisibilityChange = (event) => {
    setVisibility(event.target.value);
  };
  const handleVisibilityChanges = (event) => {
    setEditVisibility(event.target.value);
    console.log(event.target.value);
  };
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
    setButtonsVisible(false);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };
  const toggleModal = (item) => {
    setSelectedComment(item); // Store the selected item
    setIsModalOpen(false);
    setViewModal(!viewModal);
  };

  const closeToggle = () => {
    setViewModal(false);
  };

  const editItem = (
    itemId,
    product,
    unit,
    fixedQuantity,
    cost,
    comment,
    visibility
  ) => {
    setEditItemId(itemId);
    setEditProduct(product);
    setEditUnit(unit);
    setEditQuantity("0");
    setEditCost(cost);
    setEditComment();
    setEditVisibility(visibility);
    setIsModalOpen(true);
  };

  const editComments = (itemId, comment) => {
    setIsCommentModalOpen(true);
  };

  const handleScopeChange = (event) => {
    setSelectedScope(event.target.value);
  };

  const handleItemChange = (event) => {
    setSelectedItem(event.target.value);
  };

  const filteredData = items.filter(
    (item) =>
      (!selectedScope || item.category === selectedScope) &&
      (!selectedItem || item.subCategory === selectedItem)
  );

  //----------------------------------------------

  const saveEditedItem = async (itemId, event) => {
    event.preventDefault();
    const confirmation = window.confirm(
      "Are you sure you want to save edited Item Quantity?"
    );
    if (!confirmation) {
      return; // Abort saving if the user cancels the confirmation
    }

    const existingQuantity = items.find(
      (item) => item._id === itemId
    ).fixedQuantity;

    if (editCost < 0) {
      toast.error(" New quantity cannot be less than 0.");
      return;
    }

    if (!editComment) {
      toast.error(
        "Edit cannot be saved without comment. Please complete the input form"
      );
      return;
    }

    try {
      await axios.put(`/api/projects/${id}/items/${itemId}`, {
        quantity: editQuantity,
        cost: editCost,
        comment: editComment,
        personnel: user.name,
        visibility: editVisibility,
      });

      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item._id === itemId) {
            // Update the properties of the item

            item.fixedQuantity =
              parseInt(item.fixedQuantity || 0) + parseInt(editQuantity);
            item.cost = editCost;
            item.comment = editComment;
          }
          return item;
        })
      );

      toast.success("Item updated successfully.");
      closeModal();
      fetchItems();
    } catch (error) {
      console.error(error);
      setMessage("Error updating item.");
    }
  };

  //-----------------------------------------------
  const saveRemarks = async (id, selectedOption) => {
    const confirmation = window.confirm(
      `Are you sure you want to mark this project as ${selectedOption}?`
    );

    if (!confirmation) {
      setIsApplyClicked(false);
      setHasRemarks(false);
      return; // Abort saving if the user cancels the confirmation
    }

    try {
      await axios.patch(`/api/projects/${id}/remarks`, {
        remarks: selectedOption,
      });

      toast.success("Project status updated successfully.");
      closeModal();
    } catch (error) {
      console.error(error);
      setMessage("Error updating item.");
    }
  };

  //---------------------------------------------
  const checkHasRemarks = async () => {
    try {
      const response = await axios.get(`/api/projects/${id}/project`);
      const project = response.data;
      setProjectRemark(project.remarks);
      const similarityThreshold = 1;

      const similarityScoreAccomplished = stringSimilarity.compareTwoStrings(
        project.remarks,
        "Accomplished"
      );
      const similarityScoreDiscontinued = stringSimilarity.compareTwoStrings(
        project.remarks,
        "Discontinued"
      );
      const similarityScoreInactive = stringSimilarity.compareTwoStrings(
        project.remarks,
        "Inactive"
      );

      if (
        similarityScoreAccomplished >= similarityThreshold ||
        similarityScoreDiscontinued >= similarityThreshold ||
        similarityScoreInactive >= similarityThreshold
      ) {
        console.log("Project Remarks: " + project.remarks);

        return true;
      }

      return false;
    } catch (error) {
      console.error(error);
      // Handle error if needed
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      const hasRemarksValue = await checkHasRemarks();
      setHasRemarks(hasRemarksValue);

      // Fetch and set other data
    };

    fetchData();
    console.log("data", hasRemarks);
  }, [id]);

  //-------------------------------------------
  //Modified#2

  const handleFileChange = (e) => {
    console.log("File change event triggered");
    const file = e.target.files[0];
    const reader = new FileReader();
    console.log("Selected file:", file);

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      // Assuming the data is in the first sheet of the workbook
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Process the jsonData and populate the input fields
      processExcelData(jsonData);

      // Open the add modal to display the imported data
      openAddModal();
    };

    reader.readAsArrayBuffer(file);
  };

  const processExcelData = (data) => {
    console.log("Processing Excel data:", data);
    const requiredColumns = ["product", "unit", "quantity", "cost"];
    const headers = Object.keys(data[0]);
    const missingColumns = requiredColumns.filter(
      (column) => !headers.includes(column)
    );

    if (missingColumns.length > 0) {
      console.error("Missing columns:", missingColumns);
      return;
    }

    const updatedRows = data.map((item, index) => {
      const { product, unit, quantity, cost } = item;

      if (!product || !unit || !quantity || !cost) {
        toast.error(`Invalid data in row ${index + 2}: Missing values`);
        return null;
      }

      return {
        product: item.product || "",
        unit: item.unit || "",
        quantity: item.quantity || "",
        cost: item.cost || "",
      };
    });

    const validRows = updatedRows.filter((row) => row !== null);

    setRows(validRows); // Update the rows state with valid rows obtained from Excel
  };

  //Modified#3 -- for cost

  const addItem = async (e) => {
    e.preventDefault();

    // Check if category and subcategory are selected
    if (!selectedCategory && !category) {
      toast.error("Please select a category.");
      return;
    }

    if (!selectedSub && !subCategory) {
      toast.error("Please select a subcategory.");
      return;
    }
    // Check if any row has empty fields
    const hasEmptyFields = rows.some(
      (row) => !row.product || !row.unit || !row.quantity || !row.cost
    );
    if (hasEmptyFields) {
      toast.error("Invalid data: Missing values in one or more rows.");
      return;
    }

    const hasInvalidQuantities = rows.some(
      (row) => parseFloat(row.quantity) <= 0
    );
    if (hasInvalidQuantities) {
      toast.error("Invalid data: Quantity must be greater than 0.");
      return;
    }
    try {
      // Check if there are no rows in the data
      if (rows.length === 0) {
        toast.error("Cannot save empty data.");
        return;
      }

      // Prompt for confirmation before adding items
      const confirmAdd = window.confirm("Do you want to add the items?");
      if (!confirmAdd) {
        return;
      }
      setIsLoading(true);
      const newItems = [];

      // Get the existing products in the selected subcategory
      const existingProductsInSelectedSubcategory = items
        .filter((item) => item.subCategory === (selectedSub || subCategory))
        .map((item) => item.product.trim().toLowerCase());

      // Iterate over each row and create new items if they don't exist
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const { product, unit, quantity, cost } = row;
        const prod = product.trim().toLowerCase();

        const isMatchingProduct = items.some(
          (item) =>
            item.product.trim().toLowerCase() === prod &&
            item.subCategory === (selectedSub || subCategory) &&
            item.category === (selectedCategory || category)
        );

        if (isMatchingProduct) {
          toast.error(
            `Item "${product}" already exists in the selected subcategory within the category.`
          );
          return;
        }
        setButtonsVisible(true);
        try {
          setIsLoading(true);
          const response = await axios.patch(`/api/projects/${id}`, {
            projectId: id,
            category: selectedCategory || category,
            subCategory: selectedSub || subCategory,
            product: product,
            unit: unit,
            quantity: quantity,
            cost: cost,
            visibility: visibility,
          });

          newItems.push(...response.data.project.items);
          const newProgress = ((i + 1) / rows.length) * 100;
          setProgress(newProgress);
        } catch (error) {
          console.error(`Error adding item "${product}":`, error);
          toast.error(`Error adding item "${product}". Please try again.`);
        }
      }

      closeAddModal();
      fetchItems();
      toast.success("New items added successfully.");
      setRows([]);
      setSelectedCategory("");
      setCategory("");
      setSelectedSub("");
      setSubCategory("");
    } catch (error) {
      console.error("Error adding items:", error);
      toast.error("Error adding items. Please try again.");
    } finally {
      // Set loading state back to false after the process is complete
      setIsLoading(false);
    }
  };

  const deleteItemAPI = async (projectId, itemId) => {
    try {
      await axios.delete(`/api/projects/${id}/${itemId}`);
      setMessage("Item deleted from BOM.");
    } catch (error) {
      console.error(error);
      setMessage("Error deleting item.");
    }
  };

  const deleteItem = async (item, product) => {
    try {
      // Display a confirmation toast before deleting the item
      const confirmDelete = window.confirm(
        `Are you sure you want to delete this ${product}?`
      );
      if (!confirmDelete) {
        return;
      }

      // Call the deleteItemAPI to delete the item from the server
      await deleteItemAPI(item.projectId, item._id);

      // Remove the item from the frontend view
      setItems((prevItems) =>
        prevItems.filter((prevItem) => prevItem._id !== item._id)
      );

      // Display a success toast
      toast.success("Item deleted successfully.");
    } catch (error) {
      console.error("Error deleting item:", error);

      // Display an error toast
      toast.error("Failed to delete item. Please try again.");
    }
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };
  // Filter items based on selected category
  const filteredItems =
    selectedCategory === "All"
      ? items // Display all items if 'All' category is selected
      : items.filter((item) => item.category === selectedCategory);

  const getStatusIndicator = (quantity) => {
    if (quantity < 5 || quantity === 0) {
      return {
        text: "Low Quantity",
        color: "red",
      };
    } else if (quantity < 20) {
      return {
        text: "Warning",
        color: "orange",
      };
    } else if (quantity > 20) {
      return {
        text: "Available",
        color: "green",
      };
    } else {
      return {
        text: "Unknown",
        color: "gray",
      };
    }
  };

  const filteredDataWithComments = filteredData.filter(
    (item) => item.comment.length > 0
  );

  const totalLaborContract = filteredData.reduce(
    (acc, item) => {
      acc.totalQuantity += item.fixedQuantity * item.cost;

      return acc;
    },
    { totalQuantity: 0, totalCost: 0 }
  );

  console.log("Total Quantity: ", totalLaborContract.totalQuantity);

  //------------------------------------
  const handleApply = () => {
    if (
      selectedOption === "Accomplished" ||
      selectedOption === "Inactive" ||
      selectedOption === "Discontinued"
    ) {
      setIsApplyClicked(true);
      setHasRemarks(true);
    } else {
      setIsApplyClicked(false);
      setHasRemarks(false);
    }
    saveRemarks(id, selectedOption); // Assuming you have a saveRemarks function

    handleClose();
  };
  return (
    <div>
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-box-mid">
            <CircularProgress variant="determinate" value={progress} />{" "}
            <div className="progress-loading">
              <Typography
                variant="caption"
                component="div"
                color="text.secondary"
              >
                {`${Math.round(progress)}%`}
              </Typography>
            </div>
          </div>
        </div>
      )}
      <div className="container-admin">
        <section className="section-admin">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controller">
            <b>
              Bill Of Materials:
              {name}
            </b>
          </div>
        </section>
        <section className="section-back" onClick={handleGoBack}>
          <FiArrowLeft />
          <div className="back">BACK</div>
        </section>
      </div>
      {/*Edit items unit cost and fixed quantity */}
      {isModalOpen && (
        <div className="modal-overlay-admin">
          <div className="modal-content-admin">
            <form onSubmit={saveEditedItem}>
              <b>Edit Item</b>

              <div>
                <br />
                <label htmlFor="editProduct">
                  <b>Product:</b>
                </label>
                <input
                  type="text"
                  id="editProduct"
                  value={editProduct}
                  onChange={(e) => setEditProduct(e.target.value)}
                  disabled
                />
              </div>
              <div>
                <label htmlFor="editUnit">
                  <b>Unit:</b>
                </label>
                <input
                  type="text"
                  id="editUnit"
                  value={editUnit}
                  onChange={(e) => setEditUnit(e.target.value)}
                  disabled
                />
              </div>
              <div>
                <label htmlFor="editQuantity">
                  <b>Quantity:</b>
                </label>
                <input
                  type="number"
                  id="editQuantity"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  placeholder="Input Added Value"
                />
              </div>
              <div>
                <label htmlFor="editCost">
                  <b>Contract Cost:</b>
                </label>
                <input
                  type="number"
                  id="editCost"
                  value={editCost}
                  onChange={(e) => setEditCost(e.target.value)}
                />
              </div>
              <div className="label-bom-details-box">
                <label className="label-bom-details">
                  Change Operations Visibility
                </label>
                <label className="label-visibility">
                  <input
                    type="radio"
                    value="show"
                    checked={editVisibility === "show"}
                    onChange={handleVisibilityChanges}
                  />
                  Show
                </label>
                <label className="label-visibility">
                  <input
                    type="radio"
                    value="hide"
                    checked={editVisibility === "hide"}
                    onChange={handleVisibilityChanges}
                  />
                  Hide
                </label>
              </div>
              <div>
                <label htmlFor="Comment ">
                  <b>Comment:</b>
                </label>
                <input
                  type="text"
                  id="editComment"
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                />
              </div>
              <button onClick={(e) => saveEditedItem(editItemId, e)}>
                Save
              </button>

              <button type="button" onClick={closeModal}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {viewModal && (
        <div className="modal-overlay-Bom">
          <div className="modal-content-admin-Bom">
            <b className="edit-history-bom">Edit History</b>
            <TableContainer component={Paper}>
              <div
                style={{
                  overflowY: "auto",
                }}
              >
                <Table size="small" aria-label="a dense table">
                  <TableHead style={{ position: "sticky", top: 0 }}>
                    <TableRow>
                      <TableCell>
                        <b>Modified By</b>
                      </TableCell>
                      <TableCell>
                        <b>Date</b>
                      </TableCell>
                      <TableCell>
                        <b>Time</b>
                      </TableCell>
                      <TableCell>
                        <b>Comment</b>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedComment.comment
                      .map((comment, commentIndex) => (
                        <TableRow key={commentIndex}>
                          <TableCell>{comment.personnel}</TableCell>
                          <TableCell>{comment.Date}</TableCell>
                          <TableCell>{comment.Time}</TableCell>
                          <TableCell>{comment.TextField}</TableCell>
                        </TableRow>
                      ))
                      .reverse()}
                  </TableBody>
                </Table>
              </div>
            </TableContainer>

            <button onClick={closeToggle}> Close </button>
          </div>
        </div>
      )}

      <Modal
        open={isAddModalOpen}
        onRequestClose={closeAddModal}
        contentLabel="Add BOM Item Modal"
        closeAfterTransition
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
      >
        <Fade in={isAddModalOpen}>
          <div
            style={{
              maxHeight: "600px",
              overflowY: "auto",
              minHeight: "600px",
            }}
          >
            <Box sx={modalStyle}>
              <AiFillCloseCircle
                onClick={closeAddModal}
                className="AiFillCloseCircle"
              />

              <div className="material-request-form-title">
                Bill of Materials Content
              </div>

              <div className="instruction-material-req-form">
                <b>Instruction:</b> Add the relevant materials needed for the
                specific project. Classify according to Scope and category and
                import excel files according to their material proper.
              </div>

              <div className="material-req-ops-modal-box">
                <div className="BOM-Modal-content-box">
                  <div className="label-bom-details-box">
                    <label className="label-bom-details">
                      Select Existing Scope:
                    </label>
                    <select
                      disabled={!!category}
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="">-- Select Category --</option>
                      {Array.from(
                        new Set(items.map((item) => item.category))
                      ).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="label-bom-details-box">
                    <label className="label-bom-details" htmlFor="category">
                      Create New Scope:
                    </label>
                    <input
                      type="text"
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={!!selectedCategory}
                      placeholder=" Input New Scope for this Project"
                    />
                  </div>
                  <div className="label-bom-details-box">
                    <label className="label-bom-details" htmlFor="subcategory">
                      Select Existing Sub-Category:
                    </label>
                    <select
                      value={selectedSub}
                      disabled={!!subCategory}
                      onChange={(e) => setSelectedSub(e.target.value)}
                    >
                      <option value="">-- Select Subcategory --</option>
                      {Array.from(
                        new Set(items.map((item) => item.subCategory))
                      ).map((subCategory) => (
                        <option key={subCategory} value={subCategory}>
                          {subCategory}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="label-bom-details-box">
                    <label className="label-bom-details" htmlFor="subcategory">
                      Add New Sub-Category:
                    </label>
                    <input
                      type="text"
                      id="subcategory"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      disabled={!!selectedSub}
                      placeholder=" Input tools Sub-category"
                    />
                  </div>
                  <div className="label-bom-details-box">
                    <label className="label-bom-details">
                      Import Excel File:
                    </label>
                    <input
                      type="file"
                      id="excelFile"
                      accept=".xlsx"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="label-bom-details-box">
                    <label className="label-bom-details">
                      Select Operations Visibility
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="show"
                        checked={visibility === "show"}
                        onChange={handleVisibilityChange}
                      />
                      Show
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="hide"
                        checked={visibility === "hide"}
                        onChange={handleVisibilityChange}
                      />{" "}
                      Hide
                    </label>
                  </div>
                </div>
              </div>

              {/*Table Contents*/}
              <div className="purchase-order-box-equip-bom">
                <TableContainer component="paper">
                  <Table size="small" aria-label="a dense table">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Product
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Unit
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Quantity
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Cost
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Actions
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row, index) => {
                        const isMatchingProduct = items.some(
                          (item) =>
                            item.product.trim().toLowerCase() ===
                              row.product.trim().toLowerCase() &&
                            item.subCategory === (selectedSub || subCategory) &&
                            item.category === (selectedCategory || category)
                        );

                        return (
                          <TableRow
                            key={index}
                            className={
                              isMatchingProduct ? "highlighted-row" : ""
                            }
                          >
                            <TableCell>
                              <input
                                type="text"
                                value={row.product}
                                onChange={(e) =>
                                  handleRowChange(
                                    index,
                                    "product",
                                    e.target.value
                                  )
                                }
                                placeholder={
                                  row.suggestedItem || "Input item product"
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <input
                                type="text"
                                value={row.unit}
                                onChange={(e) =>
                                  handleRowChange(index, "unit", e.target.value)
                                }
                                placeholder={row.unit || "Input unit"}
                              />
                            </TableCell>
                            <TableCell>
                              <input
                                type="number"
                                value={row.quantity}
                                onChange={(e) =>
                                  handleRowChange(
                                    index,
                                    "quantity",
                                    e.target.value
                                  )
                                }
                                placeholder={"Input quantity"}
                              />
                            </TableCell>
                            <TableCell>
                              <input
                                type="number"
                                value={row.cost}
                                onChange={(e) =>
                                  handleRowChange(index, "cost", e.target.value)
                                }
                                placeholder={"Input contract Cost"}
                              />
                            </TableCell>
                            <TableCell>
                              <button
                                variant="contained"
                                color="secondary"
                                onClick={() => removeRow(index)}
                              >
                                Remove
                              </button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
              {!buttonsVisible && (
                <div>
                  {/* Additional buttons */}
                  <button type="button" onClick={addRow}>
                    Add Row
                  </button>
                  <button type="submit" onClick={addItem}>
                    Submit
                  </button>
                  <button type="button" onClick={closeAddModal}>
                    Cancel
                  </button>
                </div>
              )}
            </Box>
          </div>
        </Fade>
      </Modal>

      <div className="purchase-order-box-equip-front1">
        <div className="legend">
          <b>Total Contract Labor Cost: </b>
          &#x20B1;
          {totalLaborContract.totalQuantity.toFixed(2)}
        </div>
        {hasRemarks ? (
          <></>
        ) : (
          <>
            {" "}
            {!isApplyClicked && (
              <button onClick={openAddModal}>Add Item to BOM</button>
            )}
          </>
        )}
        <div>
          <div className="title-bom-details">Project Status: </div>
          <Select
            value={selectedOption}
            onChange={(event) => setSelectedOption(event.target.value)}
            style={{ minWidth: 200 }}
            displayEmpty
          >
            <MenuItem value="" disabled>
              {projectRemark || "Select Status"}
            </MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Accomplished">Accomplished</MenuItem>
            <MenuItem value="Discontinued">Discontinued</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Select>

          <button onClick={handleApply}> Apply </button>
        </div>
      </div>
      {hasRemarks ? (
        <TableContainer component={Paper}>
          <div
            style={{
              maxHeight: `${rowsPerPage * 53}px`,
              overflow: "auto",
              marginRight: "5px",
            }}
          >
            <Table size="small" aria-label="a dense table">
              <TableHead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <TableRow>
                  <TableCell
                    style={{ backgroundColor: "#146C94", color: "white" }}
                  >
                    <Typography variant="bold" className="bold-header">
                      Item #
                    </Typography>
                  </TableCell>

                  <TableCell
                    style={{ backgroundColor: "#146C94", color: "white" }}
                  >
                    <FormControl
                      variant="outlined"
                      sx={{ minWidth: "150px", color: "white" }}
                    >
                      <InputLabel htmlFor="scope-select">
                        Select Category
                      </InputLabel>
                      <Select
                        labelId="Category-select"
                        value={selectedItem}
                        onChange={handleItemChange}
                        label="Select Scope"
                        sx={{
                          backgroundColor: "white",
                          color: "black",
                          "& .MuiSelect-icon": {
                            color: "black",
                          },
                          "&:hover": {
                            backgroundColor: "white",
                          },
                          "&:focus": {
                            backgroundColor: "white",
                          },
                        }}
                      >
                        <MenuItem value="">All Category</MenuItem>
                        {Array.from(
                          new Set(items.map((item) => item.subCategory))
                        ).map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell
                    style={{ backgroundColor: "#146C94", color: "white" }}
                  >
                    <FormControl
                      variant="outlined"
                      sx={{ minWidth: "150px", borderColor: "red" }}
                    >
                      <InputLabel htmlFor="scope-select">
                        Select Scope
                      </InputLabel>
                      <Select
                        labelId="scope-select"
                        value={selectedScope}
                        onChange={handleScopeChange}
                        label="Select Scope"
                        sx={{
                          backgroundColor: "white",
                          color: "black",
                          "& .MuiSelect-icon": {
                            color: "black",
                          },
                          "&:hover": {
                            backgroundColor: "white",
                          },
                          "&:focus": {
                            backgroundColor: "white",
                          },
                        }}
                      >
                        <MenuItem value="">All Scopes</MenuItem>
                        {Array.from(
                          new Set(items.map((item) => item.category))
                        ).map((scope) => (
                          <MenuItem key={scope} value={scope}>
                            {scope}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell
                    style={{ backgroundColor: "#146C94", color: "white" }}
                  >
                    <Typography variant="bold" className="bold-header">
                      Item Name
                    </Typography>
                  </TableCell>
                  <TableCell
                    style={{ backgroundColor: "#146C94", color: "white" }}
                  >
                    <Typography variant="bold" className="bold-header">
                      Item Unit
                    </Typography>
                  </TableCell>
                  <TableCell
                    style={{ backgroundColor: "#146C94", color: "white" }}
                  >
                    <Typography variant="bold" className="bold-header">
                      Unit Cost
                    </Typography>
                  </TableCell>
                  <TableCell
                    style={{ backgroundColor: "#146C94", color: "white" }}
                  >
                    <Typography variant="bold" className="bold-header">
                      {" "}
                      Item Total Quantity{" "}
                    </Typography>
                  </TableCell>
                  <TableCell
                    style={{ backgroundColor: "#146C94", color: "white" }}
                  >
                    <Typography variant="bold" className="bold-header">
                      Labor Contract Cost
                    </Typography>
                  </TableCell>
                  <TableCell
                    style={{ backgroundColor: "#146C94", color: "white" }}
                  >
                    {" "}
                    <Typography variant="bold" className="bold-header">
                      Items Available{" "}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((item, index) => (
                  <TableRow
                    key={index}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#f0f0f0" : "white",
                    }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.subCategory}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.product}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>&#x20B1; {item.cost}</TableCell>
                    <TableCell>{item.fixedQuantity}</TableCell>
                    <TableCell>
                      &#x20B1;{" "}
                      {parseFloat(item.fixedQuantity).toFixed(2) *
                        parseFloat(item.cost).toFixed(2)}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TableContainer>
      ) : (
        <TableContainer component={Paper}>
          <div
            style={{
              maxHeight: `${rowsPerPage * 53}px`,
              overflow: "auto",
              marginRight: "5px",
            }}
          >
            <Table size="small" aria-label="a dense table">
              <TableHead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <TableRow>
                  <TableCell
                    style={{ backgroundColor: "#146C94", color: "white" }}
                  >
                    <Typography variant="bold" className="bold-header">
                      Item #
                    </Typography>
                  </TableCell>
                  <TableCell
                    style={{ backgroundColor: "#146C94", color: "white" }}
                  >
                    <FormControl
                      variant="outlined"
                      sx={{ minWidth: "150px", color: "white" }}
                    >
                      <InputLabel htmlFor="scope-select">
                        Select Category
                      </InputLabel>
                      <Select
                        labelId="Category-select"
                        value={selectedItem}
                        onChange={handleItemChange}
                        label="Select Scope"
                        sx={{
                          backgroundColor: "white",
                          color: "black",
                          "& .MuiSelect-icon": {
                            color: "black",
                          },
                          "&:hover": {
                            backgroundColor: "white",
                          },
                          "&:focus": {
                            backgroundColor: "white",
                          },
                        }}
                      >
                        <MenuItem value="">All Category</MenuItem>
                        {Array.from(
                          new Set(items.map((item) => item.subCategory))
                        ).map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell
                    style={{ backgroundColor: "#146C94", color: "white" }}
                  >
                    <FormControl
                      variant="outlined"
                      sx={{ minWidth: "150px", borderColor: "red" }}
                    >
                      <InputLabel htmlFor="scope-select">
                        Select Scope
                      </InputLabel>
                      <Select
                        labelId="scope-select"
                        value={selectedScope}
                        onChange={handleScopeChange}
                        label="Select Scope"
                        sx={{
                          backgroundColor: "white",
                          color: "black",
                          "& .MuiSelect-icon": {
                            color: "black",
                          },
                          "&:hover": {
                            backgroundColor: "white",
                          },
                          "&:focus": {
                            backgroundColor: "white",
                          },
                        }}
                      >
                        <MenuItem value="">All Scopes</MenuItem>
                        {Array.from(
                          new Set(items.map((item) => item.category))
                        ).map((scope) => (
                          <MenuItem key={scope} value={scope}>
                            {scope}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell
                    style={{ backgroundColor: "#146C94", color: "white" }}
                  >
                    <Typography variant="bold" className="bold-header">
                      Item Name
                    </Typography>
                  </TableCell>
                  <TableCell
                    style={{ backgroundColor: "#146C94", color: "white" }}
                  >
                    <Typography variant="bold" className="bold-header">
                      Item Unit
                    </Typography>
                  </TableCell>
                  <TableCell
                    style={{ backgroundColor: "#146C94", color: "white" }}
                  >
                    <Typography variant="bold" className="bold-header">
                      Unit Cost
                    </Typography>
                  </TableCell>

                  <TableCell
                    style={{ backgroundColor: "#146C94", color: "white" }}
                  >
                    <Typography variant="bold" className="bold-header">
                      {" "}
                      Item Total Quantity{" "}
                    </Typography>
                  </TableCell>

                  <TableCell
                    style={{ backgroundColor: "#146C94", color: "white" }}
                  >
                    <Typography variant="bold" className="bold-header">
                      Labor Contract Cost
                    </Typography>
                  </TableCell>

                  <TableCell
                    style={{ backgroundColor: "#146C94", color: "white" }}
                  >
                    {" "}
                    <Typography variant="bold" className="bold-header">
                      Items Available{" "}
                    </Typography>
                  </TableCell>
                  {!isApplyClicked && (
                    <TableCell
                      style={{ backgroundColor: "#146C94", color: "white" }}
                    >
                      {" "}
                      <Typography variant="bold" className="bold-header">
                        {" "}
                        Action
                      </Typography>
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((item, index) => (
                  <TableRow
                    key={index}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#f0f0f0" : "white",
                    }}
                  >
                    <TableCell>{index + 1}</TableCell>

                    <TableCell>{item.subCategory}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.product}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>&#x20B1; {item.cost}</TableCell>
                    <TableCell>{item.fixedQuantity}</TableCell>
                    <TableCell>
                      &#x20B1;{" "}
                      {parseFloat(item.fixedQuantity).toFixed(2) *
                        parseFloat(item.cost).toFixed(2)}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    {!isApplyClicked && (
                      <TableCell>
                        <div className="edit-delete-bom">
                          <FaComment
                            className="edit-boms"
                            onClick={() => toggleModal(item)}
                          />
                          <FaPen
                            className="edit-boms"
                            onClick={() =>
                              editItem(
                                item._id,
                                item.product,
                                item.unit,
                                item.fixedQuantity,
                                item.cost,
                                item.comment,
                                item.visibility
                              )
                            }
                          />

                          <FaTrashAlt
                            className="edit-boms"
                            onClick={() => deleteItem(item, item.product)}
                          />
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TableContainer>
      )}
    </div>
  );
};

export default BOMDetails;

import React, { useState, useEffect } from "react";
import { AiFillCloseCircle } from "react-icons/ai";
import { FaTrashAlt, FaPen, FaComment } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useSelector } from "react-redux";
import { FaFilter } from "react-icons/fa";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import "./inventoryMain.css";
import axios from "axios";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  Typography,
  TableRow,
  Box,
  Modal,
  Fade,
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

function MainWarehouse() {
  const [data, setData] = useState([]); // State to store the fetched data
  const [selectedSite, setSelectedSite] = useState("Cainta Main Warehouse"); // State to store the selected siteName
  const [page, setPage] = useState(0); // Current page number
  const [rowsPerPage, setRowsPerPage] = useState(12); // Number of rows per page
  const [projectName, setProjectName] = useState(""); // State to store the selected projectName
  //for excell files:
  const [rows, setRows] = useState([]);
  //for Modal changes and modification added new:
  const [openModal, setOpenModal] = useState(false);
  const [category, setCategory] = useState(" ");
  const [selectedCategory, setSelectedCategory] = useState(" ");
  const [items, setItems] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [site, setSite] = useState([]);
  const [projectId, setProjectId] = useState(" ");
  const [selectedSiteCategories, setSelectedSiteCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  //#modification #1 (oct 1 2023) for edit functions:
  const [isCommentOpen, setIsCommentModalOpen] = useState(false);
  const [editVisibility, setEditVisibility] = useState("");
  const [editItemId, setEditItemId] = useState("");
  const [editProduct, setEditProduct] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editCost, setEditCost] = useState(" ");
  const [editComment, setEditComment] = useState(" "); // new addition to the code
  const [viewModal, setViewModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState([]);
  const [id, setId] = useState("");
  const { user } = useSelector((state) => state.auth);
  const { name } = useParams();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSearch = () => {
    // Filter the siteTable based on the searchQuery
    const filtered = site.siteTable.filter(
      (item) =>
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredResults(filtered);
  };

  const navigate = useNavigate();

  const fetchStorageData = async () => {
    try {
      const response = await axios.get("api/storages");
      const data = response.data;
      const storages = data.map((storage) => ({
        siteName: storage.siteName,
        siteId: storage._id,
        siteTable: storage.siteTable,
        projectName: storage.projectName,
      }));

      setData(storages);
      setSite(storages.siteName);
      setId(storages.siteId);
      setProjectName(storages.projectName);
    } catch (error) {
      console.error("Error fetching storage data", error);
    }
  };

  useEffect(() => {
    fetchStorageData();
  }, [selectedSite]);

  // Pagination event handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  console.log("user" + user.name);

  const toggleModal = (item) => {
    setSelectedComment(item); // Store the selected item
    setIsModalOpen(false);
    setViewModal(!viewModal);
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
  };

  const editItem = (itemId, product, unit, quantity, cost) => {
    setEditItemId(itemId);
    setEditProduct(product);
    setEditUnit(unit);
    setEditQuantity("0");
    setEditCost(cost);
    setEditComment();

    setIsModalOpen(true);
  };

  const closeToggle = () => {
    setViewModal(false);
  };

  const handleSiteChange = (event) => {
    const selectedValue = event.target.value;

    if (selectedValue.length < 0) {
      setSelectedSite(selectedValue);
    } else {
      setSelectedSite("");
    }

    // Find the selected site and set the corresponding projectName
    const selectedSiteData = data.find(
      (item) => item.siteName === selectedValue
    );

    if (selectedSiteData) {
      setProjectName(selectedSiteData.projectName);
    } else {
      setProjectName("");
    }
  };

  // Filter the data based on the selected siteName
  const filteredData = data.filter((item) => item.siteName === selectedSite);

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Count the number of items in stock for each siteTable
  const inStockCount = filteredData.map(
    (site) => site.siteTable.filter((item) => item.quantity > 0).length
  );

  // Compute the total number of items in all siteTable entries
  const totalItems = data.reduce(
    (count, storage) => count + storage.siteTable.length,
    0
  );
  const saveEditedItem = async (itemId, event) => {
    event.preventDefault();
    const confirmation = window.confirm(
      "Are you sure you want to save edited Item Quantity?"
    );
    if (!confirmation) {
      return; // Abort saving if the user cancels the confirmation
    }

    if (!editComment) {
      toast.error(
        "Edit cannot be saved without comment. Please complete the input form"
      );
      return;
    }

    try {
      const response = await axios.get(`/api/storages?siteName=${site}`);
      const storage = response.data.find(
        (storage) => storage.siteName === selectedSite
      );
      const { _id } = storage;
      await axios.put(`/api/storages/${_id}/siteTable/${itemId}`, {
        quantity: editQuantity,
        cost: editCost,
        comment: editComment,
        personnel: user.name,
      });

      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item._id === itemId) {
            // Update the properties of the item

            item.quantity =
              parseInt(item.quantity || 0) + parseInt(editQuantity);
            item.cost = editCost;
            item.comment = editComment;
          }
          return item;
        })
      );

      toast.success("Item updated successfully.");
      setIsModalOpen(false);
      fetchStorageData();
    } catch (error) {
      console.error(error);
      toast.error("Error updating item.");
    }
  };

  const handleCustomClick = () => {
    navigate("/updateStorage");
  };

  const HandleOpenModal = () => {
    setOpenModal(true);
    setCategory("");
    setSelectedCategory("");
  };

  const closeModal = () => {
    setOpenModal(false);
    setCategory(" ");
    setSelectedCategory("");
  };

  const handleUpdateSupplies = async (storage) => {
    const supplierResponse = await axios.get("/api/supplies");
    const suppliers = supplierResponse.data.find((storage) => {
      if (site === "Cainta Main Warehouse") {
        return storage.supplier === site;
      } else {
        // Return true if siteName is not "Cainta Main Warehouse"
        return true;
      }
    });

    const existingSupplierItemsMap = new Map(
      suppliers.items.map((item) => [item.ItemName, item])
    );
    userInput.forEach((newItem) => {
      const existingProduct = existingSupplierItemsMap.get(newItem.ItemName);

      if (existingProduct) {
        // Update the quantity and materialCost of existing item
        existingProduct.quantity += Number(newItem.quantity);
        existingProduct.materialCost =
          existingProduct.quantity * existingProduct.unitCost;

        console.log(
          `Existing Item From Supplier: ${existingProduct.ItemName}, Quantity: ${existingProduct.quantity}`
        );
        console.log(
          `Existing Item From Supplier: ${existingProduct.ItemName}, Material Cost: ${existingProduct.materialCost}`
        );
      }
      newItem.brand = "Cainta Main warehouse";

      console.log(
        `New Item: ${newItem.ItemName}, Quantity: ${newItem.quantity}`
      );
      console.log(
        `New Item: ${newItem.ItemName}, Material Cost: ${newItem.materialCost}`
      );
      const newItemWithSupplier = {
        ...newItem,
        supplier: "Cainta Main Warehouse",
      };

      return {
        ...newItemWithSupplier,
      };
    });

    const newSupplierItems = userInput.filter(
      (item) => !existingSupplierItemsMap.has(item.ItemName)
    );
    const updatedItemsWithNewItems = [...suppliers.items, ...newSupplierItems];
    // Create the new item in the supplier database
    const createItemResponse = await axios.put(
      `/api/supplies/${suppliers._id}`,
      {
        supplier: suppliers.supplier,
        items: updatedItemsWithNewItems,
      }
    );
  };

  const addItem = async () => {
    const confirmation = window.confirm(
      "Do you confirm that the details below are complete and correct?"
    );
    if (!confirmation) {
      setSelectedCategory("");
      setCategory("");
      setUserInput([]);
      return; // Abort saving if the user cancels the confirmation
    }

    if (!category && !selectedCategory) {
      toast.error(
        "No selected Category or Value of category in the form. Please try again."
      );
      return;
    }

    if (userInput.length === 0) {
      toast.error("No items to add. Please enter some items.");
      return;
    }

    const invalidItems = userInput.filter(
      (item) => !item.ItemName || !item.unit || !item.quantity || !item.unitCost
    );

    console.log("invalidItems" + JSON.stringify(invalidItems));
    const negativeValue = userInput.filter((item) => item.quantity < 0);
    console.log("Negative Quantity" + JSON.stringify(negativeValue));

    if (invalidItems.length > 0) {
      toast.error("Some items have empty itemName, unit, quantity and cost.");
      return;
    }

    if (negativeValue.length > 0) {
      toast.error("Invalid quantity value. Please enter a none negative value");
      return;
    }

    let duplicate = false;

    const uniqueItemNames = new Set(); // Maintain a set for unique item names
    userInput.forEach((newItem) => {
      if (uniqueItemNames.has(newItem.ItemName)) {
        duplicate = true;
      }
      uniqueItemNames.add(newItem.ItemName);
    });

    if (duplicate === true) {
      console.log("starts the uniqueItems prompt");
      toast.error(`Item Duplicate . Please try again.`);
      return;
    }

    try {
      const response = await axios.get(`/api/storages?siteName=${site}`);
      const storage = response.data.find(
        (storage) => storage.siteName === selectedSite
      );
      const { _id, projectName } = storage;
      console.log(`ID: ${_id}`);
      console.log(`Project Name: ${projectName}`);

      const existingItemsMap = new Map(
        storage.siteTable.map((item) => [item.ItemName, item])
      );
      const existingCategory = new Map(
        storage.siteTable.map((item) => [item.category, item])
      );

      if (existingCategory === category) {
        toast.error("Invalid create of new Category. Please Try Again");
        return;
      }

      // Create an array to store the updated siteTable
      const updatedSiteTable = [];
      // Add all existing items to updatedSiteTable
      storage.siteTable.forEach((existingItem) => {
        updatedSiteTable.push(existingItem);
      });

      let similarItemFound = false;
      let similarCategory = false; // Flag to track similar items

      userInput.forEach((newItem) => {
        const stringSimilarity = require("string-similarity");

        const existingItem = existingItemsMap.get(newItem.ItemName);
        const newItemCategory = selectedCategory || category;

        // Check if newItemCategory matches any existing category
        if (
          selectedSiteCategories.includes(newItemCategory) &&
          !selectedCategory
        ) {
          // Handle the case where the user-input category is not allowed
          console.log("selectedSiteCtegories: " + selectedSiteCategories);
          similarCategory = true; // Abort further processing for this item
        }

        if (existingItem) {
          // Calculate the Levenshtein distance between the existing category and the selectedCategory (or category)

          const categorySimilarity = stringSimilarity.compareTwoStrings(
            existingItem.category,
            selectedCategory
          );
          const selected = stringSimilarity.compareTwoStrings(
            existingItem.category,
            category
          );

          if (categorySimilarity || selected > 0.99) {
            // You can adjust the similarity threshold as needed
            similarItemFound = true; // Set the flag to true if a similar item is found
            // Exit the function if a similar item is found
          }
        }
        newItem.materialCost = newItem.quantity * newItem.unitCost;
        newItem.category = selectedCategory || category;
        console.log("New Item Category:" + newItem.category);
        console.log(
          `New Item: ${newItem.ItemName}, Quantity: ${newItem.quantity}`
        );
        console.log(
          `New Item: ${newItem.ItemName}, Material Cost: ${newItem.materialCost}`
        );
        newItem = {
          ...newItem,
          siteName: site, // Assuming you want to add 'site' to newItem
        };
        updatedSiteTable.push(newItem);
      });

      if (similarItemFound) {
        // Show an error message if a similar item was found
        toast.error(
          "An item with a similar item name and category already exists. Change at least one and try again."
        );

        return; // Exit the function without showing success toast
      }
      if (similarCategory) {
        toast.error(
          "User-input category already exists in the table data. Please choose a different category."
        );
        return;
      }

      const updateResponse = await axios.put(`/api/storages/${_id}`, {
        siteName: storage.siteName,
        projectId: storage.projectId,
        siteTable: updatedSiteTable,
        projectName, // Preserve the projectName field while updating
      });
      handleUpdateSupplies();
      if (updateResponse.status === 200) {
        toast.success("Storage updated successfully!");
        setOpenModal(false);
        setCategory("");
        setSelectedCategory("");
        setUserInput([]);
        setRows([]);
        fetchStorageData();
      } else {
        toast.error("Failed to update the storage.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error occurred while updating the storage.");
    }
  };

  // Compute the revenue based on the material cost of all siteTable entries

  const handleGoBack = () => {
    navigate(-1);
  };

  //modified # idk bago to:
  const handleFileChange = (e) => {
    console.log("File change event triggered");
    const file = e.target.files[0];
    const reader = new FileReader();
    console.log("Selected file:", file);

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Process the jsonData and populate the input fields
      processExcelData(jsonData);
      // Open the add modal to display the imported data
      HandleOpenModal();
    };
    reader.readAsArrayBuffer(file);
  };

  const processExcelData = (data) => {
    console.log("Processing Excel data:", data);
    const requiredColumns = ["ItemName", "unit", "quantity", "unitCost"];
    const headers = Object.keys(data[0]).map((header) =>
      header.trim().toLowerCase()
    );
    // Clean and convert requiredColumns to lowercase
    const cleanedRequiredColumns = requiredColumns.map((column) =>
      column.trim().toLowerCase()
    );
    const missingColumns = cleanedRequiredColumns.filter(
      (column) => !headers.includes(column)
    );

    if (missingColumns.length > 0) {
      toast.error("Missing columns:", missingColumns);
      return;
    }

    const updatedRows = data.map((item, index) => {
      const { ItemName, unit, quantity, unitCost } = item;

      if (!ItemName || !unit || quantity < 0 || unitCost < 0) {
        toast.error(`Invalid data in row ${index + 2}: Missing values`);

        return null;
      }
      return {
        ItemName: item.ItemName,
        unit: item.unit,
        quantity: item.quantity || "0",
        unitCost: item.unitCost || "0",
      };
    });
    const validRows = updatedRows.filter((row) => row !== null);
    setRows(validRows);
    setUserInput(validRows); // Update the rows state with valid rows obtained from Excel
  };

  //modification inside the modal:

  const addRow = () => {
    setRows([...rows, { ItemName: "", unit: "", quantity: "", unitCost: " " }]);
  };

  const removeRow = (index) => {
    const updatedRows = [...rows];
    updatedRows.splice(index, 1);
    setRows(updatedRows);
    setUserInput(updatedRows);
  };

  const handleRowChange = (index, field, value) => {
    const updatedUserInput = [...userInput];

    if (updatedUserInput[index]) {
      // If data already exists at the specified index, update the field directly.
      updatedUserInput[index][field] = value;
    } else {
      // If no data exists at the specified index, create a new object with only the modified field.
      updatedUserInput[index] = { [field]: value };
    }
    setRows(updatedUserInput);
    setUserInput(updatedUserInput);
  };

  return (
    <div>
      {" "}
      <div className="container-admin">
        <section className="section-admin">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controller">
            {" "}
            <b>Main Inventory: {selectedSite}</b>
          </div>
        </section>
        <section className="section-back" onClick={() => handleGoBack()}>
          <FiArrowLeft />

          <div className="back">BACK</div>
        </section>
      </div>
      <div className="inventoryMain-container">
        <div className="title-main-inv">
          <div className="Site-name">
            Site Name: <div className="siteName">{selectedSite}</div>
          </div>

          <div className="Total-Products">
            Total Product :{" "}
            {filteredData.reduce(
              (count, site) =>
                count +
                site.siteTable.filter((item) => item.quantity > 0).length,
              0
            )}
          </div>
        </div>
        <div className="buttons-main-inv">
          <button onClick={handleCustomClick}>Storage Delivery Updates</button>
          <button onClick={HandleOpenModal}>Add Items</button>
        </div>
      </div>
      <div className="inventoryMain-container-table">
        <div className="inventoryMain-sub-container-table">
          <div className="Products">Products</div>
          <div className="stock"></div>

          <Modal
            open={openModal}
            onRequestClose={closeModal}
            label="Add BOM Item Modal"
            closeAfterTransition
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
          >
            <Fade in={openModal}>
              <div
                style={{
                  maxHeight: "600px",
                  overflowY: "auto",
                  inHeight: "600px",
                }}
              >
                <Box sx={modalStyle}>
                  <AiFillCloseCircle
                    onClick={closeModal}
                    className="AiFillCloseCircle"
                  />

                  <div className="material-request-form-title">
                    Add Items to Warehouse
                  </div>
                  <div className="instruction-material-req-form">
                    {" "}
                    <b>Instruction:</b>
                    Add the relevant materials needed for the specific
                    Warehouse. Classify according to Scope and category and
                    import excel files according to their material proper.
                  </div>

                  <div className="material-req-ops-modal-box">
                    <div className="BOM-Modal-content-box">
                      <div className="label-bom-details-box">
                        <label className="label-bom-details">
                          Select Existing Scope:
                        </label>

                        <div>
                          <select
                            value={selectedCategory}
                            onChange={(e) =>
                              setSelectedCategory(e.target.value)
                            }
                            // Disable if category has a value
                            disabled={!!category && !selectedCategory}
                          >
                            <option value="">Select Category</option>
                            {selectedSiteCategories.map((category) => (
                              <option value={category}>{category}</option>
                            ))}
                          </select>
                        </div>

                        <div className="label-bom-details-box">
                          <label
                            className="label-bom-details"
                            htmlFor="category"
                          >
                            {" "}
                            Create New Category:{" "}
                          </label>
                          <input
                            type="text"
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Input New Scope for this Project"
                            disabled={!!selectedCategory}
                            // Disable if selectedCategory has a value
                          />
                        </div>
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
                    </div>
                  </div>

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
                                Unit Cost
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
                                  row.ItemName.trim().toLowerCase() &&
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
                                    value={
                                      userInput[index]?.ItemName ||
                                      row.ItemName ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      handleRowChange(
                                        index,
                                        "ItemName",
                                        e.target.value
                                      )
                                    }
                                    placeholder={"Input item product"}
                                  />
                                </TableCell>

                                <TableCell>
                                  <input
                                    type="text"
                                    value={
                                      userInput[index]?.unit || row.unit || ""
                                    }
                                    onChange={(e) =>
                                      handleRowChange(
                                        index,
                                        "unit",
                                        e.target.value
                                      )
                                    }
                                    placeholder={"Input unit"}
                                  />
                                </TableCell>

                                <TableCell>
                                  <input
                                    type="number"
                                    value={
                                      userInput[index]?.quantity || row.quantity
                                    }
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
                                    value={
                                      userInput[index]?.unitCost || row.unitCost
                                    }
                                    onChange={(e) =>
                                      handleRowChange(
                                        index,
                                        "unitCost",
                                        e.target.value
                                      )
                                    }
                                    placeholder={"Input unitCost"}
                                  />
                                </TableCell>

                                <TableCell>
                                  <button
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => removeRow(index)}
                                  >
                                    {" "}
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

                  <div>
                    {/* Additional buttons */}
                    <button type="button" onClick={addRow}>
                      {" "}
                      Add Row
                    </button>
                    <button type="submit" onClick={addItem}>
                      {" "}
                      Add Item
                    </button>
                    <button type="button" onClick={closeModal}>
                      Cancel
                    </button>
                  </div>
                </Box>
              </div>
            </Fade>
          </Modal>
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

                  <button type="button" onClick={closeEditModal}>
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

          <select className="All-Sites" onChange={handleSiteChange}>
            {data
              .filter((item) => item.siteName === "Cainta Main Warehouse")
              .map((item) => (
                <option
                  className="site-value"
                  key={item._id}
                  value={item.siteName}
                >
                  {item.siteName}
                </option>
              ))}
          </select>
        </div>

        <TableContainer component={Paper}>
          <input
            className="search-main-inv"
            type="search"
            placeholder="Search by category or item name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
                  <TableCell>
                    <strong>Item Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Category</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Unit</strong>{" "}
                  </TableCell>
                  <TableCell>
                    <strong>Quantity</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Unit Cost</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Material Cost</strong>
                  </TableCell>
                  <TableCell>
                    <strong> Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredData.map((site) =>
                  site.siteTable
                    .filter(
                      (item) =>
                        item.category
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        item.ItemName.toLowerCase().includes(
                          searchQuery.toLowerCase()
                        )
                    )
                    .map((item) => {
                      // Determine the availability and corresponding color
                      let availability = "In Stock";
                      let color = "green";
                      if (item.quantity === 0) {
                        availability = "Out of Stock";
                        color = "red";
                      } else if (item.quantity < 10) {
                        availability = "Low Stock";
                        color = "orange";
                      }

                      return (
                        <TableRow key={item.itemId} hover>
                          <TableCell>{item.ItemName}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            {" "}
                            &#x20B1; {parseFloat(item.unitCost).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {" "}
                            &#x20B1; {parseFloat(item.materialCost).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <FaComment
                              className="edit-boms"
                              onClick={() => toggleModal(item)}
                            />
                            <FaPen
                              className="edit-boms"
                              onClick={() =>
                                editItem(
                                  item._id,
                                  item.ItemName,
                                  item.unit,
                                  item.quantity,
                                  item.unitCost,
                                  item.comment
                                )
                              }
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </div>
        </TableContainer>
      </div>
    </div>
  );
}

export default MainWarehouse;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AiFillCloseCircle } from "react-icons/ai";
import * as XLSX from "xlsx";
import "./PurchaseOrder.css";
import { FiArrowLeft } from "react-icons/fi";
import { FaTrashAlt, FaPen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Table,
  Typography,
  TableBody,
  TableCell,
  TextField,
  TableContainer,
  Modal,
  TableHead,
  Box,
  Fade,
  TablePagination,
  TableRow,
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

function Supplier() {
  const [setItemName] = useState("");
  const [supplierInputs, setSupplierInputs] = useState([
    { supplier: "", unitCost: "", id: " " },
  ]);
  const [category, setCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState([]);
  const [supplier, setSupplier] = useState([]);
  const [brand, setBrand] = useState("");
  const [items, setItems] = useState([{ ItemName: "", unitCost: "" }]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [setSearchResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [importedData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [editItemId, setEditItemId] = useState("");
  const [editItemName, setEditItemName] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editUnitCost, setEditUnitCost] = useState("");
  const [filteredCategories, setFilteredCategories] = useState("");
  const [setMessage] = useState("");
  const navigate = useNavigate();

  const fetchTableData = () => {
    axios
      .get("/api/supplies")
      .then((response) => {
        setTableData(response.data);
        if (response.data.length > 0) {
          setSupplierId(response.data[0]._id); // Assuming you want the first item's ID
        }
      })
      .catch((error) => {
        console.log(error);
        setError(
          "An error occurred while fetching the table data: " + error.message
        );
      });
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
    resetFormFields();
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  ///edit items
  const saveEditedItem = async (editItemId, event) => {
    event.preventDefault();
    console.log("editItemId" + editItemId);
    console.log("current supplier: " + selectedSupplier + " : " + supplierId);

    try {
      await axios.put(`/api/supplies/${supplierId}/items/${editItemId}`, {
        ItemName: editItemName,
        unit: editUnit,
        unitCost: editUnitCost,
      });

      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item._id === editItemId) {
            // Update the properties of the item
            item.ItemName = editItemName;
            item.unit = editUnit;
            item.unitCost = editUnitCost;
          }
          return item;
        })
      );

      closeModal();
      toast.success("Item Updated Successfully");
      fetchTableData();
    } catch (error) {
      console.error(error);
      console.error("Error editing item:", error);
    }
  };

  const editItem = (itemId, ItemName, unit, unitCost) => {
    setEditItemId(itemId);

    setEditItemName(ItemName);
    setEditUnit(unit);
    setEditUnitCost(unitCost);
    setIsModalOpen(true);
  };

  //delete item:
  const deleteItemAPI = async (supplierId, itemId) => {
    try {
      await axios.delete(`/api/supplies/${supplierId}/items/${itemId}`);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteItem = async (supplierId, item) => {
    try {
      // Display a confirmation toast before deleting the item
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this item?"
      );
      if (!confirmDelete) {
        return;
      }

      // Call the deleteItemAPI to delete the item from the server
      await deleteItemAPI(supplierId, item._id);
      console.log("Delete Item API: " + item._id);
      console.log("Supplier Id" + supplierId);
      // Display a success toast
      setItems((prevItems) =>
        prevItems.filter((prevItem) => prevItem._id !== item._id)
      );

      toast.success("Item deleted successfully.");
      fetchTableData();
    } catch (error) {
      console.error("Error deleting item:", error);

      // Display an error toast
      toast.error("Failed to delete item. Please try again.");
    }
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handlesupplierChange = (event) => {
    const selectedValue = event.target.value;
    setSupplierInputs(selectedValue);

    resetFormFields();
    // Find the selected supplier and set the corresponding suppliers
    const selectedSupplierData = tableData.find(
      (supplier) => supplier.supplier === selectedValue
    );
    if (selectedSupplierData) {
      const selectedSupplierId = selectedSupplierData._id;
    } else {
      setCategory("");
    }
    console.log("supplier id" + supplierId);
  };

  // Filter the data based on the selected supplier
  const filteredData = tableData.filter(
    (supplier) => supplier.supplier === supplierInputs
  );

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    console.log(`name: ${name}, value: ${value}`);
    const updatedItems = [...items];
    updatedItems[index][name] = value;
    console.log("Updated item:", updatedItems[index]);
    setItems(updatedItems);
  };

  const handleAddItem = () => {
    setItems([...items, { ItemName: "", unitCost: "", unit: "" }]);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const itemNameColumnIndex = 0; // Define the column index for the Item Name
      const unitColumnIndex = 1; // Define the column index for the Unit
      const unitCostColumnIndex = 2; // Define the column index for the Unit Cost

      // Create an array to store the filled items
      const filledItems = [];

      // Iterate through the rows in the Excel data
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];

        // Check if the row has values for all required columns
        if (
          row[itemNameColumnIndex] &&
          row[unitColumnIndex] &&
          row[unitCostColumnIndex]
        ) {
          // If all columns are filled, add the item
          filledItems.push({
            ItemName: row[itemNameColumnIndex],
            unitCost: row[unitCostColumnIndex],
            unit: row[unitColumnIndex],
          });
        }
      }

      setItems(filledItems);

      setIsModalOpen(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const resetCategoryDropdown = () => {
    // Assuming you have a state variable to control the category dropdown value
    setCategory("");
    setSelectedCategory("");
    setSelectedBrand("");
    setBrand("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirmation = window.confirm(`Are you sure you want to save Data?`);

    if (!confirmation) {
      return; // Abort saving if the user cancels the confirmation
    }

    if (!supplier && !selectedSupplier) {
      toast.error("Please select or enter a supplier.");
      return;
    }

    if (!brand && !selectedBrand) {
      toast.error("please select or add a new Brand");
      return;
    }

    if (!category && !selectedCategory) {
      toast.error("plese select or add a new category");
      return;
    }

    let hasEmptyFields = false;
    const updatedItems = items.map((item) => {
      if (!item.ItemName || !item.unitCost || !item.unit) {
        hasEmptyFields = true;
      }
      return item;
    });

    if (updatedItems.unitCost <= 0) {
      toast.error("The input value is invalid. Please input a valid Number.");
      return;
    }

    if (hasEmptyFields) {
      toast.error("Please fill in all the required fields.");
      return;
    }

    const updatedItemsWithCategory = updatedItems.map((item) => ({
      ...item,
      Itemname: item.ItemName,
      unit: item.unit,
      unitCost: item.unitCost,
      category: category || selectedCategory,
      brand: brand || selectedBrand,
    }));
    console.log("UpdatedItems: " + updatedItems);
    let duplicateItems = false;
    // in new items or add new:

    const existingSupplier = tableData.find(
      (data) => data.supplier === selectedSupplier
    );
    console.log(
      "Table Data (Supplier): " + JSON.stringify(existingSupplier, null, 2)
    );
    console.log("updated Items check:", items);

    if (existingSupplier) {
      const itemsWithDuplicateCategory = updatedItemsWithCategory.find((item) =>
        existingSupplier.items.some(
          (existingItem) =>
            existingItem.category === category.toLowerCase().trim()
        )
      );
      console.log("Duplicate Items with Category:", itemsWithDuplicateCategory);

      const itemsWithDuplicateBrand = updatedItemsWithCategory.filter((item) =>
        existingSupplier.items.some(
          (existingItem) => existingItem.brand === brand.toLowerCase().trim()
        )
      );
      console.log("Brand duplicate: " + itemsWithDuplicateBrand);

      const isDuplicateItem = existingSupplier.items.some((data) =>
        updatedItemsWithCategory.some(
          (item) => data.ItemName === item.ItemName && data.brand === item.brand
        )
      );

      console.log("Duplicate Items found in brand: " + isDuplicateItem);

      if (
        itemsWithDuplicateCategory === true ||
        isDuplicateItem === true ||
        itemsWithDuplicateBrand === true
      ) {
        duplicateItems = true;
        if (itemsWithDuplicateCategory === true) {
          toast.error(
            "One or more category name already exist for the selected supplier in the same category."
          );
          return;
        }

        if (itemsWithDuplicateBrand === true) {
          toast.error(
            "One or more brand name already exist for the selected supplier in the same Brand."
          );
          return;
        }

        if (isDuplicateItem === true) {
          toast.error(
            "One or more items already exist for the selected brand with matching names."
          );
          return;
        }
      }

      // Add the updated items to the existing supplier's items array
      const updatedSupplier = {
        ...existingSupplier,
        items: [...existingSupplier.items, ...updatedItemsWithCategory],
      };

      try {
        // Make a PUT request to update the existing supplier with the new items
        const response = await axios.put(
          `/api/supplies/${existingSupplier._id}`,
          updatedSupplier
        );
        console.log("Item added to the existing supplier:", response.data);
        toast.success("Item added to the existing supplier");
        resetFormFields();
        fetchTableData(); // Fetch updated table data after adding the item
      } catch (error) {
        console.log("Error adding item to the existing supplier:", error);
        toast.error("Failed to add item to the existing supplier");
      }
    } else {
      // Create a new supplier entry
      const newData = {
        supplier: supplier,
        items: updatedItemsWithCategory.map((item) => {
          return {
            ItemName: item.ItemName,
            unit: item.unit,
            unitCost: item.unitCost,
            category: category,
            brand: brand,
          };
        }),
      };
      console.log("Items in newData:", newData.items);

      const lowerCaseSupplier = supplier.toLowerCase().trim();
      const similarSupplier = tableData.find(
        (data) => lowerCaseSupplier === data.supplier.toLowerCase().trim()
      );

      if (similarSupplier) {
        toast.error(
          "Supplier with a similar name already exists. Please choose an existing supplier or provide a different name."
        );
        return;
      }

      try {
        // Make a POST request to create a new supplier entry
        const response = await axios.post("/api/supplies", newData);
        console.log("New supplier added:", response.data);
        toast.success("New supplier added");
        resetFormFields();
        fetchTableData();
        // Fetch updated table data after adding the new supplier
      } catch (error) {
        console.log("Error adding new supplier:", error);
        toast.error("Failed to add new supplier");
      }
    }
  };

  const resetFormFields = () => {
    setSelectedSupplier("");
    setSupplier("");
    setCategory("");
    setSelectedCategory("");
    setBrand("");
    setSelectedBrand("");
    setItems([{ ItemName: "", unitCost: "", unit: " " }]);
  };

  const handleSearch = () => {
    const filteredSuppliers = tableData.filter((supplier) =>
      supplier.supplier.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filteredSuppliers);
  };

  useEffect(() => {
    fetchTableData();
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleGoBack = () => {
    // Use navigate(-1) to go back to the previous page in the history stack
    navigate(-1);
  };

  console.log("filteredCategories" + filteredCategories);
  return (
    <div>
      <div className="container-admin">
        <section className="section-admin">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controller">
            <b>Supplier Management</b>
          </div>
        </section>
        <section className="section-back" onClick={handleGoBack}>
          <FiArrowLeft />
          <div className="back">BACK</div>
        </section>
      </div>
      {error && <div>{error}</div>}
      <div>
        <Modal
          open={isAddModalOpen}
          onRequestCloseModal={closeAddModal}
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

                <form onSubmit={handleSubmit}>
                  <div className="purchase-order-box-equip-bom">
                    <div className="purchase-order-subbox-equip-bom">
                      <div className="bom-instruct">
                        <h2>Supplier Database</h2>
                        <br />
                        <br />
                        <p className="instructions-modal">
                          {" "}
                          Add or Edit Supplier data by importing or manually
                          adding the input fields below..
                        </p>
                      </div>

                      <div className="Supplier-Modal-Content">
                        <div className="item-supplier">
                          <label htmlFor="supplier">
                            Select or Add Supplier:
                          </label>
                          <select
                            value={selectedSupplier}
                            onChange={(e) => {
                              setSelectedSupplier(e.target.value);
                              resetCategoryDropdown();
                            }}
                            disabled={!!supplier}
                          >
                            <option value="">-- Select Supplier --</option>
                            {tableData.map((data) => (
                              <option key={data._id} value={data.supplier}>
                                {data.supplier}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="item-supplier">
                          <label htmlFor="supplier"> Add New Supplier:</label>
                          <input
                            type="text"
                            id="supplier"
                            value={supplier}
                            onChange={(e) => setSupplier(e.target.value)}
                            placeholder="New Supplier Name"
                            disabled={!!selectedSupplier}
                          />
                        </div>

                        <div className="item-supplier">
                          <label htmlFor="category">Select Category:</label>
                          <select
                            value={selectedCategory}
                            onChange={(e) =>
                              setSelectedCategory(e.target.value)
                            }
                          >
                            <option value="">-- Select Category --</option>
                            {tableData
                              .filter(
                                (data) => data.supplier === selectedSupplier
                              )
                              .reduce((uniqueCategories, filteredData) => {
                                filteredData.items.forEach((item) => {
                                  if (
                                    !uniqueCategories.includes(item.category)
                                  ) {
                                    uniqueCategories.push(item.category);
                                  }
                                });
                                return uniqueCategories;
                              }, [])
                              .map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}{" "}
                          </select>
                        </div>
                        <div className="item-supplier">
                          <label htmlFor={`category`}>Add New Category:</label>
                          <input
                            type="text"
                            id={`category`}
                            name="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)} // Use e.target.value
                            placeholder="New Category Name"
                            disabled={!!selectedCategory}
                          />
                        </div>

                        <div className="item-supplier">
                          <label htmlFor="category">Select Brand Name:</label>
                          <select
                            value={selectedBrand}
                            onChange={(e) => setSelectedBrand(e.target.value)}
                            disabled={!!brand}
                          >
                            <option value="">-- Select Brand --</option>
                            {tableData
                              .filter(
                                (data) => data.supplier === selectedSupplier
                              )
                              .reduce((uniqueBrands, filteredData) => {
                                filteredData.items.forEach((item) => {
                                  if (!uniqueBrands.includes(item.brand)) {
                                    uniqueBrands.push(item.brand);
                                  }
                                });
                                return uniqueBrands;
                              }, [])
                              .map((brand) => (
                                <option key={brand} value={brand}>
                                  {brand}
                                </option>
                              ))}
                          </select>
                        </div>

                        <div className="item-supplier">
                          <label htmlFor={`brand`}>Add New Brand:</label>
                          <input
                            type="text"
                            id={`brand`}
                            name="Brand"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)} // Use e.target.value
                            placeholder="New Category Name"
                            disabled={!!selectedBrand}
                          />
                        </div>

                        <div className="item-supplier">
                          <label htmlFor="import">Import Supplier Data:</label>
                          <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleImportExcel}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/*Modal ito for editing */}

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
                        {items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <TextField
                                type="text"
                                id={`ItemName-${index}`}
                                name="ItemName"
                                value={
                                  item.ItemName ||
                                  importedData[index]?.ItemName ||
                                  ""
                                }
                                onChange={(e) => handleInputChange(index, e)}
                                placeholder="Input Item Name"
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                type="text"
                                id={`unit-${index}`}
                                name="unit"
                                value={
                                  item.unit || importedData[index]?.unit || ""
                                }
                                onChange={(e) => handleInputChange(index, e)}
                                placeholder="Input unit"
                              />
                            </TableCell>{" "}
                            <TableCell>
                              <TextField
                                type="text"
                                id={`unitCost-${index}`}
                                name="unitCost"
                                value={
                                  item.unitCost ||
                                  importedData[index]?.unitCost ||
                                  ""
                                }
                                onChange={(e) => handleInputChange(index, e)}
                                placeholder="Input Unit Cost"
                              />
                            </TableCell>
                            <TableCell>
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                              >
                                Remove{" "}
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <button type="button" onClick={handleAddItem}>
                    Add Item
                  </button>
                  <button type="button" onClick={handleSubmit}>
                    Submit
                  </button>
                </form>
              </Box>
            </div>
          </Fade>
        </Modal>
        <Modal
          style={
            {
              /* Add inline styles here */
            }
          }
          open={isModalOpen}
          onRequestCloseModal={closeModal}
          contentLabel="Edit Supplier" // Correct usage of contentLabel
          className="centered-modal"
        >
          <div className="modal-overlay-admin">
            <div className="modal-content-admin">
              <form onSubmit={saveEditedItem}>
                <h2>Edit Item</h2>
                <br />
                <div>
                  <label htmlFor="editItemName">ItemName:</label>
                  <input
                    type="text"
                    id="editItemName"
                    value={editItemName}
                    // disabled={!!editItemName}
                    onChange={(e) => setEditItemName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="editUnit">Unit:</label>
                  <input
                    type="text"
                    id="editUnit"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="editUnitCost">Unit Cost:</label>
                  <input
                    type="number"
                    id="editUnitCost"
                    value={editUnitCost}
                    onChange={(e) => setEditUnitCost(e.target.value)}
                  />
                </div>
              </form>
              <button onClick={(e) => saveEditedItem(editItemId, e)}>
                Save
              </button>
              <button type="button" onClick={closeModal}>
                {" "}
                Cancel{" "}
              </button>
            </div>
          </div>
        </Modal>

        <div className="inventoryMain-container-table">
          <div className="inventoryMain-sub-container-table">
            <div>
              <select
                className="All-Sites"
                value={supplierInputs}
                onChange={handlesupplierChange}
              >
                <option className="site-value" value="">
                  Select Supplier
                </option>
                {tableData.map((supplier) => (
                  <option
                    className="site-value"
                    key={supplier.supplier}
                    value={supplier.supplier}
                  >
                    {supplier.supplier}
                  </option>
                ))}
              </select>
              <button onClick={openAddModal}>Add Supplier</button>
              <input
                className="search-main-supplier"
                type="search"
                placeholder="Search by category or item name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          {filteredData.length > 0 ? (
            <TableContainer component={Paper}>
              <Table size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <b>Supplier</b>
                    </TableCell>
                    <TableCell>
                      {" "}
                      <b>Category</b>{" "}
                    </TableCell>
                    <TableCell>
                      {" "}
                      <b>Brand</b>{" "}
                    </TableCell>
                    <TableCell>
                      <b>Item Name</b>
                    </TableCell>
                    <TableCell>
                      <b>Unit</b>
                    </TableCell>
                    <TableCell>
                      <b>Unit Cost</b>
                    </TableCell>
                    <TableCell>
                      {" "}
                      <b>Actions</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((supplier) =>
                    supplier.items
                      .filter((item) => {
                        // Check if item, item.category, and item.ItemName are defined
                        if (item && item.category && item.ItemName) {
                          return (
                            item.category
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            item.ItemName.toLowerCase().includes(
                              searchQuery.toLowerCase()
                            )
                          );
                        }
                        return false; // Ignore items with missing or undefined properties
                      })
                      .map((item, index) => (
                        <TableRow
                          key={index}
                          hover
                          style={{
                            backgroundColor:
                              index % 2 === 0 ? "#f0f0f0" : "white",
                          }}
                        >
                          <TableCell>{supplier.supplier}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.brand}</TableCell>
                          <TableCell>{item.ItemName}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>&#x20B1; {item.unitCost}</TableCell>
                          <TableCell>
                            <div className="edit-delete-bom">
                              <FaPen
                                className="edit-boms"
                                onClick={() =>
                                  editItem(
                                    item._id,
                                    item.ItemName,
                                    item.unit,
                                    item.unitCost
                                  )
                                }
                              />

                              <FaTrashAlt
                                className="edit-boms"
                                onClick={() => deleteItem(supplier._id, item)}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>

              <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={filteredData.length} // Use filteredData length for the total count
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Supplier Name
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Category
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Brand
                      </Typography>
                    </TableCell>
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
                  {tableData.map((supplier) =>
                    supplier.items.map((item, index) => (
                      <TableRow
                        key={index}
                        hover
                        style={{
                          backgroundColor:
                            index % 2 === 0 ? "#f0f0f0" : "white",
                        }}
                      >
                        <TableCell>{supplier.supplier}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.brand}</TableCell>
                        <TableCell>{item.ItemName}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>&#x20B1; {item.unitCost}</TableCell>
                        <TableCell>
                          <div className="edit-delete-bom">
                            <FaPen
                              className="edit-boms"
                              onClick={() =>
                                editItem(
                                  item._id,
                                  item.ItemName,
                                  item.unit,
                                  item.unitCost,
                                  item.category,
                                  item.brand
                                )
                              }
                            />

                            <FaTrashAlt
                              className="edit-boms"
                              onClick={() => deleteItem(supplier._id, item)}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={filteredData.length} // Use filteredData length for the total count
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default Supplier;

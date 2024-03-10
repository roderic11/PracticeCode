import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiArrowLeft } from "react-icons/fi";
import { useSelector } from "react-redux";
import "./s.css";
import PriceSide from "./pricing-side";
import stringSimilarity from "string-similarity";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
function Pricing() {
  const [formData, setFormData] = useState({
    mrf: [],
  });

  //---------for fetching projects dropdown--------------------//
  const [dateNeeded, setDateNeeded] = useState("");
  const [dateRequested, setDateRequested] = useState("");
  const { user } = useSelector((state) => state.auth);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedMRF, setSelectedMRF] = useState("");
  const [selectedMRFData, setSelectedMRFData] = useState(" ");
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [projectName, setProjctName] = useState("");
  const [tableData, setTableData] = useState([]);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [targetDate, setTargetDate] = useState("");
  const [sender, setSender] = useState(user.name);
  //-------for supplier database-------//
  const [suppliers, setSupplierData] = useState([]);
  const [selectedSupplier] = useState("");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();
  // Define filteredSuppliers state variable
  //----------------for supplier DataBase ------------------//

  const fetchData = async () => {
    try {
      const projectsResponse = await axios.get("/api/mrf");
      setProjects(projectsResponse.data);

      const supplierResponse = await axios.get("/api/supplies");
      setSupplierData(supplierResponse.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const openModal = () => {
    setShowModal(true);
  };

  const items = projects
    .map((project) => project.items)
    .flat()
    .filter((item) => item.stockRequest);

  console.log(items);

  // Define selectedMRF state variable

  const handleMRFChange = (event) => {
    const selectedMRFName = event.target.value;
    setSelectedMRF(selectedMRFName);

    console.log("selected MRF:", selectedMRFName);
    // Find TableCelle selected project based on TableCelle selected MRF name
    const selectedMRF = projects.find(
      (project) =>
        project.name === selectedProject && project.mrfName === selectedMRFName
    );

    console.log("selected MRF content:", selectedMRF);

    // Check if TableCelle selected project is defined
    if (selectedMRF) {
      setFormData({
        ...formData,
        dateNeeded: dateNeeded,
        dateRequested: dateRequested,
        targetDelivery: targetDate,
        mrf: selectedMRF.items.map((item) => ({
          product: item.product,
          unit: item.unit,
          quantity: item.quantity,
        })),
      });

      // Filter TableCelle table data based on TableCelle selected project ID and TableCelle selected MRF name
      setSelectedMRFData(selectedMRF ? selectedMRF.items : []);
      setFilteredData([selectedMRFData]);
      setTableData(selectedMRF.items);
      setLocation(selectedMRF.location);
      setDateNeeded(selectedMRF.dateNeeded); // Set dateNeeded value
      setDateRequested(selectedMRF.dateRequested);
      fetchData();
    }
  };

  useEffect(() => {
    const filteredTableData = tableData.filter(
      (item, itemIndex) =>
        itemIndex >= page * rowsPerPage &&
        itemIndex < page * rowsPerPage + rowsPerPage
    );

    setFilteredData(filteredTableData);
  }, [
    tableData,
    page,
    rowsPerPage,
    selectedMRF,
    selectedProject,
    selectedSupplier,
  ]);
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  const handleProjectChange = (event) => {
    const selectedProjectId = event.target.value;
    setSelectedProject(selectedProjectId);
    setSelectedMRF(" ");

    // Clear the table data and filtered data
    setTableData([]);
    setFilteredData([]);
    fetchData();
    console.log("selectedProjectId:", selectedProjectId);
    console.log(projects);
    // Find the selected project from the projects array
    const selectedProject = projects.find(
      (project) => project.name === selectedProjectId
    );
  };

  const getCurrentDate = () => {
    const currentDate = new Date().toLocaleDateString("en-US");
    return currentDate;
  };
  //--------------------------

  const handleSupplierChange = (
    event,
    rowIndex,
    tableData,
    suppliers,
    setTableData
  ) => {
    const selectedItemId = event.target.value; // Assuming the value of the dropdown is the selected item ID
    console.log("Selected Item ID:", selectedItemId);

    // If there is no selected MRF, display an error message
    const selectedMRF = getSelectedMRF(); // Assuming you have a function to get selected MRF
    if (!selectedMRF) {
      toast.error("Choose MRF Content first");
      return;
    }

    console.log("Selected Item ID:", selectedItemId);
    const updatedTableData = tableData.map((tableItem, index) => {
      if (index === rowIndex) {
        console.log(
          "Current Row Inspection - unit cost:" + JSON.stringify(tableItem)
        );
        console.log("Table Data - brand:" + tableItem.supplier);
        // Find the selected item based on the chosen ID
        const selectedItem = suppliers
          .map((supplier) => supplier.items)
          .reduce((allItems, items) => allItems.concat(items), [])
          .find((item) => item._id === selectedItemId);

        if (selectedItem) {
          console.log("Selected Item Properties:", selectedItem);

          selectedItem.supplierInfo = suppliers.find((supplier) =>
            supplier.items.some((item) => item._id === selectedItemId)
          );
          console.log(
            "SelectedItem Info: " + selectedItem.supplierInfo.supplier
          );

          // Update the tableItem with the selected item's unit cost and other relevant data
          return {
            ...tableItem,
            unitCost: selectedItem.unitCost.toFixed(2), // Assuming unitCost is a number
            materialCost: (tableItem.quantity * selectedItem.unitCost).toFixed(
              2
            ), // Assuming materialCost is based on unitCost and quantity
            supplier: `${selectedItem.supplierInfo.supplier} - ${selectedItem.brand}`, // Store the brand as the supplier for this case
          };
        } else {
          setShowModal(true);
          toast.error("Selected item not found");
          return {
            ...tableItem,
            unitCost: undefined,
            materialCost: undefined,
            supplier: undefined,
          };
        }
      }
      return tableItem;
    });

    setTableData(updatedTableData);
  };

  // Placeholder function to get the selected MRF content
  const getSelectedMRF = () => {
    // Implement the logic to fetch the selected MRF content here
    return selectedMRF;
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const redirectToSupplierDatabase = () => {
    window.location.href = "/supplier"; // Replace wiTableCell TableCelle actual URL of TableCelle supplier database page
  };

  //-------------------------------

  const handleSubmit = async () => {
    const confirmed = window.confirm("Are you sure you want to submit?");
    if (!confirmed) {
      return; // Stop the submission process if user cancels
    }

    // Check if required fields are filled
    if (!selectedMRF || !selectedProject || !targetDate) {
      toast.error("Please fill in all pricing info");
      return;
    }

    if (
      !sender ||
      tableData.some((item) => item.proccuredQuantity > 0 && !item.supplier)
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const pricingName = `${selectedProject} - ${selectedMRF}`;
      const submissionData = {
        title: pricingName,
        location: location,
        dateNeeded: dateNeeded,
        dateRequested: dateRequested,
        targetDelivery: targetDate,
        date: getCurrentDate(),
        sender: sender,
        tableData: tableData.map((item, itemIndex) => {
          const warehouseUnitCost =
            item.stockRequest !== null && item.stockRequest !== 0
              ? getCaintaUnitCost(itemIndex)
              : 0;
          const warehouseMaterialCost =
            item.stockRequest * (warehouseUnitCost || 0);

          const proccuredMaterialCost =
            parseInt(item.unitCost || 0) *
            parseInt(item.proccuredQuantity || 0);
          const warehouse =
            item.stockRequest !== null
              ? "Cainta Main Warehouse"
              : "No stock Available in this site";

          return {
            ItemName: item.product,
            unit: item.unit,
            quantity: item.quantity, //this is the total quantity
            supplier: item.supplier || "-",
            unitCost: item.unitCost || 0,
            subCategory: item.subCategory,
            materialCost: item.materialCost || 0,
            proccuredQuantity: item.proccuredQuantity || 0,
            proccuredMaterialCost: proccuredMaterialCost || 0,
            warehouseMaterialCost: warehouseMaterialCost,
            warehouseUnitcost: warehouseUnitCost,
            stockRequest: item.stockRequest,
            warehouse: warehouse,
          };
        }),
      };

      console.log("Submission Data:", submissionData);
      // Perform TableCelle submission to TableCelle API endpoint
      const response = await axios.post(
        "/api/submissions/submit",
        submissionData
      );

      // Handle TableCelle response as per your requirements
      toast.success("Submission successful:", response.data);

      // Update TableCelle submission status
      setSubmissionStatus("Submitted");
      window.location.reload();
    } catch (error) {
      // Handle errors during submission
      toast.error("Failed to submit data:", error);
    }
  };
  // for the second dropdown
  const handleCaintaSupplierChange = (
    event,
    itemIndex,
    tableData,
    setTableData
  ) => {
    // Perform any specific logic for the Cainta Main Warehouse dropdown, if needed

    // Update the table data for the Cainta Main Warehouse
    const updatedTableData = [...tableData];
    updatedTableData[itemIndex] = {
      ...updatedTableData[itemIndex],
      supplier: "Cainta Main Warehouse",
    };
    setTableData(updatedTableData);
  };

  const getCaintaUnitCost = (itemIndex) => {
    const productName = tableData[itemIndex].product.trim().toLowerCase();

    // Find the best-matching item using string similarity
    const bestMatch = suppliers
      .find((supplier) => supplier.supplier === "Cainta Main Warehouse")
      ?.items.reduce(
        (best, item) => {
          const similarity = stringSimilarity.compareTwoStrings(
            productName,
            item.ItemName.trim().toLowerCase()
          );
          if (similarity > best.similarity) {
            return { ...item, similarity };
          }
          return best;
        },
        { similarity: 0 }
      );

    return bestMatch?.unitCost;
  };

  //handle go back for back buttono:
  const handleGoBack = () => {
    // Use navigate(-1) to go back to the previous page in the history stack
    navigate(-1);
  };

  // Open the modal immediately when the "Pricing" tab is clicked
  React.useEffect(() => {
    openModal();
  }, []);
  //-------------------------------

  return (
    <div>
      <div className="container-admin">
        <section className="section-admin">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controller">Pricing</div>
        </section>
        <section className="section-back" onClick={handleGoBack}>
          <FiArrowLeft />
          <div className="back">BACK</div>
        </section>
      </div>
      <div className="price-main">
        <div className="price-main-sub1">
          <div className="pricing-container">
            <div>Choose Project to Price</div>
            <div className="pricing-sub-container">
              <div className="input-container">
                <label htmlFor="project">Select Project:</label>
                <select
                  id="project"
                  value={selectedProject}
                  onChange={handleProjectChange}
                >
                  <option value="">Select Project</option>
                  {Array.from(
                    new Set(projects.map((project) => project.name))
                  ).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-container">
                <label htmlFor="mrf">Select MRF:</label>
                <select id="mrf" value={selectedMRF} onChange={handleMRFChange}>
                  <option value="">Select MRF</option>
                  {projects
                    .filter((project) => project.name === selectedProject)
                    .map((project) => (
                      <option key={project._id} value={project.mrfName}>
                        {project.mrfName}
                      </option>
                    ))}
                </select>
              </div>

              <div className="input-container">
                <label htmlFor="deliveryDate">Target Delivery Date:</label>
                <input
                  id="deliveryDate"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>

              <div className="input-container">
                <label htmlFor="sender">Sender:</label>
                <input
                  id="sender"
                  type="text"
                  placeholder="Enter Sender"
                  className="sender-input"
                  value={sender}
                  onChange={(e) => setSender(user.name)}
                />
              </div>
            </div>
          </div>
          <div className="pricing-table">
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
                      <TableCell>
                        <strong>Item #</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Category</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Item Name</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Unit</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Stock Requests</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Procured Quantity</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Supplier</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Unit Cost</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Material Cost</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {console.log(tableData)}
                    {filteredData.map((item, itemIndex) => (
                      <React.Fragment key={`${item.id}-${itemIndex}`}>
                        <TableRow hover>
                          <TableCell>{itemIndex + 1}</TableCell>
                          <TableCell>{item.subCategory}</TableCell>
                          <TableCell
                            style={{
                              maxWidth: "200px",
                              whiteSpace: "wrap",
                            }}
                          >
                            {item.product}
                          </TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>{item.proccuredQuantity}</TableCell>
                          <TableCell>
                            <select
                              className="price-select"
                              onChange={(event) =>
                                handleSupplierChange(
                                  event,
                                  itemIndex,
                                  tableData,
                                  suppliers,
                                  setTableData
                                )
                              }
                              disabled={item.proccuredQuantity === 0}
                            >
                              <option>Select Supplier</option>
                              {suppliers
                                .filter(
                                  (supplier) =>
                                    supplier.supplier !==
                                    "Cainta Main Warehouse"
                                )
                                .map((supplier) => {
                                  // Filter the items to include only matching items based on some condition
                                  const matchingItems = supplier.items.filter(
                                    (item) => {
                                      const brand = item.brand; // Replace 'brand' with the actual property name for the brand
                                      const itemId = item._id; // Assuming you have an item ID
                                      const productName = tableData[
                                        itemIndex
                                      ].product
                                        .trim()
                                        .toLowerCase();
                                      const itemName =
                                        item.ItemName.trim().toLowerCase();

                                      // Adjust the condition to match your criteria for displaying items
                                      return productName === itemName; // For example, display items where product name matches item name
                                    }
                                  );

                                  // Render the matching items as options
                                  return (
                                    <optgroup
                                      key={supplier._id}
                                      label={supplier.supplier}
                                    >
                                      {matchingItems.map((item) => {
                                        const brand = item.brand; // Replace 'brand' with the actual property name for the brand
                                        const itemId = item._id; // Assuming you have an item ID

                                        return (
                                          <option key={itemId} value={itemId}>
                                            {`${
                                              supplier.supplier
                                            } - ${brand} (Unit Cost: ${item.unitCost.toFixed(
                                              2
                                            )})`}
                                          </option>
                                        );
                                      })}
                                    </optgroup>
                                  );
                                })}
                            </select>
                          </TableCell>

                          <TableCell>
                            &#x20B1;{" "}
                            {item.unitCost !== undefined
                              ? item.unitCost
                              : item.supplier === ""
                              ? "0"
                              : "-"}
                          </TableCell>

                          <TableCell>
                            &#x20B1;{" "}
                            {parseInt(item.unitCost) *
                              (parseInt(item.quantity) -
                                parseInt(item.stockRequest))}
                          </TableCell>
                        </TableRow>
                        {item.stockRequest !== null &&
                          item.stockRequest !== 0 && (
                            <TableRow>
                              <TableCell>-</TableCell>
                              <TableCell>-</TableCell>
                              <TableCell
                                style={{
                                  maxWidth: "200px",
                                  whiteSpace: "wrap",
                                }}
                              >
                                {item.product}
                              </TableCell>
                              <TableCell>{item.unit}</TableCell>
                              <TableCell style={{ color: "green" }}>
                                {item.stockRequest}
                              </TableCell>
                              <TableCell>-</TableCell>
                              <TableCell>
                                {/* Fixed value to "Cainta Main Warehouse" */}
                                <select
                                  value="Cainta Main Warehouse"
                                  onChange={(event) =>
                                    handleCaintaSupplierChange(
                                      event,
                                      itemIndex,
                                      tableData,
                                      setTableData
                                    )
                                  }
                                >
                                  <option value="Cainta Main Warehouse">
                                    Cainta Main Warehouse
                                  </option>
                                </select>
                              </TableCell>
                              <TableCell>
                                {item.stockRequest !== null &&
                                item.stockRequest !== 0
                                  ? getCaintaUnitCost(itemIndex) !== undefined
                                    ? getCaintaUnitCost(itemIndex)
                                    : tableData[itemIndex]?.unitCost || "-"
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                {item.stockRequest !== null &&
                                item.stockRequest !== 0
                                  ? item.stockRequest *
                                    (getCaintaUnitCost(itemIndex) || 0)
                                  : "-"}
                              </TableCell>
                            </TableRow>
                          )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <TablePagination
                style={{ position: "sticky", top: 0, zIndex: 1 }}
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={filteredData.length} // Use filteredData lengTableCell for TableCelle total count
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          </div>
          <div className="button-pricing-container">
            <button
              className="button-pricing"
              onClick={handleSubmit}
              disabled={submissionStatus === "Submitted"}
            >
              Submit for Approval
            </button>
          </div>
          {submissionStatus && <p>Submission Status: {submissionStatus}</p>}
        </div>
        <div className="price-side-container">
          <PriceSide />
        </div>
      </div>
      {showModal && (
        <div className="modal">
          <div className="item-overlay">
            <div className="access-denied-modal">
              <div className="title-access">Supplier Database </div>
              <br />
              <p>Is the supplier database available?</p>
              <div className="modal-buttons">
                <button onClick={closeModal}>Yes</button>
                <button onClick={redirectToSupplierDatabase}>
                  Go to Supplier Database
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Pricing;

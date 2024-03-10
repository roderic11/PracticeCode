import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AiFillCloseCircle } from "react-icons/ai";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import stringSimilarity from "string-similarity";
import { AiFillCheckCircle } from "react-icons/ai";
import { toast } from "react-toastify";
import { FiArrowLeft } from "react-icons/fi";
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

import CircularProgress from "@mui/material/CircularProgress";

const modalStyle = {
  position: "absolute",
  top: "50%",
  height: "650px",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1490,
  overflow: "auto",
  maxHeight: "650px",
  bgcolor: "background.paper",
  borderRadius: "5px",
  boxShadow: 24,
  padding: "20px",
  backgroundColor: "#f4f4f4",
};
const Mrf = () => {
  const [formData, setFormData] = useState("");
  const [modifiedQuantities, setModifiedQuantities] = useState({});
  const [boms, setBoms] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [mrfs, setMrf] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [Sites, setSelectedSite] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [loading, setLoading] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [matchingMrfs, setMatchingMrfs] = useState([]);
  const [mrfItems, setMrfItems] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [siteNames, setSiteNames] = useState([]);
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const navigate = useNavigate();
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedBomsId, setSelectedBomsId] = useState("");
  const [selectedBoms, setSelectedBoms] = useState("");
  const [selectedMrfName, setSelectedMrfName] = useState("");
  const [filteredTableData, setFilteredTableData] = useState([]);
  const [hasRemarks, setHasRemarks] = useState(false);
  const [mrfData, setMrfData] = useState([]);
  const [bomItems, setBomItems] = useState({});
  const [projectName, setProjectName] = useState([]);
  const totalItems =
    projects.find((project) => project._id === selectedProject)?.items.length ||
    0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToDisplay =
    projects
      .find((project) => project._id === selectedProject)
      ?.items.slice(startIndex, endIndex) || [];
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        "/api/MaterialRequestOps/material-requests"
      );
      setProjects(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setError("Error fetching projects.");
      setLoading(false);
    }
  };

  const fetchBom = async () => {
    try {
      const response = await axios.get("/api/projects");
      setBoms(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setError("Error fetching projects.");
      setLoading(false);
    }
  };
  const fetchMrf = async () => {
    try {
      const response = await axios.get("/api/mrf");
      setMrf(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setError("Error fetching MRFs.");
      setLoading(false);
    }
  };

  const fetchSite = async () => {
    try {
      const response = await axios.get("/api/storages");
      const storages = response.data.map((storage) => ({
        id: storage._id,
        siteName: storage.siteName,
        siteTable: storage.siteTable,
        projectName: storage.projectName,
      }));
      setSelectedSite(storages);
      const names = storages.map((storage) => storage.siteName);
      setSiteNames(names);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setError("Error Fetching Site Data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMrf();
    fetchProjects();
    fetchSite();
    fetchBom();
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    // When selectedProjectId changes, update the mrfData with the relevant MRF names
    if (selectedProjectId) {
      const filteredData = projects
        .filter((project) => project._id === selectedProjectId)
        .flatMap((project) =>
          project.tableData.map((entry) => ({
            mrfName: entry.mrfName,
            username: entry.username,
            dateRequested: entry.dateRequested,
            dateNeeded: entry.dateNeeded,
          }))
        );

      setMrfData(filteredData);
    }
  }, [selectedProjectId, projects]);

  const handleBomsChange = async (event) => {
    const selectedBomsId = event.target.value;
    setSelectedBoms(selectedBomsId);

    setFormData((prevFormData) => ({
      ...prevFormData,
      projectId: selectedBomsId, // Save TableCelle selected project ID
    }));

    const selectedBoms = boms.find((bom) => bom._id === selectedBomsId);

    if (selectedBoms) {
      const { name, location } = selectedBoms;
      setFormData((prevFormData) => ({
        ...prevFormData,
        name,
        location,
      }));
    }

    try {
      const response = await axios.get(`/api/mrf`);
      const matchingMrfs = response.data.filter(
        (mrf) => mrf.name === selectedBoms.name
      );

      if (matchingMrfs.lengTableCell > 0) {
        setMrfItems(matchingMrfs);
        setMatchingMrfs(matchingMrfs); // Update matchingMrfs state variable
      } else {
        setMrfItems([]);
        setMatchingMrfs([]); // Update matchingMrfs state variable
      }
    } catch (error) {
      console.error(error);
      setError("Error fetching MRFs.");
    }
  };

  const handleProjectChange = (event) => {
    const selectedProjectId = event.target.value;
    setSelectedProjectId(selectedProjectId);
    setSelectedMrfName("");
    setFilteredTableData([]); // Clear filteredTableData when a new project is selected

    // Assuming you have the 'answers' data from the API call to '/api/projects'
    const selectedProject = projects.find(
      (project) => project._id === selectedProjectId
    );

    // Check if the selectedProject exists before extracting the name and location
    if (selectedProject) {
      setProjectName(selectedProject.name);
      const projectLocation = selectedProject.location;
      console.log("Selected Project Name:", projectName);
      console.log("Selected Project Location:", projectLocation);
    } else {
      console.log("Selected project not found.");
    }
  };

  const handleMrfNameChange = (event) => {
    const selectedMrfName = event.target.value;
    setSelectedMrfName(selectedMrfName);

    // Filter the table data based on the selectedProjectId and selectedMrfName
    const filteredData = projects
      .filter((project) => project._id === selectedProjectId)
      .flatMap((project) =>
        project.tableData.filter((entry) => entry.mrfName === selectedMrfName)
      );

    // Update the filteredTableData state with the filtered data
    setFilteredTableData(filteredData);
  };

  useEffect(() => {
    const handleBomItemQuantity = async () => {
      try {
        if (!projectName || typeof projectName !== "string") {
          console.error("Invalid projectName:", projectName);
          setBomItems({}); // Return an empty object if projectName is invalid
          return;
        }

        const answers = await axios.get("/api/projects"); // Replace '/api/projects' with your actual projects API endpoint
        const boms = answers.data;
        const bomDataset = boms.map((bom) => {
          const name = bom.name;
          const location = bom.location;
          const items = bom.items;
          return { name, location, items }; // Return an object with name and location properties
        });

        const data = bomDataset.filter(
          (bom) =>
            bom.name?.trim().toLowerCase() === projectName.trim().toLowerCase()
        );

        console.log("data:", data);

        const bomItemsData = {};

        if (data.length > 0) {
          // Check if data has any elements (i.e., there is a matching BOM)
          const bomValue = data[0].items; // Get the 'items' array from the first matching BOM entry

          filteredTableData.forEach((tableEntry, itemIndex) => {
            tableEntry.items.forEach((item, index) => {
              const matchingName = bomValue.find((product) => {
                const bomProductName = product?.product?.trim().toLowerCase();
                const tableProductName = item?.product?.trim().toLowerCase();
                const bomProductScope = product?.category?.trim().toLowerCase();
                const tableProductScope = item?.scope?.trim().toLowerCase();
                const similarity = stringSimilarity.compareTwoStrings(
                  bomProductName,
                  tableProductName
                );
                return (
                  similarity > 0.9 && // Adjust the similarity threshold as needed
                  bomProductScope === tableProductScope && // Check for the selected scope
                  tableProductName !== "" // Skip if the table product name is empty
                );
              });

              const quantity = matchingName
                ? matchingName.quantity
                : "No available Data for this";

              bomItemsData[item._id] = quantity;
            });
          });

          // Update the state with the fetched data
          setBomItems(bomItemsData);
        } else {
          // Handle the case when no matching BOM is found
          setBomItems({}); // Set bomItems to an empty object
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    handleBomItemQuantity(); // Call the function on component mount and whenever projectName or selectedMrfName changes
  }, [projectName, selectedMrfName, filteredTableData]); // Add projectName, selectedMrfName, and filteredTableData as dependencies to useEffect

  const selectedSiteName = "Cainta main Warehouse"; // Replace with the actual fixed site name

  const handleSiteSelection = () => {
    // Find the selected site based on the fixed site name
    const selectedSite = Sites.find(
      (site) =>
        site.siteName?.trim().toLowerCase() ===
        selectedSiteName?.trim().toLowerCase()
    );

    if (selectedSite) {
      const siteTableValues = selectedSite.siteTable;

      const updatedQuantities = {};

      // Iterate over the items and update the quantities
      filteredTableData.forEach((tableEntry, itemIndex) => {
        tableEntry.items.forEach((item, index) => {
          const matchingSite = siteTableValues.find((siteItem) => {
            const similarity = stringSimilarity.compareTwoStrings(
              siteItem.ItemName?.trim().toLowerCase(),
              item.product?.trim().toLowerCase()
            );
            return similarity > 0.9; // Adjust the similarity threshold as needed
          });

          const quantity = matchingSite ? matchingSite.quantity : "No stocks";
          const selectedQuantity = selectedQuantities[item._id] || null;

          // Update the modifiedQuantities state for the specific item
          updatedQuantities[item._id] =
            selectedQuantity !== null || quantity !== null
              ? selectedQuantity || quantity
              : "No stocks";
        });
      });

      // Update the modifiedQuantities state with the updated values
      setModifiedQuantities(updatedQuantities);
    }
  };
  useEffect(() => {
    // Call handleSiteSelection when selectedProjectName or selectedMrfName changes
    handleSiteSelection();
  }, [projectName, selectedMrfName]);

  const handleStockQuantity = (event, itemIndex, entryIndex) => {
    const stockRequest = parseFloat(event.target.value);
    setFilteredTableData((prevFilteredTableData) => {
      const updatedFilteredTableData = [...prevFilteredTableData];
      const tableEntry = { ...updatedFilteredTableData[entryIndex] };
      const updatedItems = [...tableEntry.items];
      const updatedItem = { ...updatedItems[itemIndex], stockRequest };
      updatedItems[itemIndex] = updatedItem;
      tableEntry.items = updatedItems;
      updatedFilteredTableData[entryIndex] = tableEntry;
      return updatedFilteredTableData;
    });
  };

  useEffect(() => {
    const checkHasRemarks = () => {
      for (const tableEntry of filteredTableData) {
        if (
          tableEntry.mrfName === selectedMrfName &&
          tableEntry.remarks === " "
        ) {
          return true;
        }
      }
      return false;
    };

    const hasRemarksValue = checkHasRemarks();
    setHasRemarks(hasRemarksValue);
  }, [filteredTableData, selectedMrfName]);

  const handleCheckboxChange = (event, item) => {
    const { checked } = event.target;

    setSelectedItems((prevSelectedItems) => {
      if (checked) {
        // Include the stockRequest property in the selected item or update it if already present
        const updatedSelectedItems = prevSelectedItems.map((selectedItem) =>
          selectedItem._id === item._id ? { ...selectedItem } : selectedItem
        );

        const isItemAlreadySelected = updatedSelectedItems.some(
          (selectedItem) => selectedItem._id === item._id
        );
        if (!isItemAlreadySelected) {
          updatedSelectedItems.push({ ...item, stockRequest: 0 }); // Initialize stockRequest to 0
        }

        return updatedSelectedItems;
      } else {
        // Remove the item from the selected items list
        return prevSelectedItems.filter(
          (selectedItem) => selectedItem._id !== item._id
        );
      }
    });
  };

  // Function to filter and get the selected items for saving
  const getSelectedItemsForSaving = (selectedItems, filteredTableData) => {
    const selectedItemsIds = new Set(selectedItems.map((item) => item._id));
    const tableData = filteredTableData.reduce((acc, entry) => {
      const selectedItemsInEntry = entry.items.filter((item) =>
        selectedItemsIds.has(item._id)
      );
      return acc.concat(selectedItemsInEntry);
    }, []);
    return tableData;
  };

  const handleSave = async () => {
    //Error Handlers -------------------
    const confirmation = window.confirm(
      "Are you sure you want to save Table data?"
    );
    if (!confirmation) {
      return; // Abort saving if the user cancels the confirmation
    }

    try {
      // Get the selected items for saving
      const tableData = getSelectedItemsForSaving(
        selectedItems,
        filteredTableData
      );
      const selectedProject = projects.find(
        (project) => project._id === selectedProjectId
      );
      const hasNegativeStockRequest = tableData.some(
        (item) =>
          item.stockRequest < 0 ||
          item.stockRequest > item.mrfValue ||
          item.stockRequest > modifiedQuantities[item._id]
      );

      const invalidInput = tableData.some(
        (item) => item.stockRequest > item.mrfValue
      );

      if (invalidInput) {
        toast.error("Invalid Input. Please enter a valid Number");
        return;
      }

      //error handlers for this logic ----------------
      if (hasNegativeStockRequest) {
        toast.error("Invalid Input. Please enter a valid number");
        return;
      }
      // error handler for no selected Items or null ------
      if (tableData.length === 0) {
        toast.error("No Selected Items. Please select Items to Price");
        return;
      }

      // Extract the location and name from the selected project
      const location = selectedProject?.location || ""; // Use optional chaining to avoid errors if selectedProject is null or undefined
      const name = selectedProject?.name || "";
      const mrfName = filteredTableData[0]?.mrfName || " "; // Use optional chaining to avoid errors if filteredTableData is empty or null
      const dateRequested = filteredTableData[0]?.dateRequested || ""; // Use optional chaining to avoid errors if filteredTableData is empty or null
      const dateNeeded = filteredTableData[0]?.dateNeeded || ""; // Use optional chaining to avoid errors if filteredTableData is empty or null

      // Construct formData
      const formData = {
        name: name,
        mrfName: mrfName,
        location: location,
        dateRequested: dateRequested || "",
        dateNeeded: dateNeeded || "",
      };

      // Construct items
      const items = tableData.map((item) => {
        const mrfValue = parseInt(item.mrfValue, 10);
        const stockRequest = parseInt(item.stockRequest, 10);

        const proccuredQuantity = isNaN(stockRequest)
          ? mrfValue
          : stockRequest === 0
          ? mrfValue
          : mrfValue - stockRequest;

        console.log("mrfValue", mrfValue);
        console.log("stockValue", stockRequest);

        return {
          product: item.product,
          unit: item.unit,
          quantity: mrfValue,
          stockRequest: isNaN(stockRequest) ? " " : stockRequest,
          subCategory: item.subCategory,
          proccuredQuantity: proccuredQuantity,
          Scope: item.scope,
        };
      });

      // Create the new MRF document
      const newMrf = {
        formData: formData,
        tableData: items,
      };

      // Save the new MRF document to the database
      const response = await axios.post(`/api/mrf`, newMrf);
      // Assuming your backend API responds with the updated MRF data, you can access it from the response
      const responseData = response.data;
      console.log("responseData: ", responseData);

      const answers = await axios.get("/api/projects"); // Replace '/api/projects' with your actual projects API endpoint
      const projectMatch = answers.data;
      let id = null;

      const matchedProject = projectMatch.find((project) => {
        const locationMatch = project.location
          .toLowerCase()
          .includes(location.toLowerCase());
        const nameMatch = project.name
          .toLowerCase()
          .includes(name.toLowerCase());
        return locationMatch && nameMatch;
      });

      if (!matchedProject) {
        console.log("No project found with the specified string match");
        return;
      }

      id = matchedProject._id;

      const matchedItems = tableData.filter((item) => {
        const matchingItems = matchedProject.items.filter((projectItem) => {
          const productSimilarity = stringSimilarity.compareTwoStrings(
            item.product,
            projectItem.product
          );
          const scopeSimilarity = stringSimilarity.compareTwoStrings(
            item.scope,
            projectItem.category
          );
          return productSimilarity > 0.8 && scopeSimilarity > 0.8; // Example thresholds of 0.8
        });

        if (matchingItems.length === 0) {
          console.log("No matching item found for", item.product);
          return false;
        }

        const projectItem = matchingItems[0]; // Assuming there's only one matching item
        const quantity = item.quantity;
        const totalQuantity = item.mrfValue;
        const quantityDifference = projectItem.quantity - totalQuantity;
        const patchUrl = `/api/projects/${id}/items/${projectItem._id}`;

        console.log("Matching item quantity:", projectItem.quantity);
        console.log(
          "Quantity deducted for delivered materials BOM:",
          quantityDifference
        );

        return axios
          .patch(patchUrl, { quantity: quantityDifference })
          .then(() => {
            console.log("Item quantity updated successfully");
            return true; // Return 'true' to indicate that the item is updated successfully
          })
          .catch((error) => {
            console.error("Error updating item quantity:", error);
            return false; // Return 'false' to indicate that there was an error updating the item
          });
      });

      await Promise.all(matchedItems);

      try {
        const fixedSiteName = "cainta main warehouse";

        // Find the selected site based on the fixed siteName
        const selectedSite = Sites.find(
          (site) =>
            site.siteName?.trim().toLowerCase() ===
            fixedSiteName.trim().toLowerCase()
        );

        // Check if there are any items with a stock request and are also selected
        const itemsWithStockRequest = tableData.filter(
          (item) => item.stockRequest != 0
        );

        if (itemsWithStockRequest.length === 0) {
          // If there are no items with a stock request or selected items, there's no need to update the storage
          console.log("items With stock Request" + itemsWithStockRequest);
          console.log(
            "No items with stock request or selected items. Skipping storage update."
          );
        } else if (!selectedSite) {
          // If there are items with a stock request but the selected site is not found, show an error
          toast.error("Selected site not found");
        } else {
          // Prepare the updated siteTable for storage update
          const updatedSiteTable = selectedSite.siteTable.map((siteTable) => {
            // Find the matching item in the projects based on ItemName
            const matchingItem = tableData.find(
              (item) =>
                item.product?.trim().toLowerCase() ===
                siteTable.ItemName?.trim().toLowerCase()
            );

            if (!matchingItem) {
              // If the matching item is not found, return the siteTable item as is
              return siteTable;
            }

            // Check if the item has a stock request and is also selected
            if (
              matchingItem.stockRequest !== 0 &&
              matchingItem.stockRequest !== null
            ) {
              const updatedQuantity =
                siteTable.quantity - matchingItem.stockRequest;
              return {
                ...siteTable,
                quantity: updatedQuantity >= 0 ? updatedQuantity : 0,
              };
            } else {
              // If the item does not have a stock request or is not selected, do not update its quantity
              return siteTable;
            }
          });

          // Make the PATCH request to update the storage with the patched values
          const patchResponse = await axios.patch(
            `/api/storages/${selectedSite.id}`,
            {
              siteTable: updatedSiteTable,
            }
          );

          // Check the response status to determine if the PATCH request was successful
          if (patchResponse.status === 200) {
            console.log("Storage updated successfully!");
          } else {
            toast.error("Failed to update the storage.");
          }
        }

        try {
          const { data: OpsMaterial } = await axios.get(
            "/api/MaterialRequestOps/material-requests"
          );
          const matchedOps = OpsMaterial.find(
            (ops) => ops._id === selectedProjectId
          );

          if (!matchedOps) {
            console.log("No project found with the specified string match");
            return;
          }

          const matchingMrf = matchedOps.tableData.filter((projectItem) => {
            const similarity = stringSimilarity.compareTwoStrings(
              selectedMrfName,
              projectItem.mrfName
            );
            return similarity > 0.9; // Example threshold of 0.8
          });

          console.log("MrfName that match: ", matchingMrf);

          if (matchingMrf.length === 0) {
            console.log("No matching item found for", matchingMrf.mrfName);
            return;
          }

          const hasNullRemarks = matchingMrf.some(
            (mrfItem) => mrfItem.remarks === null || mrfItem.remarks === " "
          );

          console.log(
            "Does any item have a remarks value of ' ':",
            hasNullRemarks
          );

          if (hasNullRemarks) {
            const modifiedTableData = matchedOps.tableData.map((data) => {
              if (matchingMrf.some((mrfItem) => mrfItem._id === data._id)) {
                return { ...data, remarks: "processed" };
              }
              return data;
            });

            console.log("Modified Table Data:", modifiedTableData);

            // Update the material request with the modified tableData
            const { data: response } = await axios.patch(
              `/api/MaterialRequestOps/material-requests/${matchedOps._id}/tableData/${mrfName}`,
              {
                tableData: modifiedTableData,
              }
            );

            console.log(
              "Remarks updated to 'processed' for matching mrfName",
              response
            );
          }
        } catch (error) {
          console.error("Error updating MRF:", error);
        }

        toast.success("MRF updated");
        setHasRemarks(true);
        window.location.reload();
      } catch (error) {
        console.error(error);
        setSaveSuccess(false);
        toast.error("Error updating MRF: " + error.message);
      }
    } catch (error) {
      console.error(error);
      setSaveSuccess(false);
      toast.error("Error updating MRF: " + error.message);
    }
  };

  useEffect(() => {
    // Fetch TableCelle MRFs again when a new MRF is saved
    if (saveSuccess) {
      fetchMrf();
      window.location.reload();
      setSaveSuccess(false);
    }
  }, [saveSuccess, handleSave]);

  //Back button
  const handleGoBack = () => {
    // Use navigate(-1) to go back to the previous page in the history stack
    navigate(-1);
  };

  const YourTableComponent = ({
    projects,
    selectedProject,
    handleCheckboxChange,
    handleStockQuantity,
    handleQuantityChange,
  }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Number of items to show per page

    // Perform null or undefined check for projects and selectedProject
    if (!projects || projects.length === 0) {
      return <div>No projects found.</div>;
    }

    if (!selectedProject) {
      return <div>Please select a project.</div>;
    }

    // Calculate the total number of pages
    const totalPages = Math.ceil(projects.length / itemsPerPage);

    // Get the current page items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems =
      projects.find((project) => project._id === selectedProject)?.items || [];
    const itemsToDisplay = currentItems.slice(
      indexOfFirstItem,
      indexOfLastItem
    );
  };
  // Function to handle page change
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <div className="container-admin">
        <section className="section-admin">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controller">Material Request Forms</div>
        </section>
        <section className="section-back" onClick={handleGoBack}>
          <FiArrowLeft />
          <div className="back">BACK</div>
        </section>
      </div>

      <div className="purchase-order-box-equip">
        <div className="purchase-order-subbox-equip">
          <div className="mrf-container-box-equip">
            Select project:{" "}
            {boms.length > 0 ? (
              <select
                className="dropdown1"
                value={selectedBoms}
                onChange={handleBomsChange}>
                <option value="">Select Project</option>
                {boms.map((bom) => (
                  <option key={bom._id} value={bom._id}>
                    {bom.name}
                  </option>
                ))}
              </select>
            ) : (
              <p>Loading</p>
            )}
            <button onClick={openModal}>Create MRF</button>
          </div>
        </div>
      </div>

      <TableContainer component={Paper}>
        <div
          style={{
            maxHeight: `${rowsPerPage * 40}px`,
            overflow: "auto",
            minWidth: "100%",
          }}>
          <Table size="small" aria-label="a dense table">
            <TableHead style={{ position: "sticky", top: 0, zIndex: 1 }}>
              <TableRow>
                <TableCell
                  style={{
                    backgroundColor: "#146C94",
                    color: "white",
                    whiteSpace: "nowrap",
                  }}>
                  <Typography variant="bold" className="bold-header">
                    Item #
                  </Typography>
                </TableCell>
                <TableCell
                  style={{
                    backgroundColor: "#146C94",
                    color: "white",
                    whiteSpace: "nowrap",
                  }}>
                  <Typography variant="bold" className="bold-header">
                    Category
                  </Typography>
                </TableCell>
                <TableCell
                  style={{
                    backgroundColor: "#146C94",
                    color: "white",
                    whiteSpace: "nowrap",
                  }}>
                  <Typography variant="bold" className="bold-header">
                    Item Scope
                  </Typography>
                </TableCell>
                <TableCell
                  style={{
                    backgroundColor: "#146C94",
                    color: "white",
                    whiteSpace: "nowrap",
                  }}>
                  <Typography variant="bold" className="bold-header">
                    Item Name
                  </Typography>
                </TableCell>
                <TableCell
                  style={{
                    backgroundColor: "#146C94",
                    color: "white",
                    whiteSpace: "nowrap",
                  }}>
                  <Typography variant="bold" className="bold-header">
                    BOM Quantity
                  </Typography>
                </TableCell>

                {boms.map((bom) => {
                  if (bom._id === selectedBoms) {
                    const matchingMrfs = mrfs.filter(
                      (mrf) => mrf.name === bom.name
                    );
                    return matchingMrfs.map((mrf) => (
                      <TableCell
                        key={mrf._id}
                        style={{ backgroundColor: "#146C94", color: "white" }}>
                        <Typography variant="bold" className="bold-header">
                          {mrf.mrfName}
                        </Typography>
                      </TableCell>
                    ));
                  }
                  return null;
                })}
              </TableRow>
            </TableHead>

            <TableBody>
              {boms.map((bom) => {
                if (bom._id === selectedBoms) {
                  return bom.items.map((item, itemIndex) => {
                    const matchingMrfs = mrfs.filter(
                      (mrf) => mrf.name === bom.name
                    );
                    const mrfQuantities = matchingMrfs.map((mrf) => {
                      const matchingItem = mrf.items.find(
                        (mrfItem) => mrfItem.product === item.product
                      );
                      return matchingItem ? matchingItem.quantity : 0;
                    });

                    return (
                      <TableRow
                        key={`${bom._id}-${itemIndex}`}
                        style={{
                          backgroundColor:
                            itemIndex % 2 === 0 ? "white" : "#f0f0f0",
                        }}>
                        <TableCell>{itemIndex + 1}</TableCell>

                        <TableCell>{item.subCategory}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.product}</TableCell>
                        <TableCell
                          className={
                            item.quantity < 5
                              ? "low-quantity"
                              : item.quantity < 20
                              ? "warning"
                              : ""
                          }>
                          {item.quantity}
                        </TableCell>

                        {mrfQuantities.map((mrfQuantity, mrfIndex) => (
                          <TableCell
                            key={`${bom._id}-${itemIndex}-${mrfIndex}`}>
                            {mrfQuantity}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  });
                }
                return null;
              })}
            </TableBody>
          </Table>
        </div>
      </TableContainer>

      <Modal
        open={isModalOpen}
        onClose={closeModal}
        closeAfterTransition
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description">
        <Box sx={modalStyle}>
          <AiFillCloseCircle
            onClick={closeModal}
            className="AiFillCloseCircle"
          />

          <div className="material-request-form-title">
            Material Request Form
          </div>
          <div className="instruction-material-req-form">
            <b>Instruction:</b> Select the corresponding Material Request based
            on the project name and Material requet based on the site Engineers
            input, verify stock contents and input the corresponding quantity
            based on the availability of stock requests.
          </div>

          <div className="purchase-order-box-equip">
            <div className="MrfModal">
              <div className="selected-mrf-title">
                <label htmlFor="projectDropdown">Select Project:</label>
                <select
                  id="projectDropdown"
                  value={selectedProjectId}
                  onChange={handleProjectChange}>
                  <option value="">Select Project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="selected-mrf-title">
                <label htmlFor="mrfNameDropdown">Select MRF Name:</label>
                <select
                  id="mrfNameDropdown"
                  value={selectedMrfName}
                  onChange={handleMrfNameChange}
                  disabled={!selectedProjectId} // Disable the dropdown until a project is selected
                >
                  <option value="">Select MRF Name</option>
                  {mrfData.map((entry, index) => (
                    <option key={index} value={entry.mrfName}>
                      {entry.mrfName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div>
            {hasRemarks ? (
              <>
                <TableContainer component={Paper}>
                  <div
                    style={{
                      maxHeight: `${rowsPerPage * 53}px`,
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
                            <Typography variant="bold" className="bold-header">
                              Select
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="bold" className="bold-header">
                              Item #
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="bold" className="bold-header">
                              Item Category
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="bold" className="bold-header">
                              Item Scope
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="bold" className="bold-header">
                              Item Name
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="bold" className="bold-header">
                              Unit
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="bold" className="bold-header">
                              BOM Quantity
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="bold" className="bold-header">
                              MRF Value
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="bold" className="bold-header">
                              Remaining Stocks
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="bold" className="bold-header">
                              Inventory Value
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredTableData.map((tableEntry, entryIndex) => (
                          <React.Fragment key={`entry_${entryIndex}`}>
                            {/* Debugging: Check tableEntry and tableEntry.items */}
                            {console.log(tableEntry)}
                            {console.log(tableEntry.items)}

                            {/* Render the table items */}
                            {tableEntry.items.map((item, itemIndex) => {
                              const bomQuantity =
                                bomItems[item._id] ||
                                "No available Data for this";
                              const stockQuantity =
                                modifiedQuantities[item._id] || 0; // Use bomItems[item._id] or fallback to "No available Data for this"
                              return (
                                <TableRow key={`item_${itemIndex}`}>
                                  <TableCell>
                                    <input
                                      type="checkbox"
                                      checked={selectedItems.some(
                                        (selectedItem) =>
                                          selectedItem._id === item._id
                                      )}
                                      onChange={(event) =>
                                        handleCheckboxChange(event, item)
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>{itemIndex + 1}</TableCell>
                                  <TableCell>{item.subCategory}</TableCell>
                                  <TableCell>{item.scope}</TableCell>
                                  <TableCell>{item.product}</TableCell>
                                  <TableCell>{item.unit}</TableCell>
                                  <TableCell>{bomQuantity}</TableCell>
                                  <TableCell>{item.mrfValue}</TableCell>
                                  <TableCell>
                                    <span
                                      className={
                                        stockQuantity !== "No stocks"
                                          ? "green-text"
                                          : "red-text"
                                      }>
                                      {stockQuantity !== "No stocks"
                                        ? modifiedQuantities[item._id]
                                        : "No stocks"}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    {stockQuantity !== "No stocks" ? (
                                      <>
                                        <input
                                          type="number"
                                          id="quantity"
                                          name="quantity"
                                          value={item.stockRequest}
                                          onChange={(event) =>
                                            handleStockQuantity(
                                              event,
                                              itemIndex,
                                              entryIndex
                                            )
                                          }
                                          placeholder="Input Stock Quantity Value"
                                          disabled={
                                            modifiedQuantities[item._id] === 0
                                          }
                                        />
                                        {item.isValid === false && (
                                          <div className="error-message">
                                            {item.error}
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      "No Stock Available"
                                    )}
                                  </TableCell>

                                  {/* Display the bomQuantity */}
                                </TableRow>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TableContainer>
                <button onClick={handleSave}>Save</button>
              </>
            ) : (
              <>
                <div className="selected-mrf-title">
                  {filteredTableData.map((entry, index) => (
                    <div key={index}>
                      <h3>
                        <AiFillCheckCircle className="received-icon-update" />{" "}
                        Status: {entry.remarks}
                      </h3>
                    </div>
                  ))}
                </div>

                <TableContainer component={Paper}>
                  <div
                    style={{
                      maxHeight: `${rowsPerPage * 53}px`,
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
                            <Typography variant="bold" className="bold-header">
                              Item #
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="bold" className="bold-header">
                              Item Category
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="bold" className="bold-header">
                              Item Scope
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="bold" className="bold-header">
                              Item Name
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="bold" className="bold-header">
                              Unit
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="bold" className="bold-header">
                              BOM Quantity
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="bold" className="bold-header">
                              MRF Value
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="bold" className="bold-header">
                              Remaining Stocks
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="bold" className="bold-header">
                              Inventory Value
                            </Typography>
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredTableData.map((tableEntry, entryIndex) => (
                          <React.Fragment key={`entry_${entryIndex}`}>
                            {/* Debugging: Check tableEntry and tableEntry.items */}
                            {console.log(tableEntry)}
                            {console.log(tableEntry.items)}

                            {/* Render the table items */}
                            {tableEntry.items.map((item, itemIndex) => {
                              const bomQuantity =
                                bomItems[item._id] ||
                                "No available Data for this";
                              const stockQuantity =
                                modifiedQuantities[item._id] || 0; // Use bomItems[item._id] or fallback to "No available Data for this"
                              return (
                                <TableRow key={`item_${itemIndex}`}>
                                  <TableCell>{itemIndex + 1}</TableCell>
                                  <TableCell>{item.subCategory}</TableCell>
                                  <TableCell>{item.scope}</TableCell>
                                  <TableCell>{item.product}</TableCell>
                                  <TableCell>{item.unit}</TableCell>
                                  <TableCell>{bomQuantity}</TableCell>
                                  <TableCell>{item.mrfValue}</TableCell>
                                  <TableCell>
                                    <span
                                      className={
                                        stockQuantity !== "No stocks"
                                          ? "green-text"
                                          : "red-text"
                                      }>
                                      {stockQuantity !== "No stocks"
                                        ? modifiedQuantities[item._id]
                                        : "No stocks"}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    {stockQuantity !== "No stocks" ? (
                                      <>
                                        <input
                                          type="number"
                                          id="quantity"
                                          name="quantity"
                                          value={item.stockRequest}
                                          onChange={(event) =>
                                            handleStockQuantity(
                                              event,
                                              itemIndex,
                                              entryIndex
                                            )
                                          }
                                          placeholder="Input Stock Quantity Value"
                                          disabled={
                                            modifiedQuantities[item._id] === 0
                                          }
                                        />
                                        {item.isValid === false && (
                                          <div className="error-message">
                                            {item.error}
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      "No Stock Available"
                                    )}
                                  </TableCell>

                                  {/* Display the bomQuantity */}
                                </TableRow>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TableContainer>
              </>
            )}
          </div>
        </Box>
      </Modal>
    </div>
  );
};
export default Mrf;

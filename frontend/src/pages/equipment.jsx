import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EquipmentsInstalled.css";

import { toast } from "react-toastify";
import { AiFillCloseCircle } from "react-icons/ai";
import { FaTools, FaPeopleCarry } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import {
  BsArrowDownShort,
  BsArrowUpShort,
  BsCalendarDate,
} from "react-icons/bs";
import { useLocation } from "react-router-dom";
import Select from "react-select";
import { useSelector } from "react-redux";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  Fade,
  Button,
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
const EquipmentsInstalled = () => {
  const [value, setValue] = React.useState(0);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [tableData, setTableData] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [comment, setComment] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [secondTableData, setSecondTableData] = useState([]);
  const [storageData, setStorageData] = useState([]);
  const [deliveryData, setDeliveryData] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState({});
  const [transactionDates, setTransactionDates] = useState([]);
  const [pickUpLocations, setPickUpLocations] = useState([]);
  const [selectedTab, setSelectedTab] = useState("equipmentMonitoring");
  const [datePage, setDatePage] = React.useState(1);
  const { id, name, location, items, projectId } = useLocation().state || {};
  const [selectedItem, setSelectedItem] = useState("");
  const [maxRows, setMaxRows] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [thirdTableData, setThirdTableData] = useState([]);
  const [valueTab, setValueTab] = React.useState(0);
  const [valueTabCategory, setValueTabCategory] = React.useState(0);
  const [dropdown, setDropdown] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [openRowIndex, setOpenRowIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  // Fetch equipment installed data based on the projectId
  const [existingDates, setExistingDates] = useState([]);
  const processedDates = [];
  const [valueDateId, setValueDateId] = useState("");
  const [dataTableValue, setDataTableValue] = useState([]);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [personComment, setPersonComment] = useState("");
  const [monitoringTable, setMonitoringTable] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Set the initial items state using the tableData prop
    setSelectedItem(items || []);
    setSecondTableData(items || []);
  }, [items]);
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
          siteTable: storage.siteTable.map((item) => ({
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
      //  console.log("Data from Storages", storages);
      //  console.log("Site Table", storages[0].siteTable); // Log the siteTable value
    } catch (error) {
      console.error("Error fetching storage data", error);
    }
  };

  //  Function to fetch transaction data based on the "places" variable
  const fetchTransactionData = async (location) => {
    try {
      const response = await axios.get(`/api/deliveries?place=${location}`);
      const data = response.data;
      const filteredData = data
        .filter((item) => item.place === location)
        .map((delivery) => ({
          id: delivery._id,
          title: delivery.title,
          place: delivery.place,
          trackingNumber: delivery.trackingNumber,
          tableData: delivery.tableData.map((item) => ({
            status: item.status,
            date: item.date,
            time: item.time,
            name: item.name,
            location: item.location,
            comment: item.comment,
            transactionTable: item.transactionTable.map((transactionItem) => ({
              itemName: transactionItem.ItemName,
              quantity: transactionItem.quantity,
              unit: transactionItem.unit,
              unitCost: transactionItem.unitCost,
              materialCost: transactionItem.materialCost,
            })),
          })),
        }));
      const totalQuantities = {};
      filteredData.forEach((item) => {
        item.tableData.forEach((tableItem) => {
          if (tableItem.status === "Received") {
            //     console.log("Received Status:");
            //    console.log("Date:", tableItem.date);
            //  console.log("Name:", tableItem.name);
            tableItem.transactionTable.forEach((transactionItem) => {
              //   console.log("ItemName:", transactionItem.itemName);
              //  console.log("Quantity:", transactionItem.quantity);
              setTransactionDates((prevDates) => [
                ...prevDates,
                {
                  _id: item._id,
                  tableData: item.tableData,
                  title: item.title,
                  trackingNumber: item.trackingNumber,
                  date: tableItem.date,
                  name: tableItem.name,
                  itemName: transactionItem.itemName,
                  quantity: transactionItem.quantity,
                },
              ]);
              if (totalQuantities[transactionItem.itemName]) {
                totalQuantities[transactionItem.itemName] += Number(
                  transactionItem.quantity
                );
              } else {
                totalQuantities[transactionItem.itemName] = Number(
                  transactionItem.quantity
                );
              }
            });
          } else if (tableItem.status === "Pick up") {
            // console.log("PickUp Status:");
            //  console.log("Location:", tableItem.location);
            // console.log("Name:", tableItem.name);
            tableItem.transactionTable.forEach((transactionItem) => {
              setPickUpLocations((prevDates) => [
                ...prevDates,
                {
                  location: tableItem.location,

                  name: tableItem.name,
                  itemName: transactionItem.itemName,
                  quantity: transactionItem.quantity,
                },
              ]);
            });
          }
        });
      });

      setTotalQuantity(totalQuantities);
      setDeliveryData(filteredData);
    } catch (error) {
      console.error("Error fetching transaction data:", error);
    }
  };

  const fetchEquipmentInstalledData = async () => {
    try {
      const response = await axios.get(
        `/api/EquipmentInstalled/read?projectId=${projectId}`
      );
      const data = response.data;
      const equipmentData = data.find(
        (equipment) => equipment.projectId === projectId
      );
      const monitoringTable = equipmentData.monitoringTable;
      console.log("MONITORING TABLE: ", monitoringTable);
      setMonitoringTable(monitoringTable);
      if (equipmentData) {
        const formattedEquipmentTable = equipmentData.equipmentTable.map(
          (item) => ({
            ...item,
            dateInstalled: formatDate(item.dateInstalled),
          })
        );
        setThirdTableData(formattedEquipmentTable);
        setStartDate(equipmentData.startDate);
        setEndDate(equipmentData.endDate);

        // Extract existing dates from equipmentData
        const dates = equipmentData.equipmentTable.map((item) =>
          formatDate(item.dateInstalled)
        );
        setExistingDates(dates);
        console.log("Existing Dates: ", dates);
      } else {
        setThirdTableData([]);
      }
    } catch (error) {
      console.error("Error fetching equipment installed data:", error);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchEquipmentInstalledData();
    }
  }, [projectId]);

  useEffect(() => {
    if (location) {
      fetchTransactionData(location);
      fetchStorageData(location);
    }
  }, [location]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`/api/projects/${id}`);
        const itemsData = response.data;
        setDropdown(itemsData);
        // console.log("items", itemsData);
      } catch (error) {
        console.error(error);
        toast.error("Error fetching project details.");
      }
    };

    fetchItems();
  }, [id]);

  const handleNumberChange = (index, event) => {
    const newTableData = [...tableData];
    const inputValue = event.target.value; // Remove non-numeric characters
    newTableData[index] = {
      ...newTableData[index],
      number: inputValue,
    };
    setTableData(newTableData);
  };

  const handleCategoryChange = (index, category) => {
    // Check if ItemName or item does not exist in the selected category based on tableData

    const selectedItem = tableData[index]?.item;

    // Check if selectedItem is defined
    if (!selectedItem) {
      toast.error("Please select an item first");
      return false;
    }

    const itemExistsInCategory = dropdown.some((rowData) => {
      return (
        rowData.product === selectedItem &&
        (rowData.category === category ||
          (rowData.category === "" && !category))
      );
    });

    // console.log("ITEM AND CATEGORY: ", itemExistsInCategory);
    if (!itemExistsInCategory) {
      toast.error(`${selectedItem} does not exist in the ${category}`);
      return false;
    }

    const newTableData = [...tableData];
    newTableData[index] = {
      ...newTableData[index],
      category: category,
    };
    setTableData(newTableData);
  };

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

  // Function to handle comment changes for a specific item

  const handleCommentChange = (item, category, value) => {
    setComment((prevComment) => ({
      ...prevComment,
      [`${item}-${category}`]: value, // Update the comment for the specific item and category
    }));
  };
  const checkStockAvailability = (itemName, requiredQuantity) => {
    const storage = storageData.find((storage) =>
      storage.siteTable.some((item) => item.ItemName === itemName)
    );

    if (!storage) {
      return false; // Storage not found for the item
    }

    const item = storage.siteTable.find((item) => item.ItemName === itemName);

    if (!item || item.quantity < requiredQuantity) {
      return false; // Insufficient quantity in the storage
    }

    return true; // Sufficient quantity available
  };

  const validateInputs = () => {
    const existingDates = thirdTableData.map((item) => item.dateInstalled);

    if (!selectedDate) {
      toast.error("Please select a date");
      return false;
    }

    if (existingDates.includes(formatDate(selectedDate))) {
      toast.error("The selected date already exists in the tabs");
      return false;
    }

    const invalidQuantity = tableData.some((row) => {
      const quantity = Number(row.number);
      return isNaN(quantity) || quantity <= 0;
    });

    if (invalidQuantity) {
      toast.error("Please enter a valid value for new quantity");
      return false;
    }

    const invalidCategory = tableData.some(
      (row) => !row.category || row.category === ""
    );

    if (invalidCategory) {
      toast.error("Please select a category for each row");
      return false;
    }

    const duplicateItems = tableData.some((row, index) => {
      const existingIndex = tableData.findIndex(
        (item, itemIndex) =>
          itemIndex !== index &&
          item.category === row.category &&
          item.item === row.item
      );
      return existingIndex !== -1;
    });

    if (duplicateItems) {
      toast.error("You have selected the same item and category");
      return false;
    }

    /*const missingComments = tableData.some((row, index) => {
      return (
        !comment[`${row.item}-${row.category}`] ||
        comment[`${row.item}-${row.category}`].trim() === ""
      );
    });

    if (missingComments) {
      toast.error("Please provide comments for all items");
      return;
    }*/

    const insufficientStockItems = tableData.filter((row) => {
      const itemName = row.item;
      const requiredQuantity = Number(row.number);
      return !checkStockAvailability(itemName, requiredQuantity);
    });

    if (insufficientStockItems.length > 0) {
      const itemNames = insufficientStockItems
        .map((item) => item.item)
        .join(", ");
      toast.error(`Insufficient stock for the following items: ${itemNames}`);
      return false;
    }

    if (tableData.length === 0) {
      toast.error("Please add at least one row");
      return false;
    }

    return true;
  };

  const calculatePreviousInstalled = (
    existingEquipmentData,
    item,
    category
  ) => {
    let previousInstalled = 0;

    existingEquipmentData.equipmentTable.forEach((equipmentItem) => {
      equipmentItem.equipItemTable.forEach((itemData) => {
        if (
          itemData.ItemName === item &&
          (itemData.category === category ||
            (itemData.category === "" && !category))
        ) {
          previousInstalled += parseFloat(itemData.numberInstalled);
        }
      });
    });

    return previousInstalled;
  };

  const handleSubmit = async () => {
    try {
      const updatedSiteTable = storageData[0]?.siteTable.map((item) => {
        const matchedTableData = tableData.filter(
          (row) => row.item === item.ItemName
        );
        if (matchedTableData.length > 0) {
          const totalQuantityToDeduct = matchedTableData.reduce(
            (total, row) => total + Number(row.number),
            0
          );
          const newQuantity = item.quantity - totalQuantityToDeduct;

          const updatedMaterialCost =
            item.materialCost - totalQuantityToDeduct * item.unitCost;
          return {
            ...item,
            quantity: newQuantity.toFixed(2),
            materialCost: updatedMaterialCost.toFixed(2),
          };
        }
        return item;
      });

      const response = await axios.get(
        `/api/EquipmentInstalled/read?projectId=${projectId}`
      );
      const existingEquipmentData = response.data.find(
        (storage) => storage.projectId === projectId
      );

      if (!existingEquipmentData) {
        const equipmentData = {
          projectId: projectId,
          projectName: name,
          projectLocation: location,
          equipmentTable: [],
        };

        const equipItemTable = tableData.map((row) => {
          const actualInstalled = parseFloat(row.number).toFixed(2);
          const siteItem = storageData[0]?.siteTable.find(
            (item) => item.ItemName === row.item
          );
          // Fetch fixedQuantity from the API/projects based on matching product to ItemName
          const projectItem = dropdown.find(
            (item) => item.product === row.item
          );
          const fixedQuantity = projectItem?.fixedQuantity || 0;
          const totalPercentage =
            fixedQuantity !== 0
              ? ((actualInstalled / fixedQuantity) * 100).toFixed(2)
              : "0.00"; // Compute totalPercentage
          const totalCost =
            (projectItem?.cost || 0) * parseFloat(totalPercentage);
          return {
            category: row.category || "",
            numberInstalled: actualInstalled,
            actualInstalled: actualInstalled,
            ItemName: row.item,
            unit: siteItem?.unit || "",
            newQuantity: actualInstalled,
            unitCost: siteItem?.unitCost || 0,
            newMaterialCost: siteItem?.unitCost * actualInstalled,
            comment: comment[`${row.item}-${row.category}`] || "N/A",
            totalPercentage: totalPercentage,
            cost: projectItem?.cost || 0,
            totalCost: totalCost.toFixed(2),
          };
        });
        //For overall total percentage
        const totalPercentages = equipItemTable
          .filter((item) => item.totalPercentage !== "0.00")
          .map((item) => parseFloat(item.totalPercentage));

        const overallTotalPercentage =
          totalPercentages.length > 0
            ? (
                totalPercentages.reduce((sum, percentage) => sum + percentage) /
                totalPercentages.length
              ).toFixed(2)
            : "0.00";
        //For overall total cost
        const totalCosts = equipItemTable
          .filter((item) => item.totalCost !== "0.00")
          .map((item) => parseFloat(item.totalCost));

        const overallTotalCost =
          totalCosts.length > 0
            ? totalCosts.reduce((sum, cost) => sum + cost).toFixed(2)
            : "0.00";
        equipmentData.equipmentTable.push({
          personnelInstalled: user.name,
          dateInstalled: selectedDate,
          overallTotalPercentage: overallTotalPercentage,
          overAllTotalCost: overallTotalCost,
          equipItemTable: equipItemTable,
        });

        const createResponse = await axios.post(
          "/api/EquipmentInstalled/create",
          equipmentData
        );

        toast.success("Equipment created successfully");
        await fetchStorageData(location);
        fetchEquipmentInstalledData();
        fetchTransactionData();

        await axios.put(`/api/storages/${storageData[0]?.id}`, {
          siteName: storageData[0]?.siteName,
          siteTable: updatedSiteTable,
        });
      } else {
        const updatedEquipmentTable = [...existingEquipmentData.equipmentTable];

        const equipItemTable = tableData.map((row) => {
          const category = row.category || "";
          const previousInstalled = calculatePreviousInstalled(
            existingEquipmentData,
            row.item,
            category
          );

          const numberInstalled = parseFloat(row.number);
          const actualInstalled = previousInstalled + numberInstalled;
          const siteItem = storageData[0]?.siteTable.find(
            (item) => item.ItemName === row.item
          );
          // Fetch fixedQuantity from the API/projects based on matching product to ItemName
          const projectItem = dropdown.find(
            (item) => item.product === row.item
          );
          const fixedQuantity = projectItem?.fixedQuantity || 0;
          const totalPercentage =
            fixedQuantity !== 0
              ? ((numberInstalled / fixedQuantity) * 100).toFixed(2)
              : "0.00"; // Compute totalPercentage
          const totalCost =
            (projectItem?.cost || 0) * parseFloat(totalPercentage);
          return {
            category: row.category || "",
            numberInstalled: numberInstalled.toFixed(2),
            actualInstalled: actualInstalled.toFixed(2),
            ItemName: row.item,
            unit: siteItem?.unit || "",
            newQuantity: numberInstalled.toFixed(2),
            unitCost: siteItem?.unitCost || 0,
            newMaterialCost: siteItem?.unitCost * actualInstalled,
            comment: comment[`${row.item}-${row.category}`] || "N/A",
            totalPercentage: totalPercentage,
            cost: projectItem?.cost || 0,
            totalCost: totalCost.toFixed(2),
          };
        });
        //For overall total percentage
        const totalPercentages = equipItemTable
          .filter((item) => item.totalPercentage !== "0.00")
          .map((item) => parseFloat(item.totalPercentage));

        const overallTotalPercentage =
          totalPercentages.length > 0
            ? (
                totalPercentages.reduce((sum, percentage) => sum + percentage) /
                totalPercentages.length
              ).toFixed(2)
            : "0.00";
        //For overall total cost
        const totalCosts = equipItemTable
          .filter((item) => item.totalCost !== "0.00")
          .map((item) => parseFloat(item.totalCost));

        const overallTotalCost =
          totalCosts.length > 0
            ? totalCosts.reduce((sum, cost) => sum + cost).toFixed(2)
            : "0.00";
        updatedEquipmentTable.push({
          personnelInstalled: user.name,
          dateInstalled: selectedDate,
          overallTotalPercentage: overallTotalPercentage,
          overAllTotalCost: overallTotalCost,
          equipItemTable: equipItemTable,
        });

        const { _id } = existingEquipmentData;

        const updateResponse = await axios.put(
          `/api/EquipmentInstalled/updateEquipmentsInstalled/${_id}`,
          {
            ...existingEquipmentData,
            equipmentTable: updatedEquipmentTable,
          }
        );
        await fetchStorageData(location);
        fetchEquipmentInstalledData();
        fetchTransactionData();

        toast.success("Equipment updated successfully");

        await axios.put(`/api/storages/${storageData[0]?.id}`, {
          siteName: storageData[0]?.siteName,
          siteTable: updatedSiteTable,
        });
      }
      setTableData([]);
      setSelectedDate("");
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Failed to save changes");
    }
  };

  const handleSaveConfirmation = () => {
    const isConfirmed = window.confirm("Are you sure you want to save?");

    if (isConfirmed) {
      if (!validateInputs()) {
        return;
      }
      handleSubmit();
      setModalOpen(false);
    }
  };
  const handleRowClick = (index) => {
    setExpandedRow((prevExpandedRow) =>
      prevExpandedRow === index ? null : index
    );
  };
  const handleRowClicks = (itemIndex) => {
    setOpenRowIndex((prevIndex) =>
      prevIndex === itemIndex ? null : itemIndex
    );
  };
  const getCurrentDate = () => {
    const currentDate = new Date().toLocaleDateString("en-US");
    return currentDate;
  };

  const getCurrentTime = () => {
    const currentTime = new Date().toLocaleTimeString("en-US");
    return currentTime;
  };
  const handleSaveChanges = async () => {
    try {
      const response = await axios.get(
        `/api/EquipmentInstalled/read?projectId=${projectId}`
      );
      const existingEquipmentData = response.data.find(
        (storage) => storage.projectId === projectId
      );

      if (existingEquipmentData) {
        const updatedEquipmentData = {
          ...existingEquipmentData,
          startDate: startDate,
          endDate: endDate,
        };

        await axios.put(
          `/api/EquipmentInstalled/updateEquipmentsInstalled/${existingEquipmentData._id}`,
          updatedEquipmentData
        );

        // Display success message
        toast.success("Changes saved successfully");
        fetchEquipmentInstalledData();
        setIsEditing(false);
      } else {
        // Display error message if projectId is not available
        toast.error("No projectId stored");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Failed to save changes");
    }
  };
  const handleDelete = async () => {
    if (!dataTableValue._id) {
      toast.error("Please Select a Date to Delete");
      return;
    }
    if (!personComment) {
      setOpenModalDelete(true);
      toast.error("Please enter your changes!");
      return;
    }

    try {
      if (!dataTableValue._id) {
        toast.error(
          "Please Select a Date to Delete, This date is already deleted"
        );
        return;
      }
      // To add the deducted quantity from date installed to the site inventory
      const updatedSiteTable = storageData[0]?.siteTable.map((item) => {
        const matchedTableData = dataTableValue.equipItemTable.filter(
          (row) => row.ItemName === item.ItemName
        );

        if (matchedTableData.length > 0) {
          const totalQuantityToAdd = matchedTableData.reduce(
            (total, row) => total + Number(row.numberInstalled),
            0
          );
          const newAddQuantity = item.quantity + totalQuantityToAdd;
          const updatedMaterialCost =
            item.materialCost + totalQuantityToAdd * item.unitCost;
          return {
            ...item,
            quantity: Number(newAddQuantity.toFixed(2)),
            materialCost: Number(updatedMaterialCost.toFixed(2)),
          };
        }
        return item;
      });
      console.log("updated table: ", updatedSiteTable);
      const response = await axios.get(
        `/api/EquipmentInstalled/read?projectId=${projectId}`
      );
      const existingEquipmentData = response.data.find(
        (storage) => storage.projectId === projectId
      );

      // Find the index of the equipmentTable id to delete
      const equipTableIndex = existingEquipmentData.equipmentTable.findIndex(
        (id) => id._id === dataTableValue._id
      );

      if (equipTableIndex !== -1) {
        // Create a new equipmentTable array without deleting all the stored equipTable to delete
        const updatedEquipmentTable = [
          ...existingEquipmentData.equipmentTable.slice(0, equipTableIndex),
          ...existingEquipmentData.equipmentTable.slice(equipTableIndex + 1),
        ];

        const modifiedInformation = {
          dateModified: getCurrentDate(),
          timeModified: getCurrentTime(),
          personModified: user.name,
          dateInstalledModified: dataTableValue.dateInstalled,
          personComment: personComment,
        };

        const monitoringTable = existingEquipmentData.monitoringTable || [];

        monitoringTable.push(modifiedInformation);

        // Update the existingEquipmentData with the updated equipmentTable and monitoringTable
        await axios.put(
          `/api/EquipmentInstalled/updateEquipTable/${existingEquipmentData._id}`,
          {
            ...existingEquipmentData,
            monitoringTable: monitoringTable,
            equipmentTable: updatedEquipmentTable,
          }
        );

        await axios.put(`/api/storages/${storageData[0]?.id}`, {
          siteName: storageData[0]?.siteName,
          siteTable: updatedSiteTable,
        });
        setPersonComment("");
        setOpenModalDelete(false);
        toast.success("Tools table entry deleted successfully");
        fetchEquipmentInstalledData();
        await fetchStorageData(location);
      } else {
        toast.error(
          "Please Select a Date to Delete, This date is already deleted"
        );
      }
    } catch (error) {
      console.error("Error Deleting Installed:", error);
      toast.error("Failed to delete");
    }
  };

  const DeleteConfirmationModal = () => {
    if (!dataTableValue._id) {
      toast.error("Please Select a Date to Delete");
      return;
    }
    setOpenModalDelete(true);
  };

  const handleCancelDeleteClick = () => {
    setOpenModalDelete(false);
  };
  const DeleteConfirmation = () => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete ${dataTableValue.dateInstalled} ?`
    );

    if (isConfirmed) {
      handleDelete();
    }
  };
  const handleEdit = () => {
    setIsEditing(true);
  };
  const handleChangeCategory = (event, newValue) => {
    setValueTab(newValue);
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
  const handleNavigationChange = (event, newValue) => {
    setSelectedTab(newValue);
  };
  const handleChangeDate = (event, value) => {
    setDatePage(value);
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
  const navigateToDeliveryTracker = (order) => {
    navigate("/DeliveryTrackerOperation", {
      state: {
        id: order._id,
        tableData: order.tableData,
        title: order.title,
        trackingNumber: order.trackingNumber,
      },
    });
  };
  useEffect(() => {
    const savedValueTab = localStorage.getItem("savedValueTab");
    if (savedValueTab !== null) {
      setValueTab(parseInt(savedValueTab));
    }
  }, []);

  // Save the current valueTab to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("savedValueTab", valueTab);
  }, [valueTab]);

  const handleChange = (event, newValue) => {
    setValueTab(newValue);
  };
  useEffect(() => {
    const savedValueTabCategory = localStorage.getItem("savedValueTabCategory");
    if (savedValueTabCategory !== null) {
      setValueTabCategory(
        savedValueTabCategory === "false" ? false : savedValueTabCategory
      );
    }
  }, []);

  // Save the current valueTabCategory to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("savedValueTabCategory", valueTabCategory);
  }, [valueTabCategory]);

  const filteredThirdTableData = thirdTableData
    .filter((item) =>
      formatDate(item.dateInstalled)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(formatDate(a.dateInstalled));
      const dateB = new Date(formatDate(b.dateInstalled));
      return dateA - dateB;
    })
    .reverse();

  const navigateToTools = (order) => {
    navigate(`/toolsMain/${id}`, {
      state: {
        id: id,
        name: name,
        projectId: projectId,
        location: location,
        items: items,
      },
    });
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
  const handleGoBack = () => {
    window.history.back();
  };
  const handleTabClick = (date) => {
    setValueTab(date);
    // console.log("DATE CLICKED: ", date);
  };
  const handleTabChange = (event, newValue) => {
    setValueTab(newValue);
  };

  const handleTabClickz = (date, id, equipItemTable, row) => {
    // console.log("Tab clicked for date:", date);
    // console.log("Tab ID Date: ", id);
    //console.log("EquipItemTable: ", row);

    const index = filteredThirdTableData.findIndex(
      (tabDate) => formatDate(tabDate.dateInstalled) === formatDate(date)
    );

    setValueTab(index !== -1 ? index : 0);
    //Pass the date ID in valueDateId to perform delete by id
    setValueDateId(id);
    setDataTableValue(row);
  };
  const matchingMonitor = monitoringTable.find(
    (monitor) =>
      monitor.dateInstalledModified ===
      filteredThirdTableData[valueTab]?.dateInstalled
  );
  const handleCancelHistoryClick = () => {
    setSidebarOpen(false);
  };
  return (
    <div>
      <div className="container-admin">
        <section className="section-admin">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controller">
            Equipment Install and Monitoring: {name}
          </div>
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
              Before deleting, kindly provide some information about the changes
              you want to make on{" "}
              {dataTableValue.dateInstalled || "(Select Date)"}.
            </p>
            <textarea
              className="text-area-comment-delete"
              placeholder="Enter your changes..."
              value={personComment}
              onChange={(e) => setPersonComment(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={DeleteConfirmation}>Continue</button>
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
          </div>
          <div>
            <BottomNavigation
              showLabels
              value={selectedTab}
              onChange={handleNavigationChange}>
              <BottomNavigationAction
                label="Equipment Monitoring"
                value="equipmentMonitoring"
              />
              <BottomNavigationAction
                label="Equipment Install"
                value="equipmentInstall"
              />
            </BottomNavigation>
          </div>
        </div>
        <div className="purchase-order-input-container-equip">
          <div className="label-transaction">Start Project Date: </div>
          <input
            className="input-date"
            type="date"
            value={startDate}
            readOnly={!isEditing}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Enter Start Date"
          />
          <div className="label-transaction">End Project Date: </div>
          <input
            className="input-date"
            type="date"
            value={endDate}
            readOnly={!isEditing} // Make the input field readonly if not in edit mode
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Enter End Date"
          />

          <div className="button-equip-box">
            <button onClick={handleSaveChanges}>Save Changes</button>
            <button onClick={handleEdit}>Edit</button>
          </div>
        </div>
        <div className="purchase-order-input-container">
          <div className="Project-details">SEE OTHER ACTIVITIES</div>
          <div className="purchase-order-input-container-tools1">
            <div
              className="daily-mini-container-1"
              onClick={() => navigateToTools()}>
              <FaTools className="Fapeoplecarry-daily-acc-1" />
              Tools Used
            </div>
            <div
              className="daily-mini-container"
              onClick={() => navigateToMancost()}>
              <FaPeopleCarry className="Fapeoplecarry-daily-acc" />
              Manpower
            </div>
          </div>
          {selectedTab === "equipmentInstall" && (
            <div className="equipmentInstall-update-button-box">
              <div className="Project-details">
                SEE INSTALLED EQUIPMENT BY DATE
              </div>
              <div className="equip-box-action">
                <input
                  type="search"
                  placeholder="Search Date Installed..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input-track-equipmentInstall"
                />
                <button
                  className="delete-equip"
                  onClick={DeleteConfirmationModal}>
                  Delete {dataTableValue.dateInstalled || "(Select Date)"}
                </button>
              </div>
              <Box
                sx={{
                  maxWidth: { xs: 320, sm: 480 },
                  bgcolor: "background.paper",
                  minWidth: { xs: 320, sm: 480 },
                  boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;",
                  padding: "2px",
                  border: "1px solid #146C94",
                  borderRadius: "6px",
                }}>
                <Tabs
                  value={valueTab}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="scrollable auto tabs example">
                  {filteredThirdTableData.map((row, index) => (
                    <Tab
                      key={index}
                      label={`${row.dateInstalled}`}
                      onClick={() =>
                        handleTabClickz(
                          row.dateInstalled,
                          row._id,
                          row.equipItemTable,
                          row
                        )
                      }
                    />
                  ))}
                </Tabs>
              </Box>
              <div>
                <div
                  className="install-for-today-button"
                  onClick={() => handleModalClick()}>
                  <FiPlus />
                  INSTALL FOR TODAY
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Second table */}
      {selectedTab === "equipmentMonitoring" && (
        <div>
          <Box
            sx={{
              maxWidth: { xs: 320, sm: 480 },
              bgcolor: "background.paper",
            }}>
            <Tabs
              value={valueTabCategory}
              onChange={(event, newValue) => setValueTabCategory(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="scrollable auto tabs example">
              <Tab label="View All" value={false} />
              {Array.from(new Set(dropdown.map((item) => item.category))).map(
                (category) => (
                  <Tab key={category} label={category} value={category} />
                )
              )}
            </Tabs>
          </Box>
          <TableContainer component={Paper}>
            <Table
              sx={{ minWidth: 650 }}
              size="small"
              aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>See Delivery</b>
                  </TableCell>
                  <TableCell>
                    <b>Item</b>
                  </TableCell>
                  <TableCell>
                    <b>BOM Quantity</b>
                  </TableCell>
                  <TableCell>
                    <b>Cost</b>
                  </TableCell>
                  <TableCell>
                    <b>Installed</b>
                  </TableCell>
                  <TableCell>
                    <b>Remaining Stock</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {secondTableData
                  .filter(
                    (row) =>
                      valueTabCategory === false ||
                      row.category === valueTabCategory
                  )
                  .map((row, index) => (
                    <React.Fragment key={index}>
                      <TableRow hover onClick={() => handleRowClick(index)}>
                        <TableCell>
                          {expandedRow === index ? (
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
                          {row.product}
                        </TableCell>
                        <TableCell
                          style={{
                            maxWidth: "200px",
                            whiteSpace: "wrap",
                          }}>
                          {row.fixedQuantity}
                        </TableCell>
                        <TableCell
                          style={{
                            maxWidth: "200px",
                            whiteSpace: "wrap",
                          }}>
                          &#x20B1; {row.cost || 0}
                        </TableCell>
                        <TableCell>
                          {thirdTableData
                            .filter((item) =>
                              item.equipItemTable.some(
                                (subItem) =>
                                  subItem.ItemName === row.product &&
                                  subItem.category === row.category
                              )
                            )
                            .reduce((sum, item) => {
                              const matchingSubItem = item.equipItemTable.find(
                                (subItem) =>
                                  subItem.ItemName === row.product &&
                                  subItem.category === row.category
                              );
                              const actualInstalled = matchingSubItem
                                ? matchingSubItem.actualInstalled
                                : 0;
                              console.log(
                                `Product: ${row.product}, Category: ${row.category}, Actual Installed: ${actualInstalled}`
                              );
                              return actualInstalled;
                            }, 0)}
                        </TableCell>

                        <TableCell>
                          {storageData[0]?.siteTable
                            .filter((item) => item.ItemName === row.product)
                            .map((item) => item.quantity)
                            .reduce((sum, quantity) => sum + quantity, 0)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          style={{ padding: 0, backgroundColor: "white" }}>
                          <Collapse
                            in={expandedRow === index}
                            timeout="auto"
                            unmountOnExit>
                            <Box
                              sx={{
                                margin: 2,
                              }}>
                              <Typography variant="h7">
                                Delivery/Pull Out for <b>{row.product}</b>
                              </Typography>
                              <table>
                                <thead>
                                  <tr>
                                    <th>Date</th>
                                    <th>Quantity</th>
                                    <th>
                                      Total Quantity:{" "}
                                      {totalQuantity[row.product] || 0}
                                    </th>
                                    <th>Tracking Number</th>
                                    <th>Receiver Personnel</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {transactionDates.map((date, dateIndex) => {
                                    if (date.itemName === row.product) {
                                      const matchingDeliveries =
                                        deliveryData.filter((delivery) =>
                                          delivery.tableData.some(
                                            (item) =>
                                              item.status === "Received" &&
                                              item.date === date.date
                                          )
                                        );
                                      const trackingNumbers =
                                        matchingDeliveries.map(
                                          (matchingDelivery) =>
                                            matchingDelivery.trackingNumber
                                        );

                                      // Add the current date to the processedDates array
                                      processedDates.push(date.date);
                                      const uniqueId = date.date;
                                      return (
                                        <tr key={dateIndex}>
                                          <td>{formatDate(date.date)}</td>
                                          <td>{date.quantity}</td>
                                          <td></td>
                                          <td
                                            className="tracking-ops"
                                            onClick={() =>
                                              navigateToDeliveryTracker(date)
                                            }>
                                            {date.trackingNumber}
                                          </td>
                                          <td>{date.name}</td>
                                        </tr>
                                      );
                                    }
                                    return null;
                                  })}
                                </tbody>
                              </table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              style={{ position: "sticky", top: 0 }}
              component="div"
              count={secondTableData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </div>
      )}
      {sidebarOpen && (
        <div className="modal">
          <div className="item-overlay4">
            <div className="title-access">These are the changes you made.</div>
            <div className="box-modal-ops-changes">
              {monitoringTable
                .map((matchingMonitor) => {
                  if (
                    matchingMonitor.dateInstalledModified ===
                    filteredThirdTableData[valueTab]?.dateInstalled
                  ) {
                    return (
                      <Box
                        sx={{
                          maxWidth: { xs: 320, sm: 480 },
                          bgcolor: "background.paper",
                          minWidth: { xs: 320, sm: 480 },
                          boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;",
                          padding: "6px",
                          border: "1px solid #146C94",
                          borderRadius: "6px",
                        }}
                        margin={1}
                        key={matchingMonitor}>
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
                          Modified Date Installed:{" "}
                          <b>{matchingMonitor.dateInstalledModified}</b>
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
      {selectedTab === "equipmentInstall" && (
        <div>
          <div>
            {/* Third table */}
            <TableContainer component={Paper}>
              <div>
                {matchingMonitor && (
                  <Button
                    sx={{ margin: "8px" }}
                    variant="outlined"
                    onClick={() => setSidebarOpen(true)}>
                    View Changes
                  </Button>
                )}
              </div>
              <Table
                sx={{ minWidth: 650 }}
                size="small"
                aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <b>See Details</b>
                    </TableCell>
                    <TableCell>
                      <b>Item Name</b>
                    </TableCell>
                    <TableCell>
                      <b>Date Installed</b>
                    </TableCell>
                    <TableCell>
                      <b>Up-to-date Installed</b>
                    </TableCell>
                    <TableCell>
                      <b>Actual Installed</b>
                    </TableCell>
                    <TableCell>
                      <b>Category</b>
                    </TableCell>
                    <TableCell>
                      <b>Total Percentage</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredThirdTableData[valueTab]?.equipItemTable
                    .filter((item) => item.actualInstalled !== 0) // Filter items with non-zero actualInstalled value
                    .map((item, itemIndex) => {
                      return (
                        <React.Fragment key={itemIndex}>
                          <TableRow
                            onClick={() => handleRowClicks(itemIndex)}
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
                              {item.ItemName}
                            </TableCell>
                            <TableCell>
                              {filteredThirdTableData[valueTab]?.dateInstalled}
                            </TableCell>
                            <TableCell>{item.numberInstalled}</TableCell>
                            <TableCell>{item.actualInstalled}</TableCell>
                            <TableCell>{item.category}</TableCell>

                            <TableCell>{item.totalPercentage}%</TableCell>
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
                                    Details for <b>{item.ItemName}</b>
                                  </Typography>
                                  <Typography variant="body1">
                                    {item.comment}
                                  </Typography>
                                </Box>
                                <Box margin={1}>
                                  <Typography gutterBottom component="div">
                                    Submitted by:{" "}
                                    <b>
                                      {
                                        filteredThirdTableData[valueTab]
                                          ?.personnelInstalled
                                      }
                                    </b>
                                  </Typography>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      );
                    })}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                style={{ position: "sticky", top: 0 }}
                component="div"
                count={secondTableData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
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
                    maxHeight: "650px",
                    overflowY: "auto",
                  }}>
                  <div className="purchase-order-box-equip">
                    <div className="modal-header-equip">
                      <section className="section-admin-man">
                        <div className="side-line-man" />
                        <div className="side-lines-man" />
                        <div className="admin-controller-man">
                          EQUIPMENT INSTALLED FOR TODAY
                        </div>
                      </section>
                      <div>
                        <div className="text-date-installed">
                          DATE INSTALLED
                        </div>
                        <input
                          className="search-input-track"
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <AiFillCloseCircle
                    onClick={handleCloseModal}
                    className="AiFillCloseCircle-ops"
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
                            {" "}
                            <TableCell>
                              <strong>Item Name</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Unit</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Quantity</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Quantity Used</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Unit Cost</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Current Material Cost</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Category</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Remarks</strong>
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
                                  placeholder="Select Item"
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
                                          item.ItemName ===
                                          tableData[index]?.item
                                      )?.unit
                                    }
                                  </TableCell>
                                  <TableCell>
                                    {
                                      storageData[0]?.siteTable.find(
                                        (item) =>
                                          item.ItemName ===
                                          tableData[index]?.item
                                      )?.quantity
                                    }
                                  </TableCell>
                                  <TableCell>
                                    <input
                                      type="text"
                                      placeholder="New Quantity"
                                      value={row.number || ""}
                                      onChange={(event) =>
                                        handleNumberChange(index, event)
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    &#x20B1;{" "}
                                    {
                                      storageData[0]?.siteTable.find(
                                        (item) =>
                                          item.ItemName ===
                                          tableData[index]?.item
                                      )?.unitCost
                                    }
                                  </TableCell>
                                  <TableCell>
                                    &#x20B1;{" "}
                                    {storageData[0]?.siteTable
                                      .find(
                                        (item) =>
                                          item.ItemName ===
                                          tableData[index]?.item
                                      )
                                      ?.materialCost.toFixed(2)}
                                  </TableCell>
                                </React.Fragment>
                              )}
                              <TableCell>
                                <select
                                  className="select-category-man"
                                  value={tableData[index]?.category || ""}
                                  onChange={(e) =>
                                    handleCategoryChange(index, e.target.value)
                                  }>
                                  <option value="">-- Select Scope --</option>
                                  {Array.from(
                                    new Set(
                                      dropdown.map((item) => item.category)
                                    )
                                  ).map((category) => (
                                    <option key={category} value={category}>
                                      {category}
                                    </option>
                                  ))}
                                </select>
                              </TableCell>
                              <TableCell>
                                <textarea
                                  className="text-area-comment"
                                  value={
                                    comment[
                                      `${tableData[index]?.item}-${row.category}`
                                    ] || "N/A"
                                  }
                                  onChange={(e) =>
                                    handleCommentChange(
                                      tableData[index]?.item,
                                      row.category,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter Details"></textarea>
                              </TableCell>

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
                  <div className="buttonSEcontainer">
                    <button onClick={handleAddRow}>Add Row</button>
                    <button
                      className="buttonSE"
                      onClick={handleSaveConfirmation}>
                      Submit
                    </button>
                  </div>
                </div>
              </Fade>
            </Box>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default EquipmentsInstalled;

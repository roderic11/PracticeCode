import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EquipmentsInstalled.css";
import { toast } from "react-toastify";
import { FiArrowLeft, FiTrash } from "react-icons/fi";
import { AiFillControl, AiFillCloseCircle } from "react-icons/ai";
import { BiPlus } from "react-icons/bi";
import { BsCalendarDate } from "react-icons/bs";
import { FaTools } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import Select from "react-select";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  Fade,
  Typography,
  Button,
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
function ManpowerCostMain() {
  const [value, setValue] = React.useState(0);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [tableData, setTableData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const [page, setPage] = useState(0);
  const [comment, setComment] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [secondTableData, setSecondTableData] = useState([]);
  const [storageData, setStorageData] = useState([]);
  const [manInfo, setManInfo] = useState([]);
  const { id, name, location, items, projectId } = useLocation().state || {};
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [thirdTableData, setThirdTableData] = useState([]);
  const [valueTab, setValueTab] = React.useState(0);
  const [dropdown, setDropdown] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [workTime, setWorkTime] = useState("");
  const [workActivity, setWorkActivity] = useState("");
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalPersonnel, setTotalPersonnel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState([]); //binago ko
  const [pName, setPName] = useState("");
  const [pDate, setPDate] = useState("");
  const [pActivity, setPActivity] = useState("");
  const [totalManpowerNum, setTotalManpowerNum] = useState(0);
  const [totalArbitNum, setTotalArbitNum] = useState(0);
  const [totalRegTime, setTotalRegTime] = useState(0);
  const [totalOvertime, setTotalOvertime] = useState(0);
  const [totalNightDiff, setTotalNightDiff] = useState(0);
  const [totalRestDay, setTotalRestDay] = useState(0);
  const [totalRestDayOT, setTotalRestDayOT] = useState(0);
  const [totalRegHoliday, setTotalRegHoliday] = useState(0);
  const [editButtonHidden, setEditButtonHidden] = useState(false);
  const [selectedProjectData, setSelectedProjectData] = useState(
    JSON.parse(localStorage.getItem("selectedProjectData")) || null
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [errors, setErrors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDates, setFilteredDates] = useState([]);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [personComment, setPersonComment] = useState("");
  const [monitoringTable, setMonitoringTable] = useState([]);

  useEffect(() => {
    setSelectedItem(items || []);
    setThirdTableData(items || []);
  }, [items]);

  const fetchMancost = async (projectId) => {
    try {
      const response = await axios.get(
        `/api/manpowerCost/read?projectId=${projectId}`
      );
      const data = response.data;
      const equipmentData = data.find(
        (equipment) => equipment.projectId === projectId
      );
      setMonitoringTable(equipmentData.monitoringManCostTable);
      // Process the fetched data here...
      setThirdTableData(equipmentData);
      console.log("DATA FROM MANPOWERCOST: ", equipmentData);
    } catch (error) {
      console.error("Error fetching equipment installed data:", error);
    }
  };
  useEffect(() => {
    localStorage.setItem(
      `selectedProjectData_${projectId}`,
      JSON.stringify(selectedProjectData)
    );
  }, [projectId, selectedProjectData]);

  useEffect(() => {
    fetchMancost(projectId);
  }, [projectId]);

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
  }, [projectId, id]);

  useEffect(() => {
    // Retrieve the editButtonHidden value from localStorage for the specific manpower cost page
    const storedValue = localStorage.getItem(`editButtonHidden_${id}`);
    setEditButtonHidden(storedValue ? JSON.parse(storedValue) : false);
  }, [id]);

  const hours = 8;
  const w = 0;
  const x = 0;
  const y = 0;
  const z = 0;
  const aa = 0;
  const rate = 500;

  const adminCost1 = () => {
    const prod7 = hours * totalManpowerNum;
    const qtnt1 = prod7 / totalPersonnel;
    return qtnt1.toFixed(4);
  };

  const adminCost2 = () => {
    const prod7 = w * totalManpowerNum;
    const qtnt1 = prod7 / totalPersonnel;
    return qtnt1.toFixed(4);
  };

  const adminCost3 = () => {
    const prod7 = x * totalManpowerNum;
    const qtnt1 = prod7 / totalPersonnel;
    return qtnt1.toFixed(4);
  };

  const adminCost4 = () => {
    const prod7 = y * totalManpowerNum;
    const qtnt1 = prod7 / totalPersonnel;
    return qtnt1.toFixed(4);
  };

  const adminCost5 = () => {
    const prod7 = z * totalManpowerNum;
    const qtnt1 = prod7 / totalPersonnel;
    return qtnt1.toFixed(4);
  };

  const adminCost6 = () => {
    const prod7 = aa * totalManpowerNum;
    const qtnt1 = prod7 / totalPersonnel;
    return qtnt1.toFixed(4);
  };

  const adminCostREG = adminCost1();
  const adminCostOT = adminCost2();
  const adminCostND = adminCost3();
  const adminCostRD = adminCost4();
  const adminCostRDOT = adminCost5();
  const adminCostRH = adminCost6();
  const adminArbit = 3.624;

  const getColumnTotals = (data) => {
    let sumNumber1 = 0;
    let sumNumber2 = 0;
    let sumNumber3 = 0;
    let sumNumber4 = 0;
    let sumNumber5 = 0;
    let sumNumber6 = 0;
    let sumNumber7 = 0;
    let sumNumber8 = 0;

    data.forEach((row) => {
      sumNumber1 += Number(row.numbers.ManpowerNum);
      sumNumber2 += Number(row.numbers.ArbitNum);
      sumNumber3 += Number(row.numbers.RegTime);
      sumNumber4 += Number(row.numbers.Overtime);
      sumNumber5 += Number(row.numbers.NightDiff);
      sumNumber6 += Number(row.numbers.RestDay);
      sumNumber7 += Number(row.numbers.RestDayOT);
      sumNumber8 += Number(row.numbers.RegHoliday);
    });

    return {
      sumNumber1,
      sumNumber2,
      sumNumber3,
      sumNumber4,
      sumNumber5,
      sumNumber6,
      sumNumber7,
      sumNumber8,
    };
  };

  useEffect(() => {
    const columnTotals = getColumnTotals(data); // Calculate column totals based on the updated data array

    setTotalManpowerNum(columnTotals.sumNumber1);
    setTotalArbitNum(columnTotals.sumNumber2);
    setTotalRegTime(columnTotals.sumNumber3);
    setTotalOvertime(columnTotals.sumNumber4);
    setTotalNightDiff(columnTotals.sumNumber5);
    setTotalRestDay(columnTotals.sumNumber6);
    setTotalRestDayOT(columnTotals.sumNumber7);
    setTotalRegHoliday(columnTotals.sumNumber8);

    const adminCostRegValue = parseFloat(adminCost1()); // Calculate adminCostREG value
    const newTotalRegTime =
      parseFloat(columnTotals.sumNumber3) + adminCostRegValue; // Add adminCostRegValue to existing totalRegTime
    setTotalRegTime(parseFloat(newTotalRegTime.toFixed(2))); // Update the value of totalRegTime
  }, [data]);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const deleteRow = (rowIndex) => {
    const shouldDelete = window.confirm(
      "Do you really want to delete this row?"
    );

    if (shouldDelete) {
      setData((prevData) => {
        const newData = [...prevData];
        newData.splice(rowIndex, 1);
        return newData;
      });
    }
  };

  const addRow = () => {
    setData((prevState) => [
      ...prevState,
      {
        name: "",
        numbers: {
          ManpowerNum: "",
          ArbitNum: "",
          RegTime: "",
          Overtime: 0,
          NightDiff: 0,
          RestDay: 0,
          RestDayOT: 0,
          RegHoliday: 0,
        },
      },
    ]);
  };

  const handleDropdownChange = (e, rowIndex, column) => {
    // Validate totalPersonnel
    if (!totalPersonnel) {
      toast.error("Enter total personnel in-charge first.");
      return;
    }
    const { value } = e.target;
    const selectedMan = manInfo.find((man) => man.name === value);

    setData((prevState) => {
      const newData = [...prevState];
      if (newData[rowIndex].numbers) {
        newData[rowIndex][column] = value;
        newData[rowIndex].numbers.ArbitNum = selectedMan?.arbitraryNumber || "";
      } else {
        newData[rowIndex].numbers = {
          [column]: value,
          ArbitNum: selectedMan?.arbitraryNumber || "",
        };
      }

      return newData;
    });
  };

  //BAGONG DAGDAG

  const calculateRowSum = (row) => {
    const {
      ArbitNum,
      RegTime,
      Overtime,
      NightDiff,
      RestDay,
      RestDayOT,
      RegHoliday,
    } = row.numbers ?? {};
    const prod1 = Number(ArbitNum || 0) * Number(RegTime || 0);
    const prod2 = Number(ArbitNum || 0) * 1.25 * Number(Overtime || 0);
    const prod3 = Number(ArbitNum || 0) * 0.1 * Number(NightDiff || 0);
    const prod4 = Number(ArbitNum || 0) * 1.3 * Number(RestDay || 0);
    const prod5 = Number(ArbitNum || 0) * 1.3 * 1.3 * Number(RestDayOT || 0);
    const prod6 = Number(ArbitNum || 0) * 2 * Number(RegHoliday || 0);
    const sum = prod1 + prod2 + prod3 + prod4 + prod5 + prod6;
    return sum.toFixed(3);
  };

  /*const calculateTotalRegTime = () => {
    const sum = parseFloat(dummyReg) + parseFloat(adminCostREG);
    setTotalNumber3(sum);
  };*/

  const handleChange = (e, rowIndex, columnName) => {
    if (!totalPersonnel) {
      toast.error("Enter total personnel in-charge first.");
      return;
    }
    const { value } = e.target;
    setData((prevData) => {
      const newData = [...prevData];
      newData[rowIndex].numbers[columnName] = value;
      return newData;
    });
  };

  const handleTotalPersonnelChange = (e) => {
    setTotalPersonnel(e.target.value);
  };

  /*Admin Cost Total ng ROW nila*/
  const adminCostTotal = () => {
    const adProd1 = adminArbit * adminCostREG;
    const adProd2 = adminArbit * 1.25 * adminCostOT;
    const adProd3 = adminArbit * 0.1 * adminCostND;
    const adProd4 = adminArbit * 1.3 * adminCostRD;
    const adProd5 = adminArbit * 1.3 * 1.3 * adminCostRDOT;
    const adProd6 = adminArbit * 2 * adminCostRH;
    const adSum = adProd1 + adProd2 + adProd3 + adProd4 + adProd5 + adProd6;
    return adSum.toFixed(3);
  };

  const sumRowTotal = () => {
    let sum = 0;
    data.forEach((row) => {
      sum += parseFloat(calculateRowSum(row));
    });
    return sum.toFixed(4);
  };

  const partialTotal = () => {
    const totalSum = parseFloat(sumRowTotal());
    const totalAdminCost = parseFloat(adminCostTotal());
    const totalCost = totalSum + totalAdminCost;
    return totalCost.toFixed(3);
  };

  const grandTotalCost = () => {
    const totalCost = parseFloat(partialTotal());
    const grandProd1 = totalCost * rate;
    return grandProd1.toFixed(4);
  };
  const validateInputs = () => {
    const newErrors = [];

    // Validate selectedDate
    if (!selectedDate) {
      newErrors.push("Please select a date.");
    }
    if (
      thirdTableData &&
      thirdTableData.costingTable &&
      thirdTableData.costingTable.some(
        (costingData) => costingData.projectDate === selectedDate
      )
    ) {
      newErrors.push("The selected date already existing.");
    }
    // Validate pActivity
    if (!pActivity) {
      newErrors.push("Please enter today's activity.");
    }

    // Validate totalPersonnel
    if (totalPersonnel <= 0) {
      newErrors.push("Total personnel should be a positive number.");
    }

    // Validate data rows
    const rowDataErrors = data.map((row, rowIndex) => {
      const rowErrors = {};

      // Validate dropdown selection
      if (!row.name) {
        rowErrors.name = "Please select a manpower.";
      }

      // Validate numbers input
      if (row.numbers) {
        Object.entries(row.numbers).forEach(([columnName, number]) => {
          if (
            columnName !== "ArbitNum" &&
            (number === undefined || number === "" || isNaN(number))
          ) {
            rowErrors[columnName] = "Please enter a valid number.";
          }
        });
      }

      return rowErrors;
    });

    // Update errors state
    setErrors([...newErrors, ...rowDataErrors]);

    // Display error messages using toast.error
    newErrors.forEach((error) => {
      toast.error(error);
    });
    rowDataErrors.forEach((rowErrors) => {
      Object.values(rowErrors).forEach((error) => {
        toast.error(error);
      });
    });

    // Return true if there are no errors
    return (
      newErrors.length === 0 &&
      rowDataErrors.every((rowError) => Object.keys(rowError).length === 0)
    );
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.get(
        `/api/manpowerCost/read?projectId=${projectId}`
      );
      const existingManpowerCost = response.data.find(
        (manpowerCost) => manpowerCost.projectId === projectId
      );

      const sumPerRow = (row) => {
        return calculateRowSum(row);
      };

      const extractedData = data.map((item) => {
        return {
          ManName: item.name,
          ManpowerNum: item.numbers.ManpowerNum,
          ArbitNum: item.numbers.ArbitNum,
          RegTime: item.numbers.RegTime,
          Overtime: item.numbers.Overtime,
          NightDiff: item.numbers.NightDiff,
          RestDay: item.numbers.RestDay,
          RestDayOT: item.numbers.RestDayOT,
          RegHoliday: item.numbers.RegHoliday,
          sumPerRow: sumPerRow(item),
        };
      });

      if (!existingManpowerCost) {
        // Create a new manpower cost if it doesn't exist
        const manpowerCostData = {
          projectId: projectId,
          siteName: location,
          projectName: name,
          costingTable: [
            {
              personnel: user.name,
              projectDate: selectedDate,
              projectActivity: pActivity,
              mancostTable: extractedData,
              totalManpowerNum: totalManpowerNum,
              totalRegTime: totalRegTime,
              totalOvertime: totalOvertime,
              totalNightDiff: totalNightDiff,
              totalRestDay: totalRestDay,
              totalRestDayOT: totalRestDayOT,
              totalRegHoliday: totalRegHoliday,
              totalPersonnel: totalPersonnel,
              partialTotal: partialTotal(),
              grandTotalCost: grandTotalCost(),
              adminCostTotal: adminCostTotal(),
              adminCostREG: adminCostREG,
              adminCostOT: adminCostOT,
              adminCostND: adminCostND,
              adminCostRD: adminCostRD,
              adminCostRDOT: adminCostRDOT,
              adminCostRH: adminCostRH,
            },
          ],
        };

        const createResponse = await axios.post(
          "/api/manpowerCost/create",
          manpowerCostData
        );

        // Handle success message or any other logic
        console.log("Create Response:", createResponse.data);
        toast.success("Manpower cost created successfully");
      } else {
        // Update existing manpower cost by adding a new object to costingTable
        const { _id, costingTable } = existingManpowerCost;

        const updatedCostingTable = [
          ...costingTable,
          {
            personnel: user.name,
            projectDate: selectedDate,
            projectActivity: pActivity,
            mancostTable: extractedData,
            totalManpowerNum: totalManpowerNum,
            totalRegTime: totalRegTime,
            totalOvertime: totalOvertime,
            totalNightDiff: totalNightDiff,
            totalRestDay: totalRestDay,
            totalRestDayOT: totalRestDayOT,
            totalRegHoliday: totalRegHoliday,
            totalPersonnel: totalPersonnel,
            partialTotal: partialTotal(),
            grandTotalCost: grandTotalCost(),
            adminCostTotal: adminCostTotal(),
            adminCostREG: adminCostREG,
            adminCostOT: adminCostOT,
            adminCostND: adminCostND,
            adminCostRD: adminCostRD,
            adminCostRDOT: adminCostRDOT,
            adminCostRH: adminCostRH,
          },
        ];

        const manpowerCostData = {
          costingTable: updatedCostingTable,
        };

        const updateResponse = await axios.put(
          `/api/manpowerCost/updateManpowerCost/${_id}`,
          manpowerCostData
        );

        // Handle success message or any other logic
        console.log("Update Response:", updateResponse.data);
        toast.success("Manpower cost updated successfully");
      }
      await fetchMancost(projectId);
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
      setData((prevState) => [
        {
          name: "",
          numbers: {
            ManpowerNum: "",
            ArbitNum: "",
            RegTime: "",
            Overtime: 0,
            NightDiff: 0,
            RestDay: 0,
            RestDayOT: 0,
            RegHoliday: 0,
          },
        },
      ]);
      setTotalPersonnel("");
      setPActivity("");
      setSelectedDate("");
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
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const sortedDates = thirdTableData?.costingTable?.sort((a, b) => {
    const dateA = new Date(a?.projectDate);
    const dateB = new Date(b?.projectDate);
    return dateB - dateA;
  });
  const getCurrentDate = () => {
    const currentDate = new Date().toLocaleDateString("en-US");
    return currentDate;
  };

  const getCurrentTime = () => {
    const currentTime = new Date().toLocaleTimeString("en-US");
    return currentTime;
  };
  const handleDelete = () => {
    if (!selectedProjectData.projectDate) {
      toast.error("Please select a date to delete.");
      return;
    }
    if (!personComment) {
      toast.error("Please enter your changes!");
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to delete this ${formatDate(
          selectedProjectData.projectDate
        )}?`
      )
    ) {
      // Find the index of the selected date in the costingTable
      const dateIndex = thirdTableData.costingTable.findIndex(
        (costingData) =>
          costingData.projectDate === selectedProjectData.projectDate
      );

      if (dateIndex !== -1) {
        // Remove the selected date from the costingTable
        const updatedCostingTable = [...thirdTableData.costingTable];
        updatedCostingTable.splice(dateIndex, 1);

        const modifiedInformation = {
          dateModified: getCurrentDate(),
          timeModified: getCurrentTime(),
          personModified: user.name,
          dateWorkModified: formatDate(selectedProjectData.projectDate),
          personComment: personComment,
        };
        const monitoringManCostTable =
          thirdTableData.monitoringManCostTable || [];
        monitoringManCostTable.push(modifiedInformation);

        // Create a new object with updated costingTable
        const updatedManpowerCostData = {
          ...thirdTableData,
          costingTable: updatedCostingTable,
        };

        // Send PUT request to update the manpower cost data
        axios
          .put(
            `/api/manpowerCost/updateManpowerCost/${thirdTableData._id}`,
            updatedManpowerCostData
          )
          .then((response) => {
            console.log("Update Response:", response.data);
            toast.success("Date deleted successfully");
            fetchMancost(projectId);
            setPersonComment("");
            setOpenModalDelete(false);
            const selectedDate = formatDate(selectedProjectData.projectDate);
            localStorage.removeItem(`selectedProjectData_${selectedDate}`);
          })
          .catch((error) => {
            console.error("Error deleting date:", error);
            toast.error("Failed to delete date");
          });
      }
    }
  };
  useEffect(() => {
    const selectedDate = formatDate(selectedProjectData.projectDate);
    const storedSelectedProjectData = JSON.parse(
      localStorage.getItem(`selectedProjectData_${selectedDate}`)
    );

    if (
      storedSelectedProjectData &&
      storedSelectedProjectData.projectId === projectId
    ) {
      setSelectedProjectData(storedSelectedProjectData);
    } else {
      setSelectedProjectData({});
    }
  }, [projectId]);

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
  const handleSearchInputChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);

    const filteredDates = sortedDates.filter((costingData) => {
      const formattedDate = formatDate(costingData?.projectDate);
      return formattedDate.toLowerCase().includes(query.toLowerCase());
    });

    setFilteredDates(filteredDates);
  };
  const handleCancelDeleteClick = () => {
    setOpenModalDelete(false);
  };
  const handleCancelHistoryClick = () => {
    setSidebarOpen(false);
  };
  const DeleteConfirmationModal = () => {
    setOpenModalDelete(true);
  };
  const hasMatchingDates = monitoringTable.some(
    (matchingMonitor) =>
      matchingMonitor.dateWorkModified ===
      formatDate(selectedProjectData?.projectDate)
  );
  return (
    <div>
      <div className="container-admin">
        <section className="section-admin">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controller">Manpower Cost: {name}</div>
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
              {formatDate(selectedProjectData.projectDate) || "(Select Date)"}.
            </p>
            <textarea
              className="text-area-comment-delete"
              placeholder="Enter your changes..."
              value={personComment}
              onChange={(e) => setPersonComment(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={handleDelete}>Continue</button>
              <button onClick={handleCancelDeleteClick}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div className="manpower-box">
        <div className="side-container-manpowercost">
          <div className="calend-man">MANPOWER CALENDAR</div>
          <input
            type="search"
            placeholder="Search Costing Date..."
            className="search-input-track"
            value={searchQuery}
            onChange={handleSearchInputChange}
          />

          <div className="side-container-manpowercost-sub1">
            <div className="side-container-manpowercost-sub2">
              {(filteredDates.length > 0 ? filteredDates : sortedDates)?.map(
                (costingData, index) => (
                  <div
                    className="calendar-manpower"
                    key={index}
                    onClick={() => {
                      setSelectedProjectData(costingData);
                      console.log("Selected Project Data:", costingData);
                    }}>
                    <BsCalendarDate className="BS-calendar" />
                    <div className="manpower-date">
                      {formatDate(costingData?.projectDate)}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <div className="manpower-sub">
          <div className="purchase-order-box-equip">
            <div className="purchase-order-subbox-equip">
              <div className="Project-details">PROJECT DETAILS</div>

              <div className="grid-container-equip">
                <div className="grid-item">
                  <div>Project Name: {name} </div>
                </div>
                <div className="grid-item-equip">
                  <div>Site Name: {location} </div>
                </div>
                <div className="grid-item-equip">
                  <div>Project ID: {projectId} </div>
                </div>
                {selectedProjectData && (
                  <div className="grid-item-equip">
                    <div>
                      Date: {formatDate(selectedProjectData?.projectDate)}{" "}
                    </div>
                  </div>
                )}

                {!editButtonHidden && (
                  <div onClick={openModal} className="mancost-button">
                    <BiPlus className="create-new-button-logo" />
                    Create
                  </div>
                )}
                {selectedProjectData && (
                  <div className="Fi-trash" onClick={DeleteConfirmationModal}>
                    <FiTrash />
                    Delete
                  </div>
                )}
              </div>
            </div>
            {selectedProjectData && (
              <div className="purchase-order-input-container">
                <div className="Project-details">ACTIVITY:</div>
                <div className="project-details-man">
                  {selectedProjectData?.projectActivity}
                </div>
              </div>
            )}
            <div className="purchase-order-input-container">
              <div className="Project-details">SEE OTHER ACTIVITIES</div>
              <div className="purchase-order-input-container-tools">
                <div
                  className="daily-mini-container-1"
                  onClick={() => navigateToTools()}>
                  <FaTools className="Fapeoplecarry-daily-acc-1" />
                  Tools Used
                </div>
                <div
                  className="daily-mini-container-2"
                  onClick={() => navigateToEquipment()}>
                  <AiFillControl className="Fapeoplecarry-daily-acc-2" />
                  Equipment
                </div>
              </div>
            </div>
          </div>

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
              {sidebarOpen && (
                <div className="modal">
                  <div className="item-overlay4">
                    <div className="title-access">
                      These are the changes you made.
                    </div>
                    <div className="box-modal-ops-changes">
                      {monitoringTable
                        .map((matchingMonitor) => {
                          if (
                            matchingMonitor.dateWorkModified ===
                            formatDate(selectedProjectData?.projectDate)
                          ) {
                            return (
                              <Box
                                sx={{
                                  maxWidth: { xs: 320, sm: 480 },
                                  bgcolor: "background.paper",
                                  minWidth: { xs: 320, sm: 480 },
                                  boxShadow:
                                    "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;",
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
                                  Modified by:{" "}
                                  <b>{matchingMonitor.personModified}</b>
                                </Typography>
                                <Typography
                                  gutterBottom
                                  component="div"
                                  sx={{ fontSize: "13px" }} // Change the font size here
                                >
                                  Date Modified:{" "}
                                  <b>
                                    {formatDate(matchingMonitor.dateModified)}
                                  </b>
                                </Typography>
                                <Typography
                                  gutterBottom
                                  component="div"
                                  sx={{ fontSize: "13px" }} // Change the font size here
                                >
                                  Time Modified:{" "}
                                  <b>{matchingMonitor.timeModified}</b>
                                </Typography>
                                <Typography
                                  gutterBottom
                                  component="div"
                                  sx={{ fontSize: "13px" }} // Change the font size here
                                >
                                  Changes:{" "}
                                  <b>{matchingMonitor.personComment}</b>
                                </Typography>
                                <Typography
                                  gutterBottom
                                  component="div"
                                  sx={{ fontSize: "13px" }} // Change the font size here
                                >
                                  Modified Date Work:{" "}
                                  <b>{matchingMonitor.dateWorkModified}</b>
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

              <Table
                sx={{ minWidth: 650 }}
                size="small"
                aria-label="a dense table">
                <TableHead style={{ position: "sticky", top: 0 }}>
                  <TableRow>
                    <TableCell>
                      <b>Name</b>
                    </TableCell>
                    <TableCell>
                      <b>MP</b>
                    </TableCell>
                    <TableCell>
                      <b>REG</b>
                    </TableCell>
                    <TableCell>
                      <b>OT</b>
                    </TableCell>
                    <TableCell>
                      <b>ND</b>
                    </TableCell>
                    <TableCell>
                      <b>RD</b>
                    </TableCell>
                    <TableCell>
                      <b>RD/OT</b>
                    </TableCell>
                    <TableCell>
                      <b>RH</b>
                    </TableCell>
                    <TableCell>
                      <b>Total</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedProjectData?.mancostTable?.map((row, index) => (
                    <TableRow
                      hover
                      key={index}
                      style={{
                        backgroundColor: index % 2 === 0 ? "white" : "#f0f0f0",
                      }}>
                      <TableCell
                        style={{
                          maxWidth: "200px",
                          whiteSpace: "wrap",
                        }}>
                        {row?.ManName}
                      </TableCell>
                      <TableCell>{row?.ManpowerNum}</TableCell>
                      <TableCell>{row?.RegTime}</TableCell>
                      <TableCell>{row?.Overtime}</TableCell>
                      <TableCell>{row?.NightDiff}</TableCell>
                      <TableCell>{row?.RestDay}</TableCell>
                      <TableCell>{row?.RestDayOT}</TableCell>
                      <TableCell>{row?.RegHoliday}</TableCell>
                      <TableCell>{row?.sumPerRow}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow hover>
                    <TableCell>
                      <b>Admin Cost</b>
                    </TableCell>
                    <TableCell colSpan={1}></TableCell>
                    <TableCell>{selectedProjectData?.adminCostREG}</TableCell>
                    <TableCell colSpan={5}></TableCell>
                    <TableCell>{selectedProjectData?.adminCostTotal}</TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>
                      <b>Total</b>
                    </TableCell>
                    <TableCell>
                      {selectedProjectData?.totalManpowerNum}
                    </TableCell>
                    <TableCell>{selectedProjectData?.totalRegTime}</TableCell>
                    <TableCell>{selectedProjectData?.totalOvertime}</TableCell>
                    <TableCell>{selectedProjectData?.totalNightDiff}</TableCell>
                    <TableCell>{selectedProjectData?.totalRestDay}</TableCell>
                    <TableCell>{selectedProjectData?.totalRestDayOT}</TableCell>
                    <TableCell>
                      {selectedProjectData?.totalRegHoliday}
                    </TableCell>
                    <TableCell>{selectedProjectData?.partialTotal}</TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>
                      <b>Total Cost</b>
                    </TableCell>
                    <TableCell colSpan={7}></TableCell>
                    <TableCell>
                      &#x20B1; {selectedProjectData?.grandTotalCost}
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell colSpan={9}>
                      <b>Total Personnel:</b>{" "}
                      {selectedProjectData?.totalPersonnel} person/s
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell colSpan={9}>
                      <b>Submitted by:</b> {selectedProjectData?.personnel}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                style={{ position: "sticky", top: 0 }}
                component="div"
                count={selectedProjectData?.mancostTable?.length || 0}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          </div>
        </div>
        <div>
          <Modal
            open={modalOpen}
            onClose={handleCloseModal}
            closeAfterTransition
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description">
            <Box sx={modalStyle}>
              <Fade in={modalOpen}>
                <div>
                  <div className="purchase-order-box-equip">
                    <section className="section-admin-man">
                      <div className="side-line-man" />
                      <div className="side-lines-man" />
                      <div className="admin-controller-man">
                        MANPOWER COST FOR TODAY
                      </div>
                    </section>
                    <div>
                      <div className="text-date-installed">DATE OF WORK</div>
                      <input
                        className="search-input-track"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>
                    <div className="tPersonnel">
                      <div className="text-date-installed">
                        TOTAL PERSONNEL ALLOCATED
                      </div>
                      <div>
                        <input
                          className="search-input-track"
                          placeholder="Enter personnel in-charge"
                          type="number"
                          value={totalPersonnel}
                          onChange={handleTotalPersonnelChange}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-date-installed">
                        ENTER TODAY'S ACTIVITY
                      </div>
                      <div>
                        <textarea
                          className="search-input-track-activity"
                          placeholder="Enter today's activity"
                          type="text"
                          value={pActivity}
                          onChange={(e) => setPActivity(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

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
                        <TableHead style={{ position: "sticky", top: 0 }}>
                          <TableRow>
                            <TableCell>
                              <strong>Name</strong>
                            </TableCell>
                            <TableCell>
                              <strong>MP</strong>
                            </TableCell>
                            <TableCell>
                              <strong>REG</strong>
                            </TableCell>
                            <TableCell>
                              <strong>OT</strong>
                            </TableCell>
                            <TableCell>
                              <strong>ND</strong>
                            </TableCell>
                            <TableCell>
                              <strong>RD</strong>
                            </TableCell>
                            <TableCell>
                              <strong>RD/OT</strong>
                            </TableCell>
                            <TableCell>
                              <strong>RH</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Total</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Action</strong>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              <TableCell>
                                <select
                                  value={row.name}
                                  onChange={(e) =>
                                    handleDropdownChange(e, rowIndex, "name")
                                  }>
                                  <option value="" disabled>
                                    Select Manpower
                                  </option>
                                  {manInfo.map((man, index) => (
                                    <option key={index} value={man.name}>
                                      {man.name}
                                    </option>
                                  ))}
                                </select>
                              </TableCell>
                              {row.numbers &&
                                "ArbitNum" in row.numbers &&
                                Object.entries(row.numbers).map(
                                  ([columnName, number]) =>
                                    columnName !== "ArbitNum" && (
                                      <TableCell key={columnName}>
                                        <input
                                          className="mancost-input-number"
                                          type="text"
                                          value={number}
                                          onChange={(e) =>
                                            handleChange(
                                              e,
                                              rowIndex,
                                              columnName
                                            )
                                          }
                                        />
                                      </TableCell>
                                    )
                                )}
                              <TableCell>{calculateRowSum(row)}</TableCell>
                              <TableCell>
                                {rowIndex !== 0 && (
                                  <button onClick={() => deleteRow(rowIndex)}>
                                    Delete
                                  </button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell>
                              <strong>Admin Cost</strong>
                            </TableCell>
                            <TableCell colSpan={1}></TableCell>
                            <TableCell>{adminCostREG}</TableCell>
                            <TableCell colSpan={5}></TableCell>
                            <TableCell>{adminCostTotal()}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>Total</strong>
                            </TableCell>
                            <TableCell>
                              {totalManpowerNum
                                ? totalManpowerNum.toFixed(2)
                                : "" || 0}
                            </TableCell>
                            <TableCell>
                              {totalRegTime ? totalRegTime.toFixed(2) : "" || 0}
                            </TableCell>
                            <TableCell>
                              {totalOvertime
                                ? totalOvertime.toFixed(2)
                                : "" || 0}
                            </TableCell>
                            <TableCell>
                              {totalNightDiff
                                ? totalNightDiff.toFixed(2)
                                : "" || 0}
                            </TableCell>
                            <TableCell>
                              {totalRestDay ? totalRestDay.toFixed(2) : "" || 0}
                            </TableCell>
                            <TableCell>
                              {totalRestDayOT
                                ? totalRestDayOT.toFixed(2)
                                : "" || 0}
                            </TableCell>
                            <TableCell>
                              {totalRegHoliday
                                ? totalRegHoliday.toFixed(2)
                                : "" || 0}
                            </TableCell>
                            <TableCell>{partialTotal()}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>Total Cost</strong>
                            </TableCell>
                            <TableCell colSpan={7}></TableCell>
                            <TableCell>{grandTotalCost() || 0}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </TableContainer>
                  <button className="create-button" onClick={addRow}>
                    Add Row
                  </button>
                  <button
                    className="submit-button"
                    onClick={handleSaveConfirmation}>
                    Submit
                  </button>
                  <button className="submit-button" onClick={handleCloseModal}>
                    Cancel
                  </button>
                </div>
              </Fade>
            </Box>
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default ManpowerCostMain;

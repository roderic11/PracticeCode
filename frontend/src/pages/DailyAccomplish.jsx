import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "./EquipmentsInstalled.css";
import { FiArrowLeft } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import { AiFillControl, AiFillContainer } from "react-icons/ai";
import { FaTools, FaPeopleCarry, FaPeopleLine } from "react-icons/fa";
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
  Alert,
  Tab,
  Tabs,
} from "@mui/material";
import { Line } from "react-chartjs-2";
import { BsArrowDownShort, BsArrowUpShort } from "react-icons/bs";

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options);
};
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1200,
  bgcolor: "background.paper",
  borderRadius: "10px",
  boxShadow: 24,
  padding: "20px",
  backgroundColor: "#f4f4f4",
};

function formatNumber(value) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
function formatNumberManCost(number) {
  const formattedNumber = parseFloat(number);
  if (isNaN(formattedNumber)) {
    return new Intl.NumberFormat("en-US").format(0);
  } else {
    return new Intl.NumberFormat("en-US").format(formattedNumber.toFixed(2));
  }
}
function DailyAccomplish() {
  const [value, setValue] = React.useState(0);

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
  const [lastTableData, setLastTableData] = useState([]);
  const [valueTab, setValueTab] = React.useState(0);
  const [valueTabCategory, setValueTabCategory] = React.useState(0);
  const [dropdown, setDropdown] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  // Fetch equipment installed data based on the projectId
  const [existingDates, setExistingDates] = useState([]);
  const [selectedProjectDate, setSelectedProjectDate] = useState("");
  const [contractCost, setContractCost] = useState("");
  const [manpowerCostTableData, setManpowerCostTableData] = useState([]);
  const [equipmentCost, setEquipmentCost] = useState(0);
  const [chartData, setChartData] = useState({});
  const [searchedDate, setSearchedDate] = useState(null);
  const [showManpowerCostTable, setShowManpowerCostTable] = useState(false);
  const [showToolsUsedTable, setShowToolsUsedTable] = useState(false);
  const [showAllTables, setShowAllTables] = useState(false);
  const [showEquipmentInstalledTable, setShowEquipmentInstalledTable] =
    useState(false);
  const [openRowIndex, setOpenRowIndex] = useState(null);
  const [openRowIndexs, setOpenRowIndexs] = useState(null);
  const [searchDate, setSearchDate] = useState("");
  const [reportType, setReportType] = useState("daily");
  const [totalDailyCost, setTotalDailyCost] = useState(0);

  const fetchEquipmentInstalledData = async () => {
    try {
      const response = await axios.get(
        `/api/EquipmentInstalled/read?projectId=${projectId}`
      );
      const data = response.data;
      const equipmentData = data.find(
        (equipment) => equipment.projectId === projectId
      );

      if (equipmentData) {
        const formattedEquipmentTable = equipmentData.equipmentTable.map(
          (item) => ({
            ...item,
            dateInstalled: formatDate(item.dateInstalled),
          })
        );

        // Sort the equipment data based on dateInstalled in ascending order
        formattedEquipmentTable.sort(
          (a, b) => new Date(a.dateInstalled) - new Date(b.dateInstalled)
        );

        setThirdTableData(formattedEquipmentTable);
        setStartDate(equipmentData.startDate);
        setEndDate(equipmentData.endDate);

        // Extract existing dates from equipmentData
        const dates = formattedEquipmentTable.map((item) =>
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

  const fetchToolsInstalledData = async () => {
    try {
      const response = await axios.get(
        `/api/opsTools/read?projectId=${projectId}`
      );
      const data = response.data;
      const equipmentData = data.find(
        (equipment) => equipment.projectId === projectId
      );

      if (equipmentData) {
        const formattedEquipmentTable = equipmentData.toolsTable
          .map((tools) => {
            const { workDate, workActivity, workTime } = tools;
            return tools.toolsItemsTable.map((item) => ({
              ToolsItemName: item.ToolsItemName,
              ToolsSN: item.ToolsSN,
              ToolsRemarks: item.ToolsRemarks,
              ToolsInCharge: item.ToolsInCharge,
              ToolsStart: item.ToolsStart,
              ToolsEnd: item.ToolsEnd,
              workDate,
              workActivity,
              workTime,
            }));
          })
          .flat();

        // Sort the formattedEquipmentTable based on the workDate in ascending order
        formattedEquipmentTable.sort(
          (a, b) => new Date(a.workDate) - new Date(b.workDate)
        );

        console.log(
          "List of workDate:",
          formattedEquipmentTable.map((item) => item.workDate)
        );

        // Log the toolsItemsTable for each list of workDate, avoiding duplication
        const loggedWorkDates = new Set();
        formattedEquipmentTable.forEach((item) => {
          if (!loggedWorkDates.has(item.workDate)) {
            loggedWorkDates.add(item.workDate);
            console.log("Tools Items Table for workDate:", item.workDate);
            console.log(item);
          }
        });

        setSecondTableData(formattedEquipmentTable);
      } else {
        setSecondTableData([]);
      }

      console.log("Fetched equipment installed data:", thirdTableData);
    } catch (error) {
      console.error("Error fetching equipment installed data:", error);
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
  useEffect(() => {
    let isMounted = true;

    if (projectId) {
      fetchToolsInstalledData();
    }

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  // Fetch manpower cost data based on the projectId
  const fetchManpowerCostData = async (projectId, projectDate) => {
    try {
      const response = await axios.get(
        `/api/manpowerCost/read?projectId=${projectId}&projectDate=${projectDate}`
      );
      const data = response.data;
      const equipmentData = data.find(
        (equipment) => equipment.projectId === projectId
      );

      // Process the fetched data here...
      setLastTableData(equipmentData);

      // Update the selected projectDate
      setSelectedProjectDate(projectDate);

      console.log(
        "Manpower cost data for the selected projectDate:",
        equipmentData
      );
    } catch (error) {
      console.error("Error fetching manpower cost data:", error);
    }
  };

  useEffect(() => {
    if (projectId) {
      // Get the initial selected projectDate from the thirdTableData (selected tab's date)
      const initialProjectDate = thirdTableData[valueTab]?.dateInstalled;

      // Fetch the manpower cost data for the initial selected projectDate
      fetchManpowerCostData(projectId, initialProjectDate);
    }
  }, [projectId, thirdTableData, valueTab]);

  const saveTabToLocalStorage = (selectedIndex) => {
    try {
      localStorage.setItem("selectedTab", JSON.stringify(selectedIndex));
    } catch (err) {
      console.error("Error saving selected tab to localStorage:", err);
    }
  };

  const handleChange = (event, newValue) => {
    setValueTab(newValue);
    saveTabToLocalStorage(newValue); // Save the selected tab to localStorage
  };

  useEffect(() => {
    // Load the saved selected tab from localStorage
    const savedSelectedTab = localStorage.getItem("selectedTab");
    const initialSelectedTab = savedSelectedTab
      ? JSON.parse(savedSelectedTab)
      : 0;

    // Set the initial selected tab
    setValueTab(initialSelectedTab);
  }, []);

  const calculateDailyCost = (equipmentAverage, mancostTotal) => {
    const equipmentContractSum = equipmentAverage;
    const dailyCost = equipmentContractSum - mancostTotal;
    return dailyCost;
  };
  useEffect(() => {
    // Calculate and set the equipment cost value when contract cost or equipment average changes
    if (thirdTableData[valueTab]?.overAllTotalCost) {
      const equipmentCostValue = thirdTableData[valueTab]?.overAllTotalCost;
      setEquipmentCost(equipmentCostValue);
    }
  }, [thirdTableData, valueTab]);

  const uniqueFormattedDates = useMemo(() => {
    const uniqueDates = [
      ...new Set(thirdTableData.map((row) => formatDate(row.dateInstalled))),
    ];
    return uniqueDates;
  }, [thirdTableData]);

  useEffect(() => {
    // Calculate daily cost data for the line chart
    const dailyCostData = uniqueFormattedDates.map((date) => {
      const dailyCost = calculateDailyCost(
        thirdTableData.find((row) => formatDate(row.dateInstalled) === date)
          ?.overAllTotalCost || 0,

        lastTableData?.costingTable?.find(
          (item) => formatDate(item.projectDate) === date
        )?.grandTotalCost || 0
      );
      return { date, cost: dailyCost };
    });

    // Extract dates and costs for the line chart
    const chartLabels = dailyCostData.map((data) => data.date);
    const chartDataPoints = dailyCostData.map((data) => data.cost);
    // Compute the total daily cost
    const totalDailyCost = dailyCostData.reduce(
      (total, data) => total + data.cost,
      0
    );

    // Update the chart data state
    setChartData({
      labels: chartLabels,
      datasets: [
        {
          label: totalDailyCost,
          backgroundColor: "rgb(255, 99, 132)",
          borderColor: "rgb(255, 99, 132)",
          data: chartDataPoints,
        },
      ],
    });
    setTotalDailyCost(totalDailyCost);
  }, [thirdTableData, lastTableData, uniqueFormattedDates]);

  const data = {
    labels: chartData.labels || [],
    datasets: [
      {
        label: "Daily Cost",
        backgroundColor: "rgb(255, 99, 132)",
        borderColor: "rgb(255, 99, 132)",
        data: chartData.datasets?.[0]?.data || [],
      },
      {
        label: `as of today ₱ ${formatNumberManCost(totalDailyCost)}`,
        backgroundColor: "rgb(54, 162, 235)",
        borderColor: "rgb(54, 162, 235)",
      },
    ],
  };

  const saveStateToLocalStorage = (state) => {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem("tableState", serializedState);
    } catch (err) {
      console.error("Error saving state to localStorage:", err);
    }
  };

  const handleShowManpowerCostTable = () => {
    setShowManpowerCostTable(true);
    setShowToolsUsedTable(false);
    setShowEquipmentInstalledTable(false);
    setShowAllTables(false); // If you want to reset "View All" state
    saveStateToLocalStorage("manpowerCost");
  };

  const handleShowToolsUsedTable = () => {
    setShowManpowerCostTable(false);
    setShowToolsUsedTable(true);
    setShowEquipmentInstalledTable(false);
    setShowAllTables(false); // If you want to reset "View All" state
    saveStateToLocalStorage("toolsUsed");
  };

  const handleShowEquipmentInstalledTable = () => {
    setShowManpowerCostTable(false);
    setShowToolsUsedTable(false);
    setShowEquipmentInstalledTable(true);
    setShowAllTables(false); // If you want to reset "View All" state
    saveStateToLocalStorage("equipmentInstalled");
  };

  const handleViewAllTables = () => {
    setShowManpowerCostTable(true);
    setShowToolsUsedTable(true);
    setShowEquipmentInstalledTable(true);
    setShowAllTables(true);
    saveStateToLocalStorage("viewAll");
  };
  useEffect(() => {
    // Load the saved state from localStorage
    const savedState = localStorage.getItem("tableState");
    const initialState = savedState ? JSON.parse(savedState) : null;

    if (initialState === "manpowerCost") {
      handleShowManpowerCostTable();
    } else if (initialState === "toolsUsed") {
      handleShowToolsUsedTable();
    } else if (initialState === "equipmentInstalled") {
      handleShowEquipmentInstalledTable();
    } else {
      handleViewAllTables();
    }
  }, []);
  const handleRowClicks = (itemIndex) => {
    setOpenRowIndex((prevIndex) =>
      prevIndex === itemIndex ? null : itemIndex
    );
  };
  const selectedWorkDateData = secondTableData.filter(
    (item) =>
      formatDate(item.workDate) ===
      formatDate(thirdTableData[valueTab]?.dateInstalled)
  );
  const handleSearchChange = (event) => {
    setSearchDate(event.target.value);
  };

  const handleGoBack = () => {
    window.history.back();
  };
  const handleRowClick = (itemIndex) => {
    setOpenRowIndexs((prevExpandedRow) =>
      prevExpandedRow === itemIndex ? null : itemIndex
    );
  };

  return (
    <div>
      <div className="container-admin">
        <section className="section-admin">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controller">Daily Costing: {name}</div>
        </section>
        <section className="section-back" onClick={handleGoBack}>
          <FiArrowLeft />
          <div className="back">BACK</div>
        </section>
      </div>
      <div className="graph-daily-proj-daily">
        <Line data={data} />
      </div>

      <div className="equipmentInstall-update-button-daily">
        <div className="daily-container-info">
          <div className="daily-container-sub-info">
            Project Name: <div className="daily-info-sub">{name}</div>
          </div>
          <div className="daily-container-sub-info">
            Site Name: <div className="daily-info-sub">{location}</div>
          </div>

          {lastTableData?.costingTable?.map((costingItem, index) => (
            <React.Fragment key={index}>
              {formatDate(costingItem.projectDate) ===
                formatDate(selectedProjectDate) && (
                <>
                  <div className="daily-container-sub-info">
                    Date:{" "}
                    <div className="daily-info-sub">
                      {formatDate(costingItem?.projectDate)}
                    </div>
                  </div>
                  <div className="daily-container-sub-info">
                    Activity:{" "}
                    <div className="daily-container-sub-infos">
                      <div className="daily-info-sub">
                        {costingItem?.projectActivity}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="daily-accomplish-tabs-title">
          <div className="Project-details">SEE ACTIVITIES BY DATE</div>
          <Box
            sx={{
              maxWidth: { xs: 320, sm: 480 },
              bgcolor: "background.paper",
              boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;",
              padding: "2px",
              marginTop: "10px",
              minWidth: { xs: 320, sm: 480 },
              border: "1px solid #146C94",
              borderRadius: "6px",
              marginLeft: "10px",
            }}>
            <Tabs
              value={valueTab}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="scrollable auto tabs example">
              {thirdTableData
                .slice()
                .sort(
                  (a, b) =>
                    new Date(a.dateInstalled) - new Date(b.dateInstalled)
                )
                .map((row, index) => {
                  const filteredIndexes = thirdTableData;
                  const filteredLastTableData = filteredIndexes.map(
                    (i) => lastTableData?.costingTable?.[i]?.projectDate
                  );
                  const filteredSecondTableData = filteredIndexes.map(
                    (i) => secondTableData[i]?.workDate
                  );

                  const projectDate = filteredLastTableData[index];
                  const formattedProjectDate = projectDate
                    ? formatDate(projectDate)
                    : null;

                  const formattedDateInstalled = formatDate(
                    row.dateInstalled || null
                  );

                  const toolsDate = filteredSecondTableData[index];
                  const formattedWorkDate = formatDate(toolsDate || null);

                  // Check if all dates match (projectDate, dateInstalled, and workDate)
                  const areDatesEqual =
                    formattedProjectDate === formattedDateInstalled &&
                    formattedProjectDate === formattedWorkDate;

                  // Display the matched date in the label if all dates are available
                  const label = areDatesEqual
                    ? `${
                        formattedProjectDate ||
                        formattedDateInstalled ||
                        formattedWorkDate
                      }`
                    : formattedProjectDate ||
                      formattedDateInstalled ||
                      formattedWorkDate ||
                      "Date not available";

                  return <Tab key={index} label={label} />;
                })}
            </Tabs>
          </Box>
        </div>
      </div>
      <div className="daily-accomplish-tables-info">
        <div className="daily-accomplish-side-info">
          {/*<div className="see-activities-daily-accom">ENTER CONTRACT COST</div>
          <div className="daily-accomplish-data-box">
            <div className="contract-cost-container">
              <input
                type="number"
                placeholder="Enter Contract Cost"
                className="contract-cost-input"
                value={contractCost}
                onChange={(e) => setContractCost(e.target.value)}
              />
            </div>
              </div>*/}
          <div className="see-activities-daily-accom">SEE ACTIVITIES</div>

          <div
            className="daily-mini-container"
            onClick={handleShowManpowerCostTable}>
            <FaPeopleCarry className="Fapeoplecarry-daily-acc" />
            Manpower cost
          </div>

          <div
            className="daily-mini-container-1"
            onClick={handleShowToolsUsedTable}>
            <FaTools className="Fapeoplecarry-daily-acc-1" />
            Tools Used
          </div>
          <div
            className="daily-mini-container-2"
            onClick={handleShowEquipmentInstalledTable}>
            <AiFillControl className="Fapeoplecarry-daily-acc-2" />
            Equipment
          </div>
          <div className="daily-mini-container-3" onClick={handleViewAllTables}>
            <AiFillContainer className="Fapeoplecarry-daily-acc-3" />
            View All
          </div>
          <div className="see-activities-daily-accom">DAILY COST </div>
          <div className="daily-values">
            {/*<div className="equipment-aveg-daily">
              EQUIPMENT AVERAGE:{" "}
              <b className="daily-accom-values">
                <div>{thirdTableData[valueTab]?.overAllTotalCost}</div>
              </b>
              </div>*/}
            <div className="equipment-aveg-daily">
              EQUIPMENT COST:{" "}
              <b className="daily-accom-values">
                &#x20B1;{" "}
                {formatNumberManCost(
                  thirdTableData[valueTab]?.overAllTotalCost
                )}
              </b>{" "}
            </div>
            <div className="equipment-aveg-daily">
              MANCOST TOTAL:
              <b className="daily-accom-values">
                {lastTableData?.costingTable?.map((costingItem, index) => (
                  <React.Fragment key={index}>
                    {formatDate(costingItem.projectDate) ===
                      formatDate(selectedProjectDate) && (
                      <div>
                        {" "}
                        &#x20B1;{" "}
                        {formatNumberManCost(costingItem?.grandTotalCost)}
                      </div>
                    )}
                  </React.Fragment>
                ))}{" "}
              </b>
            </div>

            <div className="equipment-aveg-daily">
              DAILY COST:{" "}
              <b className="daily-accom-values">
                &#x20B1;{" "}
                {formatNumber(
                  calculateDailyCost(
                    thirdTableData[valueTab]?.overAllTotalCost || 0,

                    lastTableData?.costingTable?.find(
                      (item) =>
                        formatDate(item.projectDate) ===
                        formatDate(selectedProjectDate)
                    )?.grandTotalCost || 0
                  )
                )}
              </b>
              <div className="asof-daily">
                {formatDate(selectedProjectDate)}
              </div>
            </div>
          </div>
        </div>

        <div>
          {showManpowerCostTable && (
            <div>
              {/*Last Table*/}

              <TableContainer component={Paper}>
                <div className="title-table-daily">
                  Manpower Cost For {formatDate(selectedProjectDate)}
                </div>
                <Table
                  sx={{ minWidth: 918 }}
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
                    {lastTableData?.costingTable?.map((costingItem, index) => (
                      <React.Fragment key={index}>
                        {formatDate(costingItem.projectDate) ===
                          formatDate(selectedProjectDate) && (
                          <>
                            {costingItem.mancostTable?.map((row, rowIndex) => (
                              <TableRow hover key={rowIndex}>
                                <TableCell>{row?.ManName}</TableCell>
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
                          </>
                        )}
                      </React.Fragment>
                    ))}
                    {lastTableData?.costingTable?.map((costingItem, index) => (
                      <React.Fragment key={index}>
                        {formatDate(costingItem.projectDate) ===
                          formatDate(selectedProjectDate) && (
                          <>
                            <TableRow hover>
                              <TableCell>
                                <b>Admin Cost</b>
                              </TableCell>
                              <TableCell colSpan={1}></TableCell>
                              <TableCell>{costingItem?.adminCostREG}</TableCell>
                              <TableCell colSpan={5}></TableCell>
                              <TableCell>
                                {costingItem?.adminCostTotal}
                              </TableCell>
                            </TableRow>
                            <TableRow hover>
                              <TableCell>
                                <b>Total</b>
                              </TableCell>
                              <TableCell>
                                {costingItem?.totalManpowerNum}
                              </TableCell>
                              <TableCell>{costingItem?.totalRegTime}</TableCell>
                              <TableCell>
                                {costingItem?.totalOvertime}
                              </TableCell>
                              <TableCell>
                                {costingItem?.totalNightDiff}
                              </TableCell>
                              <TableCell>{costingItem?.totalRestDay}</TableCell>
                              <TableCell>
                                {costingItem?.totalRestDayOT}
                              </TableCell>
                              <TableCell>
                                {costingItem?.totalRegHoliday}
                              </TableCell>
                              <TableCell>{costingItem?.partialTotal}</TableCell>
                            </TableRow>
                            <TableRow hover>
                              <TableCell>
                                <b>Total Cost</b>
                              </TableCell>
                              <TableCell colSpan={7}></TableCell>
                              <TableCell>
                                &#x20B1; {costingItem?.grandTotalCost}
                              </TableCell>
                            </TableRow>
                            <TableRow hover>
                              <TableCell colSpan={9}>
                                <b>Total Personnel:</b>{" "}
                                {costingItem?.totalPersonnel} person/s
                              </TableCell>
                            </TableRow>
                          </>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 100]}
                  style={{ position: "sticky", top: 0 }}
                  component="div"
                  count={lastTableData?.mancostTable?.length || 0}
                  rowsPerPage={rowsPerPage}
                  page={page}
                />
              </TableContainer>
            </div>
          )}
          <div>
            {showToolsUsedTable && (
              <div>
                {/* Second table */}
                <TableContainer component={Paper} style={{ marginTop: "20px" }}>
                  <div className="title-table-daily">
                    Tools Used For {formatDate(selectedProjectDate)}
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
                            <b>See Details</b>
                          </TableCell>
                          <TableCell>
                            <b>Tools Name</b>
                          </TableCell>
                          <TableCell>
                            <b>Tool Tag/Serial Number</b>
                          </TableCell>

                          <TableCell>
                            <b>Personnel In-charge</b>
                          </TableCell>
                          <TableCell>
                            <b>Start Time</b>
                          </TableCell>
                          <TableCell>
                            <b>End Time</b>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedWorkDateData.length > 0 ? (
                          selectedWorkDateData.map((item, itemIndex) => (
                            <React.Fragment key={itemIndex}>
                              <TableRow
                                onClick={() => handleRowClick(itemIndex)}>
                                <TableCell>
                                  {openRowIndexs === itemIndex ? (
                                    <BsArrowDownShort className="icons-equip" />
                                  ) : (
                                    <BsArrowUpShort className="icons-equip" />
                                  )}
                                </TableCell>
                                <TableCell>{item.ToolsItemName}</TableCell>
                                <TableCell>{item.ToolsSN}</TableCell>

                                <TableCell>{item.ToolsInCharge}</TableCell>
                                <TableCell>
                                  {convertToStandardTime(item.ToolsStart)}
                                </TableCell>
                                <TableCell>
                                  {convertToStandardTime(item.ToolsEnd)}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell
                                  style={{ paddingBottom: 0, paddingTop: 0 }}
                                  colSpan={7}>
                                  <Collapse
                                    in={openRowIndexs === itemIndex}
                                    timeout="auto"
                                    unmountOnExit>
                                    <Box margin={1}>
                                      <Typography gutterBottom component="div">
                                        Tool Detail for{" "}
                                        <b>{item.ToolsItemName}</b>
                                      </Typography>
                                      <div className="collapse-detail">
                                        {item.ToolsRemarks}
                                      </div>
                                    </Box>
                                  </Collapse>
                                </TableCell>
                              </TableRow>
                            </React.Fragment>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7}>No data available</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <TablePagination
                    style={{ position: "sticky", top: 0 }}
                    component="div"
                    count={secondTableData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                  />
                </TableContainer>
              </div>
            )}
            {showEquipmentInstalledTable && (
              <div>
                {/*First Table*/}
                <TableContainer component={Paper} style={{ marginTop: "20px" }}>
                  <div className="title-table-daily">
                    Equipment Installed For {formatDate(selectedProjectDate)}
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
                      {thirdTableData[valueTab]?.equipItemTable
                        .filter((item) => item.actualInstalled !== 0) // Filter items with non-zero actualInstalled value
                        .map((item, itemIndex) => (
                          <React.Fragment key={itemIndex}>
                            <TableRow
                              onClick={() => handleRowClicks(itemIndex)}>
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
                              {/*<TableCell>
                                {thirdTableData[valueTab]?.dateInstalled}
                              </TableCell>*/}
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
                                    <div className="collapse-detail">
                                      {item.comment}
                                    </div>
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
                    count={thirdTableData[valueTab]?.equipItemTable.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                  />
                </TableContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailyAccomplish;

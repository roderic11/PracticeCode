import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
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
import axios from "axios";
import Chart from "chart.js/auto";

const ProjectStatus = () => {
  const { id, name, projectId, location } = useLocation().state || {};
  const chartRef = useRef(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projectTotal, setProjectTotal] = useState(0);
  const [existingCategories, setExistingCategories] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [existingSubCategories, setExistingSubCategories] = useState([
    { subCategory: "" },
  ]);
  const navigate = useNavigate();
  const [weightPercentage, setWeightValues] = useState({});
  const [arbitraryValues, setArbitraryValues] = useState({});
  const [categoryArbitraryValues, setCategoryArbitraryValues] = useState({});
  const [categoryMainArbitraryValues, setCategoryMainArbitraryValues] =
    useState({});
  const [thirdTableData, setThirdTableData] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [finalScopeTotal, setFinalScopeTotal] = useState(0); // Added state for finalScopeTotal
  const [chartData, setChartData] = useState({});
  const [weightAndArbitraryValues, setWeightAndArbitraryValues] = useState({});

  const fetchWeightPercentageData = async () => {
    try {
      const response = await axios.get(
        `/api/projectStatus?projectId=${projectId}`
      );
      const existingProjectStatus = response.data.find(
        (projectStatus) => projectStatus.projectId === projectId
      );

      if (existingProjectStatus) {
        const weightPercentageData = {};
        const categoryArbitraryValuesData = {};
        const categoryMainArbitraryValuesData = {}; // Separate variable for categoryMainArbitraryValuesData

        existingProjectStatus.statusTable.forEach((statusItem) => {
          const {
            category,
            subCategory,
            weightPercentage,
            product,
            subCategoryArbitraryValue,
            categoryArbitrary,
          } = statusItem;

          if (!weightPercentageData[subCategory]) {
            weightPercentageData[subCategory] = {};
          }
          if (!weightPercentageData[subCategory][category]) {
            weightPercentageData[subCategory][category] = {};
          }
          weightPercentageData[subCategory][category][product] =
            weightPercentage;

          if (!categoryArbitraryValuesData[category]) {
            categoryArbitraryValuesData[category] = {};
          }
          categoryArbitraryValuesData[category][subCategory] =
            subCategoryArbitraryValue;

          // Set categoryArbitrary in categoryMainArbitraryValuesData
          if (!categoryMainArbitraryValuesData[category]) {
            categoryMainArbitraryValuesData[category] = {};
          }
          categoryMainArbitraryValuesData[category][subCategory] =
            categoryArbitrary;
        });

        setWeightValues(weightPercentageData);
        setCategoryArbitraryValues(categoryArbitraryValuesData);
        setCategoryMainArbitraryValues(categoryMainArbitraryValuesData); // Set the categoryArbitrary in categoryMainArbitraryValues
      }
    } catch (error) {
      console.error("Error fetching weightPercentage data:", error);
    }
  };

  useEffect(() => {
    fetchWeightPercentageData();
  }, [projectId]);

  const generateChart = () => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");

      // Destroy the existing chart instance if it exists
      if (chartRef.current.chart) {
        chartRef.current.chart.destroy();
      }

      // Create a new bar chart instance
      chartRef.current.chart = new Chart(ctx, {
        type: "bar",
        data: chartData,
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
          responsive: true,
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const index = elements[0].index;
              const categoryId = chartData.id[index];
              if (categoryId) {
                const element = document.getElementById(categoryId);
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }
            }
          },
        },
      });
    }
  };

  useEffect(() => {
    // Calculate chart data based on handleFinalTotal for each category and subcategory
    const uniqueCategories = new Set(existingCategories);

    // Map over uniqueCategories to get the total value for each category using handleFinalTotal
    const data = [...uniqueCategories].map((category) => {
      const subCategories = existingSubCategories.filter(
        (subCategoryGroup) => subCategoryGroup.category === category
      );
      return handleFinalTotal({ category, subCategories });
    });
    const chartData = {
      labels: [...uniqueCategories].map((category) => `${category} Total`),
      id: [...uniqueCategories].map((category) => `category-${category}`), // Fix the labels array
      datasets: [
        {
          label: "Final Total",
          data: data,
          backgroundColor: "rgba(75,192,192,0.4)",
          borderColor: "rgba(75,192,192,1)",
          borderWidth: 1,
        },
      ],
    };

    setChartData(chartData);
    generateChart(); // Call the generateChart function after updating the chartData
  }, [
    existingCategories,
    existingSubCategories,
    weightPercentage,
    categoryMainArbitraryValues,
  ]);

  useEffect(() => {
    generateChart();
  }, [
    chartData, // Add chartData to the dependency array of this useEffect
  ]);
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`/api/projects/${id}`);
        const itemsData = response.data;
        setItems(itemsData);

        // Group items by categories and sub-categories
        const categories = itemsData.map((item) => item.category);
        const subCategories = itemsData.map((item) => ({
          category: item.category,
          subCategory: item.subCategory,
        }));

        // Remove duplicates from subCategories
        const uniqueSubCategories = subCategories.filter(
          (item, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                t.category === item.category &&
                t.subCategory === item.subCategory
            )
        );

        setExistingCategories(categories);
        setExistingSubCategories(uniqueSubCategories);

        setLoading(false);
      } catch (error) {
        console.error(error);
        setError("Error fetching project details.");
        setLoading(false);
      }
    };

    fetchItems();
  }, [id]);

  // Fetch equipment installed data based on the projectId
  const fetchEquipmentInstalledData = async (projectId) => {
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
            dateInstalled: item.dateInstalled,
            actualInstalled: item.actualInstalled,
            ItemName: item.ItemName,
          })
        );
        console.log("Formatted Equipment Table:", formattedEquipmentTable);
        return formattedEquipmentTable;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error fetching equipment installed data:", error);
      return [];
    }
  };

  const saveDataToDatabase = async () => {
    try {
      const response = await axios.get(
        `/api/projectStatus?projectId=${projectId}`
      );
      const existingProjectStatus = response.data.find(
        (projectStatus) => projectStatus.projectId === projectId
      );

      // Create an object to store the status items based on the product
      const statusItemsByProduct = {};

      items.forEach((item, itemIndex) => {
        const category = item.category;
        const subCategory = item.subCategory;
        const product = item.product;

        const totalActualInstalled = thirdTableData
          .filter((thirdItem) =>
            thirdItem.equipItemTable.some(
              (subItem) =>
                subItem.ItemName === product && subItem.category === category
            )
          )
          .reduce((sum, thirdItem) => {
            const matchingSubItem = thirdItem.equipItemTable.find(
              (subItem) =>
                subItem.ItemName === product && subItem.category === category
            );
            const actualInstalled = matchingSubItem
              ? matchingSubItem.actualInstalled
              : 0;
            return sum + actualInstalled;
          }, 0);
        const categoryGroup = {
          category: category,
          subCategories: existingSubCategories.filter(
            (subCategoryGroup) => subCategoryGroup.category === category
          ),
        };

        const handleFinalTotalValue = handleFinalTotal(categoryGroup);
        const categoryData = {
          calculateScopeTotal: calculateScopeTotal(
            existingSubCategories
              .filter(
                (subCategoryGroup) => subCategoryGroup.category === category
              )
              .map((subCategoryGroup) => subCategoryGroup.subCategory),
            category
          ),
          handleFinalTotal: handleFinalTotalValue,
          categoryArbitrary:
            categoryMainArbitraryValues?.[category]?.[subCategory] || 0,
        };

        const statusItem = {
          category: category,
          subCategory: subCategory,
          product: product,
          unit: item.unit,
          fixedQuantity: item.fixedQuantity,
          actualInstalled: totalActualInstalled,
          itemCompletion: calculateItemCompletion(item),
          weightPercentage:
            weightPercentage[subCategory]?.[category]?.[item.product] || 0,
          overallCompletion: calculateOverallCompletion(
            item,
            weightPercentage[subCategory]?.[category]?.[itemIndex] || 0
          ),
          totalWeightPercentage: TotalWeightPercentage(category, subCategory),
          totalOverallCompletion: TotalOverallCompletion(category, subCategory),
          subCategoryArbitraryValue:
            categoryArbitraryValues[category]?.[subCategory] || 0,
          calculatedSubCategory: calculatedSubCategory(category, subCategory),
          ...categoryData,
        };

        if (!statusItemsByProduct[product]) {
          statusItemsByProduct[product] = [statusItem];
        } else {
          statusItemsByProduct[product].push(statusItem);
        }
      });

      // Convert the statusItemsByProduct object into an array to match the statusTable structure
      const statusTable = Object.values(statusItemsByProduct).flat();

      const newData = {
        projectId: projectId,
        projectName: name,
        siteName: location,
        statusTable: statusTable,
      };

      if (existingProjectStatus) {
        // If the project status data already exists, update it
        const updatedProjectStatus = {
          ...existingProjectStatus,
          statusTable: statusTable,
        };

        await axios.put(
          `/api/projectStatus/${existingProjectStatus._id}`,
          updatedProjectStatus
        );
        toast.success("Successfully Saved");
        fetchWeightPercentageData();
      } else {
        // If the project status data doesn't exist, create a new record
        await axios.post("/api/projectStatus", newData);
        toast.success("Successfully Saved");
        fetchWeightPercentageData();
      }

      setIsSaved(true); // Set the saved status to true
    } catch (error) {
      console.error(error);
      // Handle the error appropriately
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (projectId) {
        const equipmentTable = await fetchEquipmentInstalledData(projectId);
        setThirdTableData(equipmentTable);
      }
    };

    fetchData();
  }, [projectId]);

  useEffect(() => {
    const productOptions = items.map((item) => item.product);
    setProductOptions(productOptions);
  }, [items]);

  useEffect(() => {
    const scopeTotal = calculateScopeTotal(
      existingSubCategories.map((subCategory) => subCategory.subCategory)
    );
    setFinalScopeTotal(scopeTotal);
  }, [existingSubCategories, arbitraryValues]);

  const handleGoBack = () => {
    window.history.back();
  };

  const handleCosting = () => {
    navigate(`/MaterialCosting/${id}/${projectId}/${name}`);
    // Use navigate to go to the "/costing" route
  };

  const calculateItemCompletion = (item) => {
    const totalActualInstalled = thirdTableData
      .filter((thirdItem) =>
        thirdItem.equipItemTable.some(
          (subItem) =>
            subItem.ItemName === item.product &&
            subItem.category === item.category
        )
      )
      .reduce((sum, thirdItem) => {
        const matchingSubItem = thirdItem.equipItemTable.find(
          (subItem) =>
            subItem.ItemName === item.product &&
            subItem.category === item.category
        );
        const actualInstalled = matchingSubItem
          ? matchingSubItem.actualInstalled
          : 0;
        return actualInstalled;
      }, 0);
    if (item.fixedQuantity !== 0) {
      const itemCompletion = (totalActualInstalled * 100) / item.fixedQuantity;
      return itemCompletion.toFixed(2);
    }
    return "0.00";
  };

  const calculateOverallCompletion = (item, weightPercentage) => {
    const itemCompletion = parseFloat(calculateItemCompletion(item));
    return ((itemCompletion * parseFloat(weightPercentage)) / 100).toFixed(2);
  };

  const TotalOverallCompletion = (category, subCategory) => {
    const subCategoryItems = items.filter(
      (item) => item.category === category && item.subCategory === subCategory
    );
    const overallCompletions = subCategoryItems.map((item) =>
      calculateOverallCompletion(
        item,
        weightPercentage[subCategory]?.[category]?.[item.product] || 0 // Access weight value using item.product
      )
    );

    const totalOverallCompletion = overallCompletions.reduce(
      (sum, completion) => sum + parseFloat(completion),
      0
    );
    return totalOverallCompletion.toFixed(2);
  };

  const TotalWeightPercentage = (category, subCategory) => {
    const totalWeightPercentage = existingSubCategories
      .filter(
        (subCat) =>
          subCat.category === category && subCat.subCategory === subCategory
      )
      .map((subCat) => {
        const subCategoryItems = items.filter(
          (item) =>
            item.category === subCat.category &&
            item.subCategory === subCat.subCategory
        );
        const subCategoryWeightValues = subCategoryItems.map(
          (item) =>
            weightPercentage[subCat.subCategory]?.[subCat.category]?.[
              item.product
            ] || 0 // Access weight value using item.product
        );

        const subCategoryTotal = subCategoryWeightValues.reduce(
          (subSum, value) => subSum + parseFloat(value || 0),
          0
        );

        return subCategoryTotal;
      })
      .reduce((sum, subCategoryTotal) => sum + subCategoryTotal, 0);

    return totalWeightPercentage.toFixed(2);
  };

  const handleArbitraryValueChange = (event, category, subCategory) => {
    const value = event.target.value;
    setCategoryArbitraryValues((prevArbitraryValues) => {
      const updatedCategoryArbitrary = {
        ...prevArbitraryValues,
        [category]: {
          ...prevArbitraryValues[category],
          [subCategory]: value,
        },
      };
      return updatedCategoryArbitrary;
    });
  };

  const handleCategoryArbitrary = (event, category, subCategory) => {
    const value = event.target.value;
    setCategoryMainArbitraryValues((prevValues) => ({
      ...prevValues,
      [category]: {
        ...(prevValues[category] || {}),
        [subCategory]: value,
      },
    }));
  };

  // Modify the categoryGroup object to contain only subcategory names
  const handleFinalTotal = (categoryGroup) => {
    if (!categoryGroup) return "0.000"; // Return a default value when undefined

    const { category, subCategories } = categoryGroup;
    const scopeTotal = calculateScopeTotal(
      subCategories.map((subCategoryGroup) => subCategoryGroup.subCategory),
      category
    );

    const arbitraryValue =
      categoryMainArbitraryValues[category]?.[subCategories[0]?.subCategory] ||
      0;
    const finalTotal = (scopeTotal * arbitraryValue) / 100;

    return finalTotal.toFixed(3);
  };
  const handleWeightvalue = (event, category, subCategory, productName) => {
    const { value } = event.target;

    setWeightValues((prevWeightValues) => ({
      ...prevWeightValues,
      [subCategory]: {
        ...(prevWeightValues[subCategory] || {}),
        [category]: {
          ...(prevWeightValues[subCategory]?.[category] || {}),
          [productName]: value,
        },
      },
    }));
  };
  const calculatedSubCategory = (category, subCategory) => {
    const arbitraryValue =
      categoryArbitraryValues[category]?.[subCategory] || 0;
    const totalOverallCompletion = TotalOverallCompletion(
      category,
      subCategory
    );

    if (isNaN(arbitraryValue) || isNaN(totalOverallCompletion)) {
      return "0.000"; // Return a default value of 0 if any value is NaN
    }

    const calculatedValue = (arbitraryValue * totalOverallCompletion) / 100;
    return calculatedValue.toFixed(3);
  };

  const calculateScopeTotal = (subCategoryList, category) => {
    const filteredSubCategories = subCategoryList.filter((subCategory) =>
      categoryArbitraryValues[category]?.hasOwnProperty(subCategory)
    );
    if (filteredSubCategories.length > 0) {
      const scopeTotalValue = filteredSubCategories.reduce(
        (sum, subCategory) => {
          const calculatedValue = parseFloat(
            calculatedSubCategory(category, subCategory)
          );
          return sum + calculatedValue;
        },
        0
      );

      return scopeTotalValue.toFixed(2);
    }
    return 0;
  };
  const handleCategoryClick = (category) => {
    const element = document.getElementById(`category-${category}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };
  useEffect(() => {
    const total = calculateProjectTotal();
    setProjectTotal(total);
  }, [
    existingCategories,
    existingSubCategories,
    weightPercentage,
    categoryMainArbitraryValues,
  ]);
  const calculateProjectTotal = () => {
    const uniqueCategories = new Set(existingCategories);
    const projectTotal = [...uniqueCategories].reduce((total, category) => {
      const subCategories = existingSubCategories.filter(
        (subCategoryGroup) => subCategoryGroup.category === category
      );
      const categoryTotal = handleFinalTotal({ category, subCategories });
      return Number(total) + Number(categoryTotal);
    }, 0);

    return projectTotal;
  };

  return (
    <div>
      <div className="container-admin">
        <section className="section-admin">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controller">Project Status: {name}</div>
        </section>
        <section className="section-back" onClick={handleGoBack}>
          <FiArrowLeft />
          <div className="back">BACK</div>
        </section>
      </div>
      <div className="graph-info-container">
        <div className="graph-info-subcontainer">
          <div className="overall-completion-project">
            Overall Completion
            <div className="category-project-info">
              Project Total:{" "}
              <div className="category-project-subinfo">
                {parseFloat(projectTotal).toFixed(2)}
              </div>
            </div>
          </div>
          <div className="horizontal-line"></div>
          <div className="scrollable-container">
            <div className="margin-right-projstatus">
              {items
                .reduce((acc, item, index) => {
                  const categoryIndex = acc.findIndex(
                    (group) => group.category === item.category
                  );
                  const subCategoryIndex =
                    categoryIndex > -1
                      ? acc[categoryIndex].subCategories.findIndex(
                          (subGroup) =>
                            subGroup.subCategory === item.subCategory
                        )
                      : -1;

                  if (categoryIndex === -1) {
                    const newCategory = {
                      category: item.category,
                      subCategories: [
                        {
                          subCategory: item.subCategory,
                          items: [item],
                        },
                      ],
                    };
                    acc.push(newCategory);
                  } else {
                    if (subCategoryIndex === -1) {
                      acc[categoryIndex].subCategories.push({
                        subCategory: item.subCategory,
                        items: [item],
                      });
                    } else {
                      acc[categoryIndex].subCategories[
                        subCategoryIndex
                      ].items.push(item);
                    }
                  }

                  return acc;
                }, [])
                .map((categoryGroup) => (
                  <React.Fragment key={categoryGroup.category}>
                    {categoryGroup.category && (
                      <>
                        <div
                          className="category-project-status"
                          onClick={() =>
                            handleCategoryClick(categoryGroup.category)
                          }>
                          <b>Category: </b>
                          {categoryGroup.category}{" "}
                        </div>
                        {categoryGroup.category && (
                          <div className="horizontal-line"></div>
                        )}
                        <div className="computation-container-proj">
                          <div className="category-project-info">
                            Scope Total:{" "}
                            <div className="category-project-subinfo">
                              {calculateScopeTotal(
                                categoryGroup.subCategories.map(
                                  (subCategoryGroup) =>
                                    subCategoryGroup.subCategory
                                ),
                                categoryGroup.category
                              )}
                              %
                            </div>
                          </div>
                          <div className="category-project-info">
                            Final Total:{" "}
                            <div className="category-project-subinfo">
                              {handleFinalTotal(categoryGroup)}{" "}
                            </div>
                          </div>
                        </div>
                        {categoryGroup.category && (
                          <div className="horizontal-line"></div>
                        )}
                      </>
                    )}
                  </React.Fragment>
                ))}
            </div>
          </div>
        </div>
        <div className="graph-daily-proj">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableBody>
            {items
              .reduce((acc, item, index) => {
                const categoryIndex = acc.findIndex(
                  (group) => group.category === item.category
                );
                const subCategoryIndex =
                  categoryIndex > -1
                    ? acc[categoryIndex].subCategories.findIndex(
                        (subGroup) => subGroup.subCategory === item.subCategory
                      )
                    : -1;

                if (categoryIndex === -1) {
                  const newCategory = {
                    category: item.category,
                    subCategories: [
                      {
                        subCategory: item.subCategory,
                        items: [item],
                      },
                    ],
                  };
                  acc.push(newCategory);
                } else {
                  if (subCategoryIndex === -1) {
                    acc[categoryIndex].subCategories.push({
                      subCategory: item.subCategory,
                      items: [item],
                    });
                  } else {
                    acc[categoryIndex].subCategories[
                      subCategoryIndex
                    ].items.push(item);
                  }
                }

                return acc;
              }, [])
              .map((categoryGroup) => (
                <React.Fragment key={categoryGroup.category}>
                  <TableRow id={`category-${categoryGroup.category}`}>
                    <TableCell
                      style={{ backgroundColor: "#146C94", color: "white" }}>
                      <strong>Category</strong>
                    </TableCell>
                    <TableCell
                      style={{ backgroundColor: "#146C94", color: "white" }}>
                      <strong>Scope Total</strong>
                    </TableCell>
                    <TableCell
                      style={{ backgroundColor: "#146C94", color: "white" }}>
                      <strong>Final Total</strong>
                    </TableCell>
                    <TableCell
                      style={{ backgroundColor: "#146C94", color: "white" }}>
                      <strong>Arbitrary Value</strong>
                    </TableCell>
                    <TableCell
                      colSpan={8}
                      style={{ backgroundColor: "#146C94", color: "white" }}>
                      <button
                        className="save-changes-proj"
                        onClick={saveDataToDatabase}>
                        Save Changes
                      </button>
                    </TableCell>
                  </TableRow>
                  {categoryGroup.category && (
                    <TableRow>
                      <TableCell>
                        <b>{categoryGroup.category}</b>
                      </TableCell>
                      <TableCell>
                        <div className="proj-computation-num1">
                          {calculateScopeTotal(
                            categoryGroup.subCategories.map(
                              (subCategoryGroup) => subCategoryGroup.subCategory
                            ),
                            categoryGroup.category
                          )}
                          %
                        </div>
                      </TableCell>

                      <TableCell>
                        {" "}
                        <div className="proj-computation-num1">
                          {handleFinalTotal(categoryGroup)}{" "}
                        </div>
                      </TableCell>

                      <TableCell colSpan={8}>
                        <div className="categ-project-status">
                          {categoryGroup.category}
                          <input
                            type="number"
                            value={
                              categoryMainArbitraryValues[
                                categoryGroup.category
                              ]?.[
                                categoryGroup.subCategories[0]?.subCategory
                              ] || ""
                            }
                            onChange={(event) =>
                              handleCategoryArbitrary(
                                event,
                                categoryGroup.category,
                                categoryGroup.subCategories[0]?.subCategory // Pass the subCategory to handleCategoryArbitrary
                              )
                            }
                            placeholder="Insert Arbitrary Value"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {categoryGroup.subCategories.map((subCategoryGroup) => {
                    if (!subCategoryGroup) return null; // Skip rendering if subCategoryGroup is undefined

                    const subCategory = subCategoryGroup.subCategory;
                    return (
                      <React.Fragment key={subCategory}>
                        {subCategory && (
                          <TableRow>
                            <TableCell colSpan={10}>
                              <h4>{subCategory}</h4>
                              <input
                                type="number"
                                value={
                                  categoryArbitraryValues[
                                    categoryGroup.category
                                  ]?.[subCategory] || ""
                                }
                                onChange={(event) =>
                                  handleArbitraryValueChange(
                                    event,
                                    categoryGroup.category,
                                    subCategory
                                  )
                                }
                                placeholder="Insert Arbitrary Value"
                              />

                              <TableCell>
                                <div className="proj-computation-num">
                                  Total Weight Percentage:{" "}
                                  {TotalWeightPercentage(
                                    categoryGroup.category,
                                    subCategory
                                  )}
                                  %
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="proj-computation-num">
                                  Total Overall Completion:{" "}
                                  {TotalOverallCompletion(
                                    categoryGroup.category,
                                    subCategory
                                  )}
                                  %
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="proj-computation-num">
                                  Calculated Sub category:{" "}
                                  {calculatedSubCategory(
                                    categoryGroup.category,
                                    subCategory
                                  )}
                                </div>
                              </TableCell>
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow>
                          <TableCell>
                            <b>Product</b>
                          </TableCell>
                          <TableCell>
                            <b>Unit</b>
                          </TableCell>
                          <TableCell>
                            <b>Quantity</b>
                          </TableCell>
                          <TableCell>
                            <b>Total Installed</b>
                          </TableCell>
                          <TableCell>
                            <b>Item Completion</b>
                          </TableCell>
                          <TableCell>
                            <b>Weight %</b>
                          </TableCell>
                          <TableCell>
                            <b>Overall Completion</b>
                          </TableCell>
                        </TableRow>

                        {subCategoryGroup.items.map((item, index) => {
                          const totalActualInstalled = thirdTableData
                            .filter((thirdItem) =>
                              thirdItem.equipItemTable.some(
                                (subItem) =>
                                  subItem.ItemName === item.product &&
                                  subItem.category === item.category
                              )
                            )
                            .reduce((sum, thirdItem) => {
                              const matchingSubItem =
                                thirdItem.equipItemTable.find(
                                  (subItem) =>
                                    subItem.ItemName === item.product &&
                                    subItem.category === item.category
                                );
                              const actualInstalled = matchingSubItem
                                ? matchingSubItem.actualInstalled
                                : 0;
                              return actualInstalled;
                            }, 0);

                          return (
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
                                {item.product}
                              </TableCell>
                              <TableCell>{item.unit}</TableCell>
                              <TableCell>{item.fixedQuantity}</TableCell>
                              <TableCell>{totalActualInstalled}</TableCell>
                              <TableCell>
                                {calculateItemCompletion(item)}%
                              </TableCell>
                              <TableCell>
                                <input
                                  className="mancost-input-number"
                                  type="number"
                                  value={
                                    weightPercentage[subCategory]?.[
                                      categoryGroup.category
                                    ]?.[item.product] || ""
                                  }
                                  onChange={(event) =>
                                    handleWeightvalue(
                                      event,
                                      categoryGroup.category,
                                      subCategory,
                                      item.product
                                    )
                                  }
                                  placeholder="weight"
                                />
                              </TableCell>
                              <TableCell>
                                {calculateOverallCompletion(
                                  item,
                                  weightPercentage[subCategory]?.[
                                    categoryGroup.category
                                  ]?.[item.product] || 0
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ProjectStatus;

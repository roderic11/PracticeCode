import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useSelector } from "react-redux";
import { BsFillBagCheckFill } from "react-icons/bs";
import {
  Modal,
  Backdrop,
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
  TablePagination,
  TableRow,
  TextField,
} from "@mui/material";
import axios from "axios";
import { AiFillCloseCircle } from "react-icons/ai";
import "./inventoryMain.css";
import { toast } from "react-toastify";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1150,
  height: 650,
  bgcolor: "background.paper",
  borderRadius: "10px",
  boxShadow: 24,
  padding: "20px",
};

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options);
};
function Sitetrans() {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState([]); // State to store the fetched data
  const [selectedSite, setSelectedSite] = useState(""); // State to store the selected siteName
  const [page, setPage] = useState(0); // Current page number
  const [rowsPerPage, setRowsPerPage] = useState(10); // Number of rows per page
  const [projectName, setProjectName] = useState(""); // State to store the selected projectName
  const [selectedItems, setSelectedItems] = useState([]); // State to store the selected items
  const [editItemId, setEditItemId] = useState(null); // State to store the ID of the item being edited
  const [searchTerm, setSearchTerm] = useState("");
  const [updatedQuantities, setUpdatedQuantities] = useState({});
  const [editedItemData, setEditedItemData] = useState({});
  const [quantityValidity, setQuantityValidity] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [openDeliveryModal, setOpenDeliveryModal] = useState(false);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deliveryData, setDeliveryData] = useState([]);
  const [selectedDeliveryData, setSelectedDeliveryData] = useState(null);
  const [selectedDeliveryInfo, setSelectedDeliveryInfo] = useState([]);
  const [selectedDeliveryTitle, setSelectedDeliveryTitle] = useState(null);

  const fetchDeliveryData = async () => {
    try {
      const response = await axios.get("/api/deliveries");
      const data = response.data;

      const filteredDeliveries = data.filter(
        (delivery) => delivery.place === "Cainta Main Warehouse"
      );

      const sortedDeliveries = filteredDeliveries.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      console.log("Delivery Data: ", sortedDeliveries);
      setDeliveryData(sortedDeliveries);
    } catch (error) {
      console.error("Error fetching delivery data:", error);
    }
  };

  useEffect(() => {
    fetchDeliveryData();
  }, []);

  const fetchStorageData = async () => {
    try {
      const response = await axios.get("api/storages");
      const data = response.data;
      const storages = data.map((storage) => ({
        id: storage._id,
        siteName: storage.siteName,
        siteTable: storage.siteTable,
        projectName: storage.projectName,
      }));
      setData(storages);
    } catch (error) {
      console.error("Error fetching storage data", error);
    }
  };
  useEffect(() => {
    fetchStorageData();
  }, []);

  // Pagination event handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Function to handle the edit button click and open the modal
  const handleEditButtonClick = (itemId) => {
    const selectedItemData = filteredData
      .flatMap((site) => site.siteTable)
      .find((item) => item.itemId === itemId);

    setEditItemId(itemId);
    setEditedItemData(selectedItemData);
    setOpenModal(true);
  };

  // Function to handle the form input change
  const handleFormInputChange = (event) => {
    const { name, value } = event.target;
    setEditedItemData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Function to handle the form submission

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSiteChange = (event) => {
    const selectedValue = event.target.value;
    console.log("Selected site:", selectedValue);
    setSelectedSite(selectedValue);
    setSidebarOpen(false);
    fetchStorageData();
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

  //-----------table data code--------------------

  // Filter the data based on the selected siteName
  const filteredData = data.filter((item) => item.siteName === selectedSite);

  console.log("Filtered data:", filteredData);
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  //---------------select box handler-----------------//

  const handleCheckboxChange = (event, itemId) => {
    const { checked } = event.target;

    if (checked) {
      setSelectedItems((prevSelectedItems) => [...prevSelectedItems, itemId]);
      console.log("Selected Items: ", selectedItems);
    } else {
      setSelectedItems((prevSelectedItems) => {
        const updatedSelectedItems = prevSelectedItems.filter(
          (id) => id !== itemId
        );
        return updatedSelectedItems.length > 0 ? updatedSelectedItems : [];
      });
    }
  };
  //----------------input field onchange handlers and button on clicks:------------///

  const handleQuantityChange = (event, itemId) => {
    const { value } = event.target;

    // Check if the input value is a valid number
    const parsedValue = parseInt(value, 10);
    const isValidQuantity = !isNaN(parsedValue) && parsedValue >= 0;

    setUpdatedQuantities((prevQuantities) => ({
      ...prevQuantities,
      [itemId]: isValidQuantity ? parsedValue : 0,
    }));

    // Update the quantityValidity state for the current item
    setQuantityValidity((prevValidity) => ({
      ...prevValidity,
      [itemId]: isValidQuantity,
    }));

    console.log(itemId);
  };

  //---------------submit form handler------------------//

  //Delivery Logic
  const generateRandomTrackingNumber = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    let trackingNumber = "";
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * letters.length);
      trackingNumber += letters[randomIndex];
    }
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * numbers.length);
      trackingNumber += numbers[randomIndex];
    }
    return trackingNumber;
  };
  const getCurrentDate = () => {
    const currentDate = new Date().toLocaleDateString("en-US");
    return currentDate;
  };

  const getCurrentTime = () => {
    const currentTime = new Date().toLocaleTimeString("en-US");
    return currentTime;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const confirmation = window.confirm(
      "Are you sure you want to save Table data?"
    );
    if (!confirmation) {
      return; // Abort saving if the user cancels the confirmation
    }

    try {
      // Find the selected site
      const selectedItem = filteredData.find((site) =>
        site.siteTable.some((item) => selectedItems.includes(item._id))
      );

      if (!selectedItem) {
        toast.error("No selected item found in Filtered Data");
        return;
      }

      // Validate input quantities only for selected items
      const invalidItems = selectedItem.siteTable
        .filter((item) => selectedItems.includes(item._id))
        .filter((item) => {
          const defaultQuantity = item.quantity;
          const updatedQuantity = updatedQuantities[item._id] || 0;

          if (updatedQuantity > defaultQuantity || updatedQuantity <= 0) {
            toast.error("Invalid Input for item: " + item.ItemName);
            return true;
          }
          return false;
        });

      if (invalidItems.length > 0) {
        return; // Abort the logic if there are invalid items
      }

      const storageId = selectedItem.id;
      const projectId = selectedItem.projectId;

      const updatedSiteTableWithNewItems = filteredData.map((site) => {
        // Check if the site contains any selected items
        const selectedItemsInSite = site.siteTable.filter((item) =>
          selectedItems.includes(item._id)
        );

        // Return the site with the original siteTable if no selected items are found in the siteTable
        if (selectedItemsInSite.length === 0) {
          return site;
        }

        // Return the site with the updated siteTable
        return {
          ...site,
          siteTable: site.siteTable.map((itemData) => {
            const itemId = itemData._id;

            // Skip items that are not selected
            if (!selectedItems.includes(itemId)) {
              return itemData;
            }

            // Get the updated quantity from the updatedQuantities state
            const updatedQuantity = updatedQuantities
              ? updatedQuantities[itemId] || 0
              : 0;

            // Find the selected item from the siteTable
            const selectedItem = site.siteTable.find(
              (item) => item._id === itemId
            );

            if (!selectedItem) {
              console.error(
                `No selected item found with id ${itemId} in the siteTable`
              );
              return;
            }

            // Retrieve the unit cost and default quantity from the selected item
            const unitCost = selectedItem.unitCost;
            const defaultQuantity = selectedItem.quantity;

            // Calculate the difference between the updated quantity and the default quantity
            const difference =
              parseInt(defaultQuantity) - parseInt(updatedQuantity);

            // Calculate the material cost computation product
            const materialCosting =
              parseFloat(updatedQuantity) * parseFloat(unitCost);

            // Return the updated item with the new quantity, difference, and material cost computation
            return {
              ...itemData,
              quantity: difference,
              materialCost: materialCosting,
            };
          }),
        };
      });

      console.log("Updated Site Table:", updatedSiteTableWithNewItems);

      // Make an Axios put request to update the storage on the backend
      await axios.put(`api/storages/${storageId}`, {
        siteTable: updatedSiteTableWithNewItems.find(
          (site) => site.id === storageId
        ).siteTable,
        projectName,
        siteName: selectedSite,
      });

      console.log("Selected item's project name:", projectName);

      // Retrieve the selected and updated items from the updated site table
      const selectedItemsTableData = updatedSiteTableWithNewItems
        .find((site) => site.id === storageId)
        .siteTable.filter((item) => selectedItems.includes(item._id))
        .map((item) => {
          const updatedItem = selectedItems.find(
            (selectedItem) => selectedItem._id === item._id
          );

          const updatedQuantity = updatedQuantities
            ? updatedQuantities[item._id] || 0
            : 0;

          return {
            ...item,
            quantity: updatedQuantity,
          };
        });

      const transactionData = selectedItemsTableData;
      const trackingNumber = generateRandomTrackingNumber();
      const delivery = {
        trackingNumber,
        title: selectedSite,
        place: "Cainta Main Warehouse",
        purchaseId: storageId,

        tableData: [
          {
            status: "Pick up",
            name: user.name,
            date: getCurrentDate(),
            time: getCurrentTime(),
            location: "Cainta Main Warehouse",
            comment: "comments",
            transactionTable: transactionData,
          },
        ],
      };
      const response = await axios.post("/api/deliveries", delivery);
      const deliveryId = response.data._id;
      const trackingNum = response.data.trackingNumber;

      // Redirect to the purchase order page
      const order = {
        deliveryId: deliveryId,
        id: storageId, // Assuming the order ID is the same as the storage ID
        title: selectedItem.siteName, // Assuming the project name is the title of the order
        remarks: "Pull Out Items", // Add the remarks if available
        date: getCurrentDate(), // Add the date if available
        time: getCurrentTime(), // Add the time if available
        location: "Cainta Main Warehouse", // Add the location if available
        tableData: selectedItemsTableData,
        tracksNumber: trackingNum, // Assuming the tableData is the selected and updated items
      };

      navigate("/productPullout", {
        state: order,
      });
    } catch (error) {
      console.error("Error updating item data", error);
      return;
    }
  };
  const navigateToProductDelivery = (order) => {
    navigate("/productPullout", {
      state: {
        deliveryId: selectedDeliveryInfo._id,
        id: selectedDeliveryInfo.purchaseId,
        title: selectedDeliveryInfo.title,
        remarks: "Pull Out Items",
        date: order.date,
        time: order.time,
        location: "Cainta Main Warehouse",
        dateNeeded: order.dateNeeded,
        dateRequested: order.dateRequested,
        targetDelivery: order.targetDelivery,
        tableData: order.transactionTable,
        tracksNumber: selectedDeliveryInfo.trackingNumber,
      },
    });
  };

  const handleGoBack = () => {
    // Use navigate(-1) to go back to the previous page in the history stack
    navigate(-1);
  };
  const handleTitleClick = async (delivery) => {
    try {
      await axios.put(`api/deliveries/view/${delivery._id}`, {
        read: "Seen",
        view: delivery.view,
      });
      setSelectedDeliveryData(delivery.tableData);
      setSelectedDeliveryInfo(delivery);

      setSelectedDeliveryTitle(delivery.title);
      setOpenDeliveryModal(true);
      fetchDeliveryData();
    } catch (error) {
      toast.error("An error occured");
      console.log("You have encountered an error", error);
    }
  };
  //--------------------end of function proper--------------------//
  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    fetchDeliveryData();
  };

  return (
    <div>
      <div className="container-admin">
        <section className="section-admin">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controller">
            <b>Site To Site Transaction</b>
          </div>
        </section>
        <section className="section-back" onClick={handleGoBack}>
          <FiArrowLeft />
          <div className="back">BACK</div>
        </section>
      </div>
      <div className="sitetrans-container">
        <select
          className="All-Sites"
          value={selectedSite}
          onChange={handleSiteChange}>
          <option className="site-value" value="">
            Select Site
          </option>
          {data.map((item) => {
            if (item.siteName !== "Cainta Main Warehouse") {
              return (
                <option
                  className="site-value"
                  key={item.siteName}
                  value={item.siteName}>
                  {item.siteName}
                </option>
              );
            }
            return null;
          })}
        </select>
        <div>
          <Button
            variant="contained"
            onClick={toggleSidebar}
            View
            Checkout
            Item>
            View Checked Out Items
          </Button>
        </div>
      </div>
      {sidebarOpen && (
        <div className="sidebar-trans sidebar-open">
          <button className="close-button-1" onClick={handleCloseSidebar}>
            CLOSE
          </button>
          <div className="Checked-out-items">CHECKED OUT ITEMS</div>
          <input
            type="text"
            placeholder="Search Tracking Number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-track"
          />

          <div className="checkedout-mini-box">
            {deliveryData
              .filter((delivery) =>
                delivery.trackingNumber
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              )
              .map((delivery) => {
                const showNotificationCircle =
                  !delivery.read || delivery.read !== "Seen";
                return (
                  <div
                    onClick={() => {
                      handleTitleClick(delivery);
                    }}
                    className="info-box-trans"
                    key={delivery.id}>
                    <BsFillBagCheckFill className="BsFillBagCheckFill" />{" "}
                    {delivery.trackingNumber + "-" + delivery.title}
                    {showNotificationCircle && (
                      <div className="circle-notification-view"> </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
      <Modal
        open={openDeliveryModal}
        onClose={() => setOpenDeliveryModal(false)}
        closeAfterTransition
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description">
        <Box sx={modalStyle}>
          <Fade in={openDeliveryModal}>
            <div>
              {selectedDeliveryData &&
                selectedDeliveryData
                  .filter((item) => item.status === "Pick up")
                  .map((item) => (
                    <div key={item.id}>
                      <div className="modal-content-sub">
                        <div className="modal-trans-title-box">
                          <div className="modal-trans-mini">
                            Checked out items from: {selectedDeliveryTitle}
                          </div>
                          <div className="modal-trans-mini">
                            Date: {formatDate(item.date)}
                          </div>
                          <div className="modal-trans-mini">
                            Time: {item.time}
                          </div>
                        </div>
                        <div className="checkout-box">
                          <div className="checkedout-items-title">
                            Checked out Items
                          </div>
                          {item.transactionTable.some(
                            (transactions) => transactions.changes === "Checked"
                          ) ? (
                            item.transactionTable.every(
                              (transactions) =>
                                transactions.changes === "Checked"
                            ) ? (
                              <div></div>
                            ) : (
                              <div className="delivery-site-trans">
                                {
                                  item.transactionTable.filter(
                                    (transactions) =>
                                      transactions.changes !== "Checked"
                                  ).length
                                }{" "}
                                Undelivered Items
                              </div>
                            )
                          ) : (
                            <div className="delivery-site-trans">
                              On Delivery
                            </div>
                          )}

                          {item.transactionTable.some(
                            (transactions) =>
                              transactions.itemStatus === "Undelivered"
                          ) ? (
                            <div className="delivery-site-trans">
                              Visit <b>{item.undeliveredId}</b> for new
                              transaction.
                            </div>
                          ) : null}
                        </div>

                        <Button
                          variant="outlined"
                          onClick={() => navigateToProductDelivery(item)}>
                          See Items Delivery
                        </Button>
                        <TableContainer component={Paper}>
                          <div
                            style={{
                              maxHeight: `${rowsPerPage * 53}px`,
                              overflow: "auto",
                              marginRight: "5px",
                            }}>
                            <Table
                              sx={{ minWidth: 950 }}
                              size="small"
                              aria-label="a dense table">
                              <TableHead>
                                <TableRow>
                                  <TableCell>
                                    <b>Item Name</b>
                                  </TableCell>
                                  <TableCell>
                                    <b>Quantity</b>
                                  </TableCell>
                                  <TableCell>
                                    <b>Unit</b>
                                  </TableCell>

                                  <TableCell>
                                    <b>Unit Cost</b>
                                  </TableCell>
                                  <TableCell>
                                    <b>Material Cost</b>
                                  </TableCell>
                                </TableRow>
                              </TableHead>

                              <TableBody>
                                {item.transactionTable.map(
                                  (transaction, index) => (
                                    <TableRow
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
                                        {transaction.ItemName}
                                      </TableCell>
                                      <TableCell>
                                        {transaction.quantity}
                                      </TableCell>
                                      <TableCell>{transaction.unit}</TableCell>

                                      <TableCell>
                                        &#x20B1; {transaction.unitCost}
                                      </TableCell>
                                      <TableCell>
                                        &#x20B1; {transaction.materialCost}
                                      </TableCell>
                                    </TableRow>
                                  )
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </TableContainer>
                      </div>
                    </div>
                  ))}
            </div>
          </Fade>
        </Box>
      </Modal>

      <TableContainer component={Paper}>
        <div
          style={{
            maxHeight: `${rowsPerPage * 53}px`,
            overflow: "auto",
          }}>
          <Table
            size="small"
            aria-label="a dense table"
            className="sitetrans-table1">
            <TableHead style={{ position: "sticky", top: 0 }}>
              <TableRow>
                <TableCell>
                  <b>Item Name</b>
                </TableCell>
                <TableCell>
                  <b>Unit</b>
                </TableCell>
                <TableCell>
                  <b>Quantity</b>
                </TableCell>

                <TableCell>
                  <b>Unit Cost</b>
                </TableCell>
                <TableCell>
                  <b>Material Cost</b>
                </TableCell>
                <TableCell>
                  <b>Availability</b>
                </TableCell>
                <TableCell>
                  <b>Select</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((site) =>
                site.siteTable.map((item) => {
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
                    <TableRow hover key={item.itemId}>
                      <TableCell
                        style={{ maxWidth: "200px", whiteSpace: "wrap" }}>
                        {item.ItemName}
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.quantity}</TableCell>

                      <TableCell>&#x20B1; {item.unitCost}</TableCell>
                      <TableCell>&#x20B1; {item.materialCost}</TableCell>
                      <TableCell>
                        <span style={{ color }}>{availability}</span>{" "}
                      </TableCell>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item._id)}
                          disabled={item.quantity === 0}
                          onChange={(event) =>
                            handleCheckboxChange(event, item._id)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <TablePagination
            style={{ position: "sticky", top: 0 }}
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={filteredData.length} // Use filteredData length for the total count
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>
      </TableContainer>
      <br />
      <br />
      <div className="siteTrans-container">
        <h3>Selected Items</h3>
        <div className="instruction-material-req-form">
          <p>
            Modify the quantity depending on the availability of items in the
            site location
          </p>
        </div>
        <div className="site-trans-box">
          <div className="inventoryMain-container-forside">
            <TableContainer component={Paper}>
              <Table size="small" aria-label="a dense table">
                <TableHead>
                  <TableCell>
                    <b>Item name</b>
                  </TableCell>
                  <TableCell>
                    <b> Unit</b>{" "}
                  </TableCell>
                  <TableCell>
                    <b>Quantity</b>{" "}
                  </TableCell>

                  <TableCell>
                    <b>Site Name</b>
                  </TableCell>
                </TableHead>
                <TableBody>
                  {selectedItems.map((itemId) => {
                    const selectedItem = filteredData.find((site) =>
                      site.siteTable.some((item) => item._id === itemId)
                    );

                    if (selectedItem) {
                      const selectedItemData = selectedItem.siteTable.find(
                        (item) => item._id === itemId
                      );

                      return (
                        <TableRow hover key={itemId}>
                          <TableCell
                            style={{ maxWidth: "200px", whiteSpace: "wrap" }}>
                            {selectedItemData.ItemName}
                          </TableCell>
                          <TableCell>{selectedItemData.unit}</TableCell>
                          <TableCell>{selectedItemData.quantity}</TableCell>

                          <TableCell>{selectedItem.siteName}</TableCell>
                        </TableRow>
                      );
                    }

                    return null;
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
          <div>
            <Button variant="contained" onClick={() => handleEditButtonClick()}>
              {" "}
              Check out
            </Button>
          </div>
        </div>
      </div>
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        closeAfterTransition
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description">
        <Box sx={modalStyle}>
          <Fade in={openModal}>
            <div
              style={{
                maxHeight: "600px",
                overflowY: "auto",
              }}>
              <Typography variant="h5">Checkout Details</Typography>
              <AiFillCloseCircle
                onClick={handleCloseModal}
                className="AiFillCloseCircle"
              />
              <Table size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <b>Item Name</b>
                    </TableCell>
                    <TableCell>
                      <b>Unit</b>
                    </TableCell>
                    <TableCell>
                      <b>Quantity</b>
                    </TableCell>
                    <TableCell>
                      <b>Input quantity</b>
                    </TableCell>

                    <TableCell>
                      <b>Unit Cost</b>
                    </TableCell>
                    <TableCell>
                      <b>Material Cost</b>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {selectedItems.map((itemId) => {
                    const selectedItem = filteredData.find((site) =>
                      site.siteTable.some((item) => item._id === itemId)
                    );

                    if (selectedItem) {
                      const selectedItemData = selectedItem.siteTable.find(
                        (item) => item._id === itemId
                      );

                      return (
                        <TableRow hover key={selectedItemData._id}>
                          <TableCell>{selectedItemData.ItemName}</TableCell>
                          <TableCell>{selectedItemData.unit}</TableCell>
                          <TableCell>{selectedItemData.quantity}</TableCell>
                          <TableCell>
                            <input
                              placeholder="Input Quantity"
                              type="Number"
                              value={updatedQuantities[itemId] || ""}
                              onChange={(e) => handleQuantityChange(e, itemId)}
                            />
                          </TableCell>

                          <TableCell>
                            &#x20B1; {selectedItemData.unitCost}
                          </TableCell>
                          <TableCell>
                            &#x20B1; {selectedItemData.materialCost}
                          </TableCell>
                        </TableRow>
                      );
                    }
                    return null;
                  })}
                </TableBody>
              </Table>

              <Button onClick={handleFormSubmit} variant="outlined">
                Submit
              </Button>
            </div>
          </Fade>
        </Box>
      </Modal>
    </div>
  );
}

export default Sitetrans;

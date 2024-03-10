import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./update-storage.css";

import { FiArrowLeft } from "react-icons/fi";
import { AiFillCheckCircle } from "react-icons/ai";
import axios from "axios";
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

function UpdateStorage() {
  const [items, setItems] = useState([]);
  const [pickUpTable, setPickUpTable] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deliveryTrackingNumbers, setDeliveryTrackingNumbers] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [selectedDeliveryDetails, setSelectedDeliveryDetails] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isUpdateButtonVisible, setIsUpdateButtonVisible] = useState(true);
  const [selectedTransactionItems, setSelectedTransactionItems] = useState([]);
  const [purchaseId, setPurchaseId] = useState("");
  const navigate = useNavigate();

  const fetchDeliveryData = async () => {
    try {
      const response = await axios.get("/api/deliveries");
      const data = response.data;
      const deliveries = data.map((delivery) => ({
        id: delivery._id,
        title: delivery.title,
        remark: delivery.remark,
        tableData: delivery.tableData,
        purchaseId: delivery.purchaseId,
      }));
      setDeliveryTrackingNumbers(deliveries);
      console.log("DELIVERIES: ", deliveries);
    } catch (error) {
      console.error("Error fetching delivery data:", error);
    }
  };
  useEffect(() => {
    fetchDeliveryData();
  }, []);

  //----- to handle title click in the sidebar-----------

  const handleTitleClick = (delivery, pickUpStatusData) => {
    setSelectedTitle(delivery.id);
    setSelectedDeliveryDetails(delivery.tableData);
    console.log("Purchase ID: ", delivery.purchaseId);
    setPurchaseId(delivery.purchaseId);
    setPickUpTable(pickUpStatusData);
  };

  //to handle change when clicked checkbox-----------
  const handleChange = (e, itemIndex, transactionIndex) => {
    const checked = e.target.checked;

    if (checked) {
      const selectedItem = selectedDeliveryDetails[itemIndex];
      const selectedTransaction =
        selectedItem.transactionTable[transactionIndex];
      setSelectedTransactionItems((prevItems) => {
        const updatedItems = [...prevItems];
        updatedItems.push(selectedTransaction);
        return updatedItems;
      });
    } else {
      setSelectedTransactionItems((prevItems) =>
        prevItems.filter(
          (transaction) =>
            transaction !==
            selectedDeliveryDetails[itemIndex].transactionTable[
              transactionIndex
            ]
        )
      );
    }
  };

  useEffect(() => {
    console.log("Selected Items:", selectedTransactionItems);
  }, [selectedTransactionItems]);

  const handleUpdateDelivery = async () => {
    try {
      // Find the delivery with the selected title in the deliveryTrackingNumbers array
      const selectedDelivery = deliveryTrackingNumbers.find(
        (delivery) => delivery.id === selectedTitle
      );

      if (!selectedDelivery) {
        // Handle the case where no delivery with the selected title is found
        console.error("Selected delivery not found");
        toast.error("Selected delivery not found");
        return;
      }

      // Update the remark field of the selected delivery
      selectedDelivery.remark = "Updated";

      // Find the "Pick up" status transaction in the tableData
      const pickUpTransaction = selectedDelivery.tableData.find(
        (item) => item.status === "Pick up"
      );

      // Update the "Pick up" transaction's transactionTable property
      const updatedTableData = pickUpTable.transactionTable.map((item) => {
        const matchingTransaction = selectedTransactionItems.find(
          (transaction) => transaction.ItemName === item.ItemName
        );

        if (matchingTransaction) {
          // If a matching transaction is found, mark it as "Checked"
          return {
            ...item,
            changes: "Checked",
          };
        } else {
          return item;
        }
      });
      console.log("Table: ", updatedTableData);
      // Make the PUT request to update the specific transaction

      await axios.put(`/api/deliveries/remark/${selectedDelivery.id}`, {
        trackingNumber: selectedDelivery.trackingNumber,
        title: selectedDelivery.title,
        place: selectedDelivery.place,
        remark: selectedDelivery.remark,
        tableData: selectedDelivery.tableData,
      });
      const response = await axios.put(
        `/api/deliveries/${selectedDelivery.id}/transactions/${pickUpTransaction._id}`,
        {
          transactionTable: updatedTableData,
          undeliveredId: "",
        }
      );
      console.log("Transaction updated successfully:", response.data);
      toast.success("Transaction updated successfully!");
    } catch (error) {
      console.error("Error updating transaction details", error);
      toast.error("Error updating transaction details");
    }
  };

  const handleUpdatePurchase = async () => {
    try {
      const response = await axios.get(`/api/comments/comment/${purchaseId}`);
      const purchaseOrders = response.data;

      const updatedTableData = purchaseOrders.tableData.map((item) => {
        const matchingTransaction = selectedTransactionItems.find(
          (transaction) => transaction.ItemName === item.ItemName
        );

        if (matchingTransaction) {
          // If a matching transaction is found, mark it as "Checked"
          return {
            ...item,
            changes: "Checked",
          };
        } else {
          return item;
        }
      });
      // Update the purchaseOrders with the updated tableData
      const updatedPurchaseOrders = {
        ...purchaseOrders,
        tableData: updatedTableData,
      };
      // Send the updated purchaseOrders to the server
      await axios.put(
        `/api/comments/comment/${purchaseId}`,
        updatedPurchaseOrders
      );
      console.log("Purchase items is updated successfully:", response.data);
      toast.success("Purchase items updated successfully!");
    } catch (error) {
      console.error("Error updating purchase items details", error);
      toast.error("Error updating purchase items details", error);
    }
  };

  const handleUpdateSupplies = async (locationString, storage) => {
    const filteredDeliveries = deliveryTrackingNumbers.filter(
      (delivery) =>
        delivery.tableData[0]?.location &&
        delivery.tableData[0]?.location.includes(locationString)
    );
    if (filteredDeliveries.length === 0) {
      // Handle case when no matching delivery is found
      toast.error("No matching site found for the location");
      return;
    }

    const siteName = filteredDeliveries[0].tableData[0].location;
    const supplierResponse = await axios.get("/api/supplies");
    const suppliers = supplierResponse.data.find((storage) => {
      if (siteName === "Cainta Main Warehouse") {
        return storage.supplier === siteName;
      } else {
        // Return true if siteName is not "Cainta Main Warehouse"
        return true;
      }
    });

    const existingSupplierItemsMap = new Map(
      suppliers.items.map((item) => [item.ItemName, item])
    );

    const updatedSiteTable = selectedTransactionItems.map((newItem) => {
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

      console.log(
        `New Item: ${newItem.ItemName}, Quantity: ${newItem.quantity}`
      );
      console.log(
        `New Item: ${newItem.ItemName}, Material Cost: ${newItem.materialCost}`
      );

      return {
        ...newItem,
        location: locationString,
        siteName: siteName,
      };
    });

    const newSupplierItems = selectedTransactionItems.filter(
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

  async function updateStorageSync(siteName, locationString, _id, projectName) {
    try {
      const response = await axios.get(`/api/storages?siteName=${siteName}`);
      const storage = response.data.find(
        (storage) => storage.siteName === siteName
      );

      const existingItemsMap = new Map(
        storage.siteTable.map((item) => [item.ItemName, item])
      );

      const updatedSiteTable = selectedTransactionItems.map((newItem) => {
        const existingItem = existingItemsMap.get(newItem.ItemName);

        if (existingItem) {
          // Update the quantity and materialCost of the existing item
          existingItem.quantity += Number(newItem.quantity);
          existingItem.materialCost =
            existingItem.quantity * existingItem.unitCost;

          console.log(
            `for storage Main Warehouse: Existing Item: ${existingItem.ItemName}, Quantity: ${existingItem.quantity}`
          );
          console.log(
            `for storage Main Warehouse: Existing Item: ${existingItem.ItemName}, Material Cost: ${existingItem.materialCost}`
          );

          return existingItem;
        }

        return {
          ...newItem,
          location: locationString,
          siteName: siteName,
        };
      });

      const newItems = selectedTransactionItems.filter(
        (item) => !existingItemsMap.has(item.ItemName)
      );

      const updatedSiteTableWithNewItems = [...storage.siteTable, ...newItems];

      console.log(
        "UpdatedSite Table with new items: " + updatedSiteTableWithNewItems
      );

      const updateResponse = await axios.put(`/api/storages/${_id}`, {
        siteName: storage.siteName,
        projectId: storage.projectId,
        siteTable: updatedSiteTableWithNewItems,
        projectName, // Preserve the projectName field while updating
      });
      toast.success("Storage updated successfully!");
    } catch (error) {
      console.error(error);
      console.log("Error occurred while updating storage.");
    }
  }

  //the update storage when submit is clicked----------------

  const handleUpdateStorage = async () => {
    if (!selectedDeliveryDetails) return;

    if (selectedTransactionItems.length === 0) {
      toast.error("Please select at least one item.");
      return;
    }

    setIsUpdateButtonVisible(false);

    const locationString = selectedDeliveryDetails[0].location;
    const { siteTable } = selectedDeliveryDetails[0];
    const DeliveredQuantity = selectedDeliveryDetails[0].quantity;

    // Filter deliveries based on the location string
    const filteredDeliveries = deliveryTrackingNumbers.filter(
      (delivery) =>
        delivery.tableData[0]?.location &&
        delivery.tableData[0]?.location.includes(locationString)
    );

    if (filteredDeliveries.length === 0) {
      // Handle case when no matching delivery is found
      toast.error("No matching site found for the location");
      return;
    }

    // Retrieve the siteName from the first matching delivery
    const siteName = filteredDeliveries[0].tableData[0].location;

    // Fetch the storage based on the siteName
    const response = await axios.get(`/api/storages?siteName=${siteName}`);
    const storage = response.data.find(
      (storage) => storage.siteName === siteName
    );

    // Fetch the suppliers info specifically for Cainta Main Warehouse
    const { _id, projectName } = storage;

    if (siteName === "Cainta Main Warehouse") {
      console.log("true");

      await updateStorageSync(siteName, locationString, _id, projectName);
      handleUpdateSupplies(locationString, storage);
      handleUpdateDelivery();
      fetchDeliveryData();
      handleUpdatePurchase();
      return;
    }
    const bomData = await axios.get(`/api/projects`);
    const bomSite = bomData.data.find(
      (storage) => storage.location === siteName
    );

    if (siteName !== "Cainta Main Warehouse") {
      console.log("BOMSITE:" + JSON.stringify(bomSite));
      const itemsBom = bomSite.items;
      // Check for new items that are present in the existing siteTable

      console.log("New Items: " + JSON.stringify(itemsBom));

      const existingItemsCateg = new Map(
        bomSite.items.map((item) => [item.product, item])
      );
      console.log("existingCateg:" + JSON.stringify(existingItemsCateg));

      // Create a map of existing items in the siteTable for easier lookup
      const existingItemsMap = new Map(
        storage.siteTable.map((item) => [item.ItemName, item])
      );

      // Update the quantity of existing items and add new items to the siteTable
      const updatedSiteTable = selectedTransactionItems.map((newItem) => {
        const existingItem = existingItemsMap.get(newItem.ItemName);
        const existingCategory = existingItemsCateg.get(newItem.ItemName);

        console.log("Existing Category" + existingCategory);

        if (existingItem) {
          // Update the quantity and materialCost of existing item
          existingItem.quantity += Number(newItem.quantity);
          existingItem.materialCost =
            existingItem.quantity * existingItem.unitCost;

          console.log(
            `for storage Site Existing Item: ${existingItem.ItemName}, Quantity: ${existingItem.quantity}`
          );
          console.log(
            `for storage Site Existing Item: ${existingItem.ItemName}, Material Cost: ${existingItem.materialCost}`
          );
          return existingItem;
        }
        return {
          ...newItem,
          location: locationString,
          siteName: siteName,
        };
      });

      const newItems = selectedTransactionItems.filter(
        (item) => !existingItemsMap.has(item.ItemName)
      );

      // Extract ItemName values from newItems
      const stringSimilarity = require("string-similarity");
      const itemNames = newItems.map((item) => item.ItemName);
      const existingItemNames = Array.from(existingItemsCateg.keys());

      // Calculate string similarity for each item in itemNames
      const similarities = itemNames.map((itemName) => {
        const matches = stringSimilarity.findBestMatch(
          itemName,
          existingItemNames
        );
        return matches;
      });
      const bestMatches = similarities.map((similarity) => {
        // 'bestMatch' is an object containing the best match information
        const bestMatch = similarity.bestMatch;
        return bestMatch.target; // This is the best match for the current item
      });

      // Now 'bestMatches' is an array containing the best match for each item in itemNames
      console.log(bestMatches);
      const updatedNewItems = newItems.map((item) => {
        const bestMatchIndex = bestMatches.indexOf(item.ItemName);
        if (bestMatchIndex !== -1) {
          const bestMatch = bestMatches[bestMatchIndex];
          const existingCategory = existingItemsCateg.get(bestMatch);

          if (existingCategory) {
            item.category = existingCategory.subCategory;
          }
        }

        return item;
      });

      // Add the new items to the siteTable
      const updatedSiteTableWithNewItems = [...storage.siteTable, ...newItems];
      console.log(
        "UpdatedSite Table with new items: " + updatedSiteTableWithNewItems
      );
      const updateResponse = await axios.put(`/api/storages/${_id}`, {
        siteName: storage.siteName,
        projectId: storage.projectId,
        siteTable: updatedSiteTableWithNewItems,
        projectName, // Preserve the projectName field while updating
      });

      console.log("UpdatedNewItems:" + newItems);

      //-----------end of the code-----
      handleUpdateDelivery();
      fetchDeliveryData();
      handleUpdatePurchase();
      toast.success("Storage updated successfully!");
    }
  };

  const handleSaveConfirmation = () => {
    const isConfirmed = window.confirm("Are you sure you want to save?");

    if (isConfirmed) {
      handleUpdateStorage();
    }
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div>
      <div className="container-admin">
        <section className="section-admin">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controller">
            <div> Update Storage</div>
          </div>
        </section>
        <section className="section-back" onClick={() => handleGoBack()}>
          <FiArrowLeft />
          <div className="back">BACK</div>
        </section>
      </div>
      <div className="main-update-storage-container">
        <div className="main-container-update">
          <div className="update-storage-box">
            <div className="main-update-storage-title">
              RECEIVED ITEMS INVENTORY
            </div>
            <div className="main-update-storage-info">
              <b>Instructions:</b> To update the storage. First, check the
              latest items received in the side container. Keep in mind that you
              only have one opportunity to update the storage per delivery so
              make sure to check all the delivered items that need updating.
              When reviewing the items, verify the items in the site inventory,
              and for received items, mark the checkboxes accordingly.
              Conversely, leave the checkboxes unchecked for items that have not
              been received at the site. Once you have completed the
              verification, click the "Update Storage" button. This action will
              update the site inventory, and if any items need to be transferred
              to the main warehouse, it will be done automatically. Rest assured
              that the "Update Storage" button will disappear after completing
              the update, avoiding any accidental duplicate updates. Your
              attentiveness and diligence throughout this process will ensure a
              successful and accurate storage update.
            </div>
          </div>
          <div className="delivery-details-container-main-update-storage">
            {selectedDeliveryDetails ? (
              selectedDeliveryDetails
                .filter(
                  (item) =>
                    item.status === "Received" &&
                    (!item.remark || item.remark !== "Updated")
                )
                .map((item, itemIndex) => (
                  <div key={item.id}>
                    <div className="delivery-detail-box">
                      <div className="delivery-details-title-update">
                        <b>Delivery Details</b>
                      </div>
                      <TableContainer
                        component={Paper}
                        sx={{
                          width: "950px",
                        }}>
                        <Table size="small" aria-label="a dense table">
                          <TableHead>
                            <TableRow>
                              <TableCell>
                                <b>Status</b>
                              </TableCell>
                              <TableCell>
                                <b>Location</b>
                              </TableCell>
                              <TableCell>
                                <b>Name</b>
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
                            <TableRow>
                              <TableCell>{item.status}</TableCell>
                              <TableCell>{item.location}</TableCell>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>{item.date}</TableCell>
                              <TableCell>{item.time}</TableCell>
                              <TableCell
                                style={{
                                  maxWidth: "200px",
                                  whiteSpace: "wrap",
                                }}>
                                {item.comment}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div>
                    <div className="delivery-detail-box">
                      <div className="delivery-details-title-update">
                        <AiFillCheckCircle className="received-icon-update" />
                        <b>Received Items</b>
                      </div>
                      <TableContainer
                        component={Paper}
                        sx={{
                          width: "950px",
                        }}>
                        <div
                          style={{
                            maxHeight: `${rowsPerPage * 53}px`,
                            overflow: "auto",
                          }}>
                          <Table size="small" aria-label="a dense table">
                            <TableHead style={{ position: "sticky", top: 0 }}>
                              <TableRow>
                                <TableCell>
                                  <b>Select</b>
                                </TableCell>
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
                                (transaction, transactionIndex) => (
                                  <TableRow key={transaction.id}>
                                    <TableCell>
                                      <input
                                        type="checkbox"
                                        value={selectedTransactionItems.some(
                                          (t) => t.id === transaction.id
                                        )}
                                        onChange={(e) =>
                                          handleChange(
                                            e,
                                            itemIndex,
                                            transactionIndex
                                          )
                                        }
                                      />
                                    </TableCell>
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
                        <TablePagination
                          rowsPerPageOptions={[10, 25, 100]}
                          component="div"
                          count={item.transactionTable.length}
                          rowsPerPage={rowsPerPage}
                          page={page}
                          onPageChange={handleChangePage}
                          onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                      </TableContainer>
                    </div>
                  </div>
                ))
            ) : (
              <div className="pls-select">
                Please select a project name to view delivery details.
              </div>
            )}
          </div>
          {selectedDeliveryDetails &&
            selectedDeliveryDetails.some(
              (item) =>
                item.status === "Received" &&
                (!item.remark || item.remark !== "Updated")
            ) &&
            isUpdateButtonVisible && (
              <button onClick={handleSaveConfirmation}>Update Storage</button>
            )}
        </div>
        <div className="update-storage-subcontainer">
          <div className="received-title-update">
            <b>TO BE UPDATED</b>
          </div>

          <div className="update-storage-side-container-scroll">
            <div className="update-storage-side-container">
              {deliveryTrackingNumbers.map((delivery) => {
                //To filter the deliveries that has received status
                const receivedStatusData = delivery.tableData.find(
                  (statusData) => statusData.status === "Received"
                );
                const pickUpStatusData = delivery.tableData.find(
                  (statusData) => statusData.status === "Pick up"
                );
                // Filter out the not updated data
                if (receivedStatusData && delivery.remark !== "Updated") {
                  return (
                    <div
                      key={delivery.id}
                      className={`trackingNum-update ${
                        selectedTitle === delivery.id ? "active" : ""
                      }`}
                      onClick={() =>
                        handleTitleClick(delivery, pickUpStatusData)
                      }>
                      <AiFillCheckCircle className="received-icon-update" />
                      <div className="delivery-title-update">
                        {delivery.title}
                      </div>
                    </div>
                  );
                } else {
                  return null;
                }
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateStorage;

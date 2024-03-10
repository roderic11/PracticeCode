import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
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
import "./inventoryMain.css";
import axios from "axios";

function Inventory() {
  const [data, setData] = useState([]); // State to store the fetched data
  const [selectedSite, setSelectedSite] = useState(""); // State to store the selected siteName
  const [page, setPage] = useState(0); // Current page number
  const [rowsPerPage, setRowsPerPage] = useState(12); // Number of rows per page
  const [projectName, setProjectName] = useState("");
  const [site, setSite] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState([]); // State to store the selected projectName
  const navigate = useNavigate();
  useEffect(() => {
    const fetchStorageData = async () => {
      try {
        const response = await axios.get("api/storages");
        const data = response.data;
        const storages = data.map((storage) => ({
          siteName: storage.siteName,
          siteTable: storage.siteTable,
          projectName: storage.projectName,
        }));
        setData(storages);
        setSite(storages.siteName);
      } catch (error) {
        console.error("Error fetching storage data", error);
      }
    };
    fetchStorageData();
  }, []);

  // Pagination event handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSiteChange = (event) => {
    const selectedValue = event.target.value;
    console.log("Selected site:", selectedValue);
    setSelectedSite(selectedValue);

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

  console.log("Filtered data:", filteredData);
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Count the number of items in stock for each siteTable
  const inStockCount = filteredData.map(
    (site) => site.siteTable.filter((item) => item.quantity > 0).length
  );

  const handleSearch = () => {
    // Filter the siteTable based on the searchQuery
    const filtered = site.siteTable.filter(
      (item) =>
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredResults(filtered);
  };
  // Compute the total number of items in all siteTable entries
  const totalItems = data.reduce(
    (count, storage) => count + storage.siteTable.length,
    0
  );

  const handleCustomClick = () => {
    navigate("/updateStorage");
  };

  const handleCainta = () => {
    navigate("/MainWarehouse");
  };

  // Compute the revenue based on the material cost of all siteTable entries
  const overallRevenue = parseFloat(
    data.reduce(
      (revenue, storage) =>
        revenue +
        storage.siteTable.reduce(
          (subtotal, item) => subtotal + parseFloat(item.materialCost),
          0
        ),
      0
    )
  ).toFixed(2);
  // Compute the total number of low stocks for all siteTable entries
  const totalLowStocks = data.reduce((count, storage) => {
    const lowStocks = storage.siteTable.filter((item) => item.quantity < 10);
    return count + lowStocks.length;
  }, 0);

  // Compute the total number of out of stocks for all siteTable entries
  const totalOutOfStocks = data.reduce((count, storage) => {
    const outOfStocks = storage.siteTable.filter((item) => item.quantity === 0);
    return count + outOfStocks.length;
  }, 0);
  const handleGoBack = () => {
    // Use navigate(-1) to go back to the previous page in the history stack
    navigate(-1);
  };
  return (
    <div>
      {" "}
      <div className="container-admin">
        <section className="section-admin">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controller">
            <b>Inventory</b>
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

          <div className="Total-Products">Total Product : {totalItems}</div>

          <div className="Low-Stocks">Total Low Stocks: {totalLowStocks}</div>
          <div className="Low-Stocks">
            Total Out of Stocks: {totalOutOfStocks}
          </div>
        </div>
        <div className="buttons-main-inv">
          <button onClick={handleCustomClick}>Storage Delivery Updates</button>
          <button onClick={handleCainta}>Cainta Main Inventory</button>
        </div>
      </div>
      <div className="inventoryMain-container-table">
        <div className="inventoryMain-sub-container-table">
          <div className="Products">Products</div>
          <div className="stock">
            <div className="In-stock">
              In Stock:{" "}
              {filteredData.reduce(
                (count, site) =>
                  count +
                  site.siteTable.filter((item) => item.quantity > 0).length,
                0
              )}
            </div>
            <div className="Low-stock">
              Low Stock:{" "}
              {filteredData.reduce(
                (count, site) =>
                  count +
                  site.siteTable.filter((item) => item.quantity < 10).length,
                0
              )}
            </div>
            <div className="Out-of-stock">
              Out of Stock:{" "}
              {filteredData.reduce(
                (count, site) =>
                  count +
                  site.siteTable.filter((item) => item.quantity === 0).length,
                0
              )}
            </div>
          </div>

          <select
            className="All-Sites"
            value={selectedSite}
            onChange={handleSiteChange}>
            <option className="site-value" value="">
              Select Site
            </option>
            {data
              .filter((item) => item.siteName !== "Cainta Main Warehouse")
              .map((item) => (
                <option
                  className="site-value"
                  key={item.siteName}
                  value={item.siteName}>
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
            }}>
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
                    <strong>Unit</strong>
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
                    <strong>Availability</strong>
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
                            &#x20B1; {parseFloat(item.unitCost).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            &#x20B1; {parseFloat(item.materialCost).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <span style={{ color }}>{availability}</span>{" "}
                          </TableCell>
                        </TableRow>
                      );
                    })
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
          </div>
        </TableContainer>
      </div>
    </div>
  );
}

export default Inventory;

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode.react";
import "./PurchaseOrder.css";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
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
} from "@mui/material";
import axios from "axios";
import { AiFillCloseCircle } from "react-icons/ai";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 900,
  bgcolor: "background.paper",
  borderRadius: "10px",
  boxShadow: 24,
  padding: "20px",
};

// Add media query to make it scrollable on screens less than 450px wide
if (window.innerWidth <= 450) {
  modalStyle.maxHeight = "80vh"; // Adjust the maximum height as needed
  modalStyle.overflowY = "auto";
}

function Logistics() {
  const routeLocation = useLocation();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deliveryTrackingNumbers, setDeliveryTrackingNumbers] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [selectedDeliveryDetails, setSelectedDeliveryDetails] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedTrackingNumber, setSelectedTrackingNumber] = useState("");
  const qrCodeRef = useRef();
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const navigate = useNavigate();
  const tableRef = useRef(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(routeLocation.search);
    const qrCodeData = queryParams.get("data");

    if (qrCodeData) {
      const data = JSON.parse(decodeURIComponent(qrCodeData));
      setSelectedItems(data.items.map((item, index) => index));
      setItems(data.items);
      setTrackingNumber(data.trackingNumber);
      setTitle(data.title);
      setPlace(data.place);
    }
  }, [routeLocation.search]);

  useEffect(() => {
    if (selectedTrackingNumber && qrCodeRef.current && selectedRowId) {
      const qrCodeData = {
        trackingNumbers: selectedRowId,
        items: items.map((data) => data.transactionTable),
        trackingNumber: selectedTrackingNumber,
        title: title,
        place: place,
      };
      qrCodeRef.current.makeCode(generateQRCodeWithLink(qrCodeData));
    }
  }, [selectedTrackingNumber, selectedRowId]);

  const fetchDeliveryData = async () => {
    try {
      const response = await axios.get("/api/deliveries");
      const data = response.data;
      const deliveries = data.map((delivery) => ({
        id: delivery._id,
        title: delivery.title,
        view: delivery.view,
        read: delivery.read,
        place: delivery.place,
        see: delivery.see,
        trackingNumber: delivery.trackingNumber,
        tableData: delivery.tableData,
        createdAt: new Date(delivery.createdAt).toLocaleString(), // Convert createdAt to the desired format
      }));

      // Sort the deliveries in descending order based on the creation date
      deliveries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setDeliveryTrackingNumbers(deliveries);
    } catch (error) {
      console.error("Error fetching delivery data:", error);
    }
  };

  useEffect(() => {
    fetchDeliveryData();
  }, []);

  const handleTitleClick = async (delivery) => {
    try {
      await axios.put(`api/deliveries/view/${delivery.id}`, {
        see: "Viewed",
        view: delivery.view,
        read: delivery.read,
      });
      fetchDeliveryData();
      setSelectedTitle(delivery.title);
      setPlace(delivery.place);
      setSelectedDeliveryDetails(delivery.tableData);
      setSelectedTrackingNumber(delivery.trackingNumber);
      setSelectedRowId(delivery.id);
      setModalOpen(true);
    } catch (error) {
      toast.error("An error occured");
      console.log("You have encountered an error", error);
    }
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

  const handleGoBack = () => {
    // Use navigate(-1) to go back to the previous page in the history stack
    navigate(-1);
  };
  return (
    <div>
      <div className="container-admin">
        <section className="section-admin">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controller">Logistics</div>
        </section>
        <section className="section-back" onClick={handleGoBack}>
          <FiArrowLeft />
          <div className="back">BACK</div>
        </section>
      </div>

      <div className="logistic-container">
        <TableContainer component={Paper} sx={{ width: "1250px" }}>
          <div className="tracking-numbers-container" ref={tableRef}>
            <Table size="small" aria-label="a dense table">
              <TableHead className="tracking-numbers-container-tablehead">
                <TableRow>
                  <TableCell>
                    <b>Tracking Number</b>
                  </TableCell>
                  <TableCell>
                    <b>Title</b>
                  </TableCell>
                  <TableCell>
                    <b>Started Date and Time</b>
                  </TableCell>
                  <TableCell>
                    <b>Delivery Location</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deliveryTrackingNumbers.map((delivery, index) => (
                  <TableRow
                    key={index}
                    className={`trackingNum ${
                      selectedTitle === delivery.id ? "active" : ""
                    }`}
                    onClick={() => handleTitleClick(delivery)}
                    style={{
                      backgroundColor:
                        delivery.see !== "Viewed"
                          ? "#cfd9ff"
                          : index % 2 === 0
                          ? "white"
                          : "#f0f0f0",
                    }}
                  >
                    <TableCell>{delivery.trackingNumber}</TableCell>
                    <TableCell>{delivery.title}</TableCell>
                    <TableCell>
                      {new Date(delivery.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>{delivery.place}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              className="tracking-numbers-container-tablepagination"
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={deliveryTrackingNumbers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
        </TableContainer>
      </div>

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
      >
        <div className="modal-box-logistic">
          <Fade in={modalOpen}>
            <div
              style={{
                maxHeight: "600px",
                overflowY: "auto",
              }}
            >
              <Typography variant="h5">Delivery Details</Typography>
              <AiFillCloseCircle
                className="AiFillCloseCircle"
                onClick={() => {
                  handleCloseModal();

                  tableRef.current.scrollIntoView({ behavior: "smooth" });
                }}
              />
              {selectedDeliveryDetails ? (
                selectedDeliveryDetails
                  .filter((item) => item.status === "In Transit")
                  .map((item) => (
                    <div key={item.id}>
                      <div className="modal-content2">
                        <div className="modal-content-sub">
                          <Paper sx={{ width: "550px" }}>
                            <TableContainer>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>
                                      <strong>Status</strong>
                                    </TableCell>
                                    <TableCell>
                                      <strong>Plate Number</strong>
                                    </TableCell>
                                    <TableCell>
                                      <strong>Name</strong>
                                    </TableCell>
                                    <TableCell>
                                      <strong>Date</strong>
                                    </TableCell>
                                    <TableCell>
                                      <strong>Time</strong>
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
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Paper>
                        </div>
                        <div>
                          {selectedTrackingNumber && (
                            <div className="purchase-order-input-subcontainer-1">
                              <div className="scan-me">Scan Me</div>
                              <QRCode
                                ref={qrCodeRef}
                                value={generateQRCodeWithLink({
                                  trackingNumbers: selectedRowId,

                                  trackingNumber: selectedTrackingNumber,
                                  place: place,
                                  title: selectedTitle, // Use selectedTitle instead of title
                                })}
                                size={256}
                                renderAs="svg"
                                includeMargin={true}
                              />
                              <p>Tracking Number: {selectedTrackingNumber}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <Typography variant="h6">
                        Received Items by Logistic
                      </Typography>
                      <Paper sx={{ width: "800px" }}>
                        <TableContainer component={Paper}>
                          <Table size="small" aria-label="a dense table">
                            <TableHead>
                              <TableRow>
                                <TableCell>
                                  <strong>Item Name</strong>
                                </TableCell>
                                <TableCell>
                                  <strong>Quantity</strong>
                                </TableCell>
                                <TableCell>
                                  <strong>Unit</strong>
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
                              {item.transactionTable.map((transaction) => (
                                <TableRow key={transaction.id}>
                                  <TableCell
                                    style={{
                                      maxWidth: "200px",
                                      whiteSpace: "wrap",
                                    }}
                                  >
                                    {transaction.ItemName}
                                  </TableCell>
                                  <TableCell>{transaction.quantity}</TableCell>
                                  <TableCell>{transaction.unit}</TableCell>

                                  <TableCell>
                                    &#x20B1; {transaction.unitCost}
                                  </TableCell>
                                  <TableCell>
                                    &#x20B1;{" "}
                                    {parseFloat(
                                      transaction.materialCost
                                    ).toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Paper>
                    </div>
                  ))
              ) : (
                <Typography>
                  Please select a title to view delivery details.
                </Typography>
              )}
            </div>
          </Fade>
        </div>
      </Modal>
    </div>
  );
}

export const generateQRCodeWithLink = (data) => {
  const qrCodeData = {
    trackingNumbers: data.trackingNumbers,

    trackingNumber: data.trackingNumber,
    title: data.title,
    place: data.place,
  };
  const encodedData = encodeURIComponent(JSON.stringify(qrCodeData));
  const baseURL = window.location.origin; // Get the base URL of the current application
  return `${baseURL}/Logistics-Receive/?data=${encodedData}`; // Use the base URL to construct the complete link
};

export default Logistics;

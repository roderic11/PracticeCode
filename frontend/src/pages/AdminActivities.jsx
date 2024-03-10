import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSideBar";
import { FiArrowLeft } from "react-icons/fi";
import AdminActivitiesSide from "./AdminActivitiesSide";
import { useTable } from "react-table";
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
import "./Admin.css";
import { width } from "@mui/system";

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options);
};
function AdminActivities() {
  const [selectedTable, setSelectedTable] = useState(
    localStorage.getItem("selectedTable") || ""
  );
  const [phTime, setPhTime] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0); // Add 'page' state variable and 'setPage' setter
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date();
      const options = {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      };
      const timeString = currentTime.toLocaleTimeString("en-US", options);
      setPhTime(currentTime.toLocaleDateString("en-US", options));
    }, 1000);

    fetchSubmissions();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedTable", selectedTable);
  }, [selectedTable]);

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get("/api/submissions/submit");
      const submissions = response.data.map((submission) => ({
        id: submission._id,
        sender: submission.sender,
        date: submission.date,
        title: submission.title,
        remark: submission.remark,
        location: submission.location,
        dateRequested: submission.dateRequested,
        dateNeeded: submission.dateNeeded,
        targetDelivery: submission.targetDelivery,
        tableData: submission.tableData,
      }));

      // Sort submissions based on date modified in descending order
      const sortedSubmissions = submissions.reverse();

      setSubmissions(sortedSubmissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  const materialColumns = React.useMemo(
    () => [
      { Header: "Number", accessor: "number" },
      { Header: "Name", accessor: "name" },
      { Header: "Price", accessor: "price" },
      { Header: "Description", accessor: "description" },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => (
          <div>
            <button
              onClick={() =>
                navigate(`/details/${row.original.id}`, { state: row.original })
              }>
              See Details
            </button>
            <button onClick={() => handleDelete(row)}>Delete</button>
          </div>
        ),
      },
    ],
    []
  );

  const pricingColumns = React.useMemo(
    () => [
      { Header: "Number", accessor: "number" },
      { Header: "Sender", accessor: "sender" },
      {
        Header: "Date",
        accessor: "date",
        Cell: ({ value }) => formatDate(value),
      },

      { Header: "Title", accessor: "title" },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => (
          <div>
            <button
              onClick={() =>
                navigate(`/details/${row.original.id}`, { state: row.original })
              }>
              See Details
            </button>
            <button onClick={() => handleDelete(row)}>Delete</button>
          </div>
        ),
      },
    ],
    []
  );

  const data = React.useMemo(() => {
    return submissions.map((submission, index) => {
      return {
        number: index + 1,
        ...submission,
      };
    });
  }, [submissions]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns: selectedTable === "Material" ? materialColumns : pricingColumns,
      data: data,
    });

  const handleDelete = async (row) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`/api/submissions/submit/${row.original.id}`);
        fetchSubmissions();
        console.log("Submission deleted successfully");
      } catch (error) {
        console.error("Error deleting submission:", error);
      }
    }
  };

  const handleTableSelect = (event) => {
    setSelectedTable(event.target.value);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleGoBack = () => {
    window.history.back(); // Go back to the previous page
  };
  return (
    <div>
      <div className="container-admin">
        <section className="section-admin">
          <div className="side-line" />
          <div className="side-lines" />
          <div className="admin-controller">Today's Activities</div>
        </section>
        <section className="section-back">
          <FiArrowLeft />
          <div className="back" onClick={() => handleGoBack()}>
            {" "}
            BACK{" "}
          </div>
        </section>
      </div>
      <div className="admin-acts-body">
        <AdminActivitiesSide />
        <div className="pricing-box">
          <div>
            {submissions && (
              <TableContainer
                component={Paper}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  width: "950px",
                }}>
                <div
                  style={{
                    maxHeight: `${rowsPerPage * 53}px`,
                    overflow: "auto",
                  }}>
                  <Table
                    size="small"
                    aria-label="a dense table"
                    {...getTableProps()}>
                    <TableHead style={{ position: "sticky", top: 0 }}>
                      {headerGroups.map((headerGroup) => (
                        <TableRow {...headerGroup.getHeaderGroupProps()}>
                          {headerGroup.headers.map((column) => (
                            <TableCell {...column.getHeaderProps()}>
                              <b>{column.render("Header")}</b>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableHead>
                    <TableBody {...getTableBodyProps()}>
                      {rows.map((row) => {
                        prepareRow(row);
                        const rowStyle = {
                          backgroundColor:
                            row.original.remark === "Approved"
                              ? "rgb(209, 255, 209)"
                              : row.original.remark === "Declined"
                              ? "rgb(255, 184, 184)"
                              : "inherit",
                          color:
                            row.original.remark === "Approved" ||
                            row.original.remark === "Declined"
                              ? "black"
                              : "inherit",
                        };
                        return (
                          <TableRow
                            {...row.getRowProps()}
                            key={row.index}
                            style={rowStyle}>
                            {row.cells.map((cell) => (
                              <TableCell
                                {...cell.getCellProps()}
                                style={rowStyle}>
                                {cell.column.id === "tableData" ? (
                                  <ul>
                                    {cell.value.map((item, index) => (
                                      <li key={index}>{item}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  cell.render("Cell")
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <TablePagination
                  style={{ position: "sticky", top: 0 }}
                  component="div"
                  count={rows.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminActivities;

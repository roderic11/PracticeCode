import React, { useState, useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { BsFillPersonPlusFill, BsThreeDotsVertical } from "react-icons/bs";
import { MdOutlineEmail } from "react-icons/md";
import "./Admin.css";
import axios from "axios";
import FormInputs from "./FormInputs";
import AdminSidebar from "./AdminSideBar";
import Select from "react-select";
import { toast } from "react-toastify";
import { Modal, Backdrop, Fade, Button, Box } from "@mui/material";
import { AiFillCloseCircle } from "react-icons/ai";
import CircularProgress from "@mui/material/CircularProgress";

const Admin = () => {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adminItems, setAdminItems] = useState([]);
  const [roles, setRoles] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState(null);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [editIndex, setEditIndex] = useState(null); // Added new state for tracking the index of the item being edited
  const [showModal2, setShowModal2] = useState(
    Array(adminItems.length).fill(false)
  );
  const [boms, setBOMs] = useState([]);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [showSelect, setShowSelect] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setShowModal2(Array(adminItems.length).fill(false));
  }, [adminItems]);

  const toggleModal2 = (index) => {
    setShowModal2((prevShowModal2) => {
      const newShowModal2 = [...prevShowModal2];
      newShowModal2[index] = !newShowModal2[index];
      return newShowModal2;
    });
  };
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      const response = await axios.get("/api/projects");
      const data = response.data;
      const BOMdata = data.map((project) => ({
        projectId: project.projectId,
        name: project.name,
      }));
      setBOMs(BOMdata);
      console.log("BOM DATA: ", BOMdata);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching data.");
    }
  };
  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "roles") {
      const selectedOptions = Array.from(
        e.target.selectedOptions,
        (option) => option.value
      );
      setRoles(selectedOptions);
    } else if (name === "name") {
      setName(value);
    } else if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
      setShowPassword(false);
    } else if (name === "password2") {
      setPassword2(value);
      setShowPasswords(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
  };

  const handlePasswordConfirm = () => {
    if (password !== password2) {
      toast.error("Passwords do not match");
    }
  };

  const handleAddItem = async () => {
    if (!roles || !name || !email || !password || !password2) {
      toast.error("Please fill in all the required fields");
      return;
    }

    const selectedProjectIds = selectedProjects.map(
      (selectedProject) => selectedProject.value
    );

    const newUser = {
      roles,
      projectId: selectedProjectIds,
      name,
      email,
      photo,
      password,
    };

    try {
      await axios.post("/api/users", newUser);
      setIsLoading(true);
      toast.success("You have Successfully Created a User");
      const response = await axios.get("/api/users/getAllUser");
      setAdminItems(response.data);
      setRoles("");
      setShowSelect(false);
      setName("");
      setEmail("");
      setPhoto(null);
      setPassword("");
      setPassword2("");
      setShowModal(false);
    } catch (error) {
      setIsLoading(false);
      toast.error("Username Already Exist");
      console.log("Error adding user:", error);
    }
  };

  const handleEditItem = async () => {
    const editedUser = {};
    if (!roles || !name || !email || !password || !password2) {
      toast.error("Please fill in all the required fields");
      return;
    }

    if (selectedProjects) {
      editedUser.projectId = selectedProjects;
    }
    if (roles) {
      editedUser.roles = roles;
    }
    if (name) {
      editedUser.name = name;
    }
    if (email) {
      editedUser.email = email;
    }
    if (password) {
      editedUser.password = password;
    }

    try {
      await axios.put(
        `/api/users/updateUser/${adminItems[editIndex]._id}`,
        editedUser
      );

      setIsLoading(true);
      toast.success("You have Successfully Updated a User");
      const response = await axios.get("/api/users/getAllUser");
      setAdminItems(response.data);

      setRoles("");
      setName("");
      setEmail("");
      setPhoto(null);
      setPassword("");
      setPassword2("");
      setShowEditModal(false);
    } catch (error) {
      setIsLoading(false);
      console.log("Error editing user:", error);
    }
  };
  const handleCloseModal = () => {
    setShowModal2(false);
  };
  const handleDeleteItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`/api/users/deleteUser/${id}`);
        toast.success("Deleted Successfully");
        const response = await axios.get("/api/users/getAllUser");
        setAdminItems(response.data);
      } catch (error) {
        toast.error("Error Deleting User");
        console.log("Error deleting user:", error);
      }
    }
  };

  useEffect(() => {
    const fetchAdminItems = async () => {
      try {
        const response = await axios.get("/api/users/getAllUser");
        setAdminItems(response.data);
      } catch (error) {
        console.log("Error fetching admin items:", error);
      }
    };

    fetchAdminItems();
  }, []);

  const handleEditClick = (id) => {
    const index = adminItems.findIndex((item) => item._id === id);
    if (index !== -1) {
      const admin = adminItems[index];
      setRoles(admin.roles);
      setName(admin.name);
      setEmail(admin.email);
      setPhoto(null);
      if (admin.roles.includes("Site Engineer")) {
        setShowSelect(true);
        setSelectedProjects(admin.projectId);
      } else {
        setShowSelect(false);
        setSelectedProjects([]);
      }

      setPassword("");
      setPassword2("");
      setShowEditModal(true);
      setEditIndex(index);
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setRoles("");
    setShowSelect(false);
    setSelectedProjects([]);
    setName("");
    setEmail("");
    setPassword("");
    setPassword2("");
    setShowModal(true);
    setIsLoading(false);
  };
  const options = [
    { value: "Procurement", label: "Procurement" },
    { value: "Operation", label: "Operation" },
    { value: "Inventory Head", label: "Inventory Head" },
    { value: "Site Engineer", label: "Site Engineer" },
    { value: "Foreman", label: "Foreman" },
    { value: "Logistic", label: "Logistic" },
    { value: "Warehouseman", label: "Warehouseman" },
    { value: "Admin", label: "Admin" },
  ];

  const calculateProjectNames = (user) => {
    return user.projectId
      .map((projectId) => {
        const project = boms.find((bom) => bom.projectId === projectId);
        return project ? project.name : projectId;
      })
      .join(", ");
  };
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <>
      <div className="all">
        <div className="container-admin">
          <section className="section-admin">
            <div className="side-line" />
            <div className="side-lines" />
            <div className="admin-controller">Admin Controller</div>
          </section>
          <section className="section-back" onClick={handleGoBack}>
            <FiArrowLeft />
            <div className="back">BACK</div>
          </section>
        </div>
        <div className="main-section">
          <section className="sub-section-1">
            <div className="user-container">
              <div className="User">User</div>
              <div className="admin-per-department">Admin per department</div>
            </div>
            <div className="class-buttons">
              <button
                className="add-user-button-container"
                onClick={handleAddClick}
              >
                <BsFillPersonPlusFill />
                <div className="new-role">New Role</div>
              </button>
            </div>
          </section>
          {showModal && (
            <div className="modal-overlay-admin">
              <div className="modal-content-admin">
                <div className="edit-admin">Add New User</div>
                <div>
                  <div className="permission">
                    by adding a new user you are giving them permission to make
                    changes in this department.
                  </div>
                </div>
                <div className="admin-select">
                  <Select
                    placeholder="Select Role"
                    defaultValue={null}
                    isClearable={true}
                    name="roles"
                    isMulti
                    options={options}
                    className="basic-select"
                    classNamePrefix="select"
                    onChange={(selectedOptions) => {
                      const selectedValues = selectedOptions
                        ? selectedOptions.map((option) => option.value)
                        : [];
                      setRoles(selectedValues);
                      setShowSelect(selectedValues.includes("Site Engineer"));
                    }}
                  />
                </div>

                {showSelect && (
                  <div className="admin-select">
                    <Select
                      options={boms.map((bom) => ({
                        value: bom.projectId,
                        label: bom.name,
                      }))}
                      isMulti
                      placeholder="Assign Project"
                      value={selectedProjects}
                      onChange={setSelectedProjects}
                    />
                  </div>
                )}
                <FormInputs
                  roles={roles}
                  name={name}
                  email={email}
                  password={password}
                  password2={password2}
                  onChange={onChange}
                  handleFileChange={handleFileChange}
                  handlePasswordConfirm={handlePasswordConfirm}
                  showPassword={showPassword}
                  showPasswords={showPasswords}
                  setShowPassword={setShowPassword}
                  setShowPasswords={setShowPasswords}
                />
                {isLoading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100px",

                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <button onClick={handleAddItem}>Add User</button>
                    <button onClick={() => setShowModal(false)}>Cancel</button>
                  </>
                )}
              </div>
            </div>
          )}

          <section className="sub-section-2">
            {adminItems
              .filter(
                (item) =>
                  item.name !== "test1" &&
                  item.name !== "test2" &&
                  item.name !== "test3" &&
                  item.name !== "test4"
              )
              .map((item) => (
                <div className="user-sub-section" key={item._id}>
                  <div className="triple-dot">
                    <div className="dot">
                      <BsThreeDotsVertical
                        onClick={() => {
                          toggleModal2(item._id); // Toggle showModal2 for the clicked user item
                        }}
                      />
                      {showModal2[item._id] && (
                        <div className="dot-menu">
                          <AiFillCloseCircle
                            onClick={() => {
                              toggleModal2(false);
                            }}
                            className="AiFillCloseCircle-admin"
                          />
                          <button
                            onClick={() => {
                              handleEditClick(item._id); // Pass the item's id instead of index
                              toggleModal2(item._id);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteItem(item._id); // Pass the item's id instead of index
                              toggleModal2(item._id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="profile-container">
                    <img
                      alt="User Profile"
                      className="User-Profile"
                      src={
                        item.photo && item.photo.data
                          ? URL.createObjectURL(
                              new Blob([item.photo.data], {
                                type: item.photo.contentType,
                              })
                            )
                          : "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                      }
                    />
                    <div className="active-status" />
                  </div>
                  <div className="employee-name">{item.name}</div>
                  <div className="admin-container">
                    <div className="admin-at">Admin at</div>
                    <div className="department-name">
                      {item.roles && item.roles.length > 0
                        ? item.roles.join(", ")
                        : "No Role"}
                    </div>
                    <div className="department-projectName">
                      {item.projectId && item.projectId.length > 0 ? (
                        <React.Fragment>
                          {item.roles.includes("Site Engineer")
                            ? "in " + calculateProjectNames(item)
                            : ""}
                        </React.Fragment>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                  <div className="email-section">
                    <div className="email-container">
                      <MdOutlineEmail />
                    </div>
                    <div className="employee-email">{item.email}</div>
                  </div>
                </div>
              ))}
          </section>
          {/* Edit Modal */}
          {showEditModal && (
            <div className="modal-overlay-admin">
              <div className="modal-content-admin">
                {/* Modal content for editing user */}
                <div className="edit-admin">Edit User</div>
                <div className="permission">
                  by adding a new user you are giving them permission to make
                  changes in this department.
                </div>
                <div className="admin-select">
                  <Select
                    placeholder="Select Role"
                    defaultValue={null}
                    isClearable={true}
                    name="roles"
                    isMulti
                    options={options}
                    value={options.filter((option) =>
                      roles.includes(option.value)
                    )}
                    className="basic-select"
                    classNamePrefix="select"
                    onChange={(selectedOptions) => {
                      const selectedValues = selectedOptions
                        ? selectedOptions.map((option) => option.value)
                        : [];
                      setRoles(selectedValues);
                      setShowSelect(selectedValues.includes("Site Engineer"));
                    }}
                  />
                </div>

                {showSelect && (
                  <div className="admin-select">
                    <Select
                      options={boms.map((bom) => ({
                        value: bom.projectId,
                        label: bom.name,
                      }))}
                      isMulti
                      placeholder="Assign Project"
                      value={selectedProjects.map((projectId) => ({
                        value: projectId,
                        label:
                          boms.find((item) => item.projectId === projectId)
                            ?.name || "",
                      }))}
                      onChange={(newSelectedOptions) => {
                        const newSelectedProjects = newSelectedOptions.map(
                          (option) => option.value
                        );
                        setSelectedProjects(newSelectedProjects);
                      }}
                    />
                  </div>
                )}
                <FormInputs
                  roles={roles}
                  name={name}
                  email={email}
                  password={password}
                  showPassword={showPassword}
                  showPasswords={showPasswords}
                  password2={password2}
                  onChange={onChange}
                  handleFileChange={handleFileChange}
                  setShowPassword={setShowPassword}
                  setShowPasswords={setShowPasswords}
                  handlePasswordConfirm={handlePasswordConfirm}
                />
                {isLoading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100px",

                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <button onClick={handleEditItem}>Save Changes</button>
                    <button onClick={() => setShowEditModal(false)}>
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Admin;

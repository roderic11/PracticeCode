import { FaSignInAlt, FaSignOutAlt, FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AiFillIdcard } from "react-icons/ai";
import { GiHamburgerMenu } from "react-icons/gi";
import { logout, reset } from "../features/auth/authSlice";
import axios from "axios";
import {
  MdSettings,
  MdAdminPanelSettings,
  MdMonitor,
  MdHealthAndSafety,
} from "react-icons/md";
import { BiGridAlt } from "react-icons/bi";
import { FaWarehouse, FaUserCircle } from "react-icons/fa";
import { BsPersonSquare } from "react-icons/bs";
import {
  MdDashboard,
  MdNotificationsActive,
  MdVerifiedUser,
} from "react-icons/md";
import { RiUserSearchFill } from "react-icons/ri";
import { BsFillCartCheckFill, BsHouseDown } from "react-icons/bs";

function getInitials(name) {
  const words = name.split(" ");
  const initials = words
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
  return initials;
}

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const logoutIdentifier = "unique-logout-identifier";
  const [userItems, setUserItems] = useState([]);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    localStorage.removeItem(logoutIdentifier);
    navigate("/");
  };

  // Listen for storage events
  useEffect(() => {
    const storageChangeHandler = (e) => {
      if (e.key === logoutIdentifier && e.oldValue && !e.newValue) {
        // User logged out in another tab
        onLogout();
      }
    };

    window.addEventListener("storage", storageChangeHandler);

    return () => {
      window.removeEventListener("storage", storageChangeHandler);
    };
  }, []);
  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const response = await axios.get(`/api/users/getUser/${user._id}`);
        const { roles } = response.data;
        setUserItems(roles);
        console.log("User Info", roles);
      } catch (error) {
        console.log("Error fetching user roles:", error);
      }
    };

    if (user) {
      fetchUserRoles();
    }
  }, [dispatch, navigate, user]);

  // Set the logout identifier when the user logs in
  // THis will identify when the user log in. This value will store in local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem(logoutIdentifier, Date.now().toString());
    }
  }, [user]);

  return (
    <div>
      {user ? (
        <>
          <header className="header">
            <div className="left-section">
              <div className="header-company-box">
                <img
                  className="company-logo"
                  src="/LED-COMPANY.png"
                  alt="LED LOGO"
                />
                <div className="company-name">LE&D Electrical Solutions</div>
              </div>
            </div>
            <div className="user-header-name">
              Hello {user && user.name ? user.name.split(" ")[0] : ""}!
            </div>
            <div className="right-section">
              <div className="header-user-logo">
                {user && user.name ? getInitials(user.name) : "NA"}
                <div class="tooltip">
                  <div className="tooltip1">
                    <MdVerifiedUser />

                    <div>{userItems.join([", "])}</div>
                  </div>
                </div>
              </div>

              <button className="btn-header" onClick={onLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </header>
          <div className="sidebar">
            <div>
              <a href="/" className="sidebar-link">
                <div className="img">
                  <MdDashboard className="sidebar-icon" />
                </div>
                <div>Dashboard</div>
              </a>
              <a href="/Admin" className="sidebar-link">
                <div className="img">
                  <MdAdminPanelSettings className="sidebar-icon" />
                </div>
                <div>Admin Controller</div>
              </a>
              <a href="/Inventory" className="sidebar-link">
                <div className="img">
                  <FaWarehouse className="sidebar-icon" />
                </div>
                <div>Warehouse</div>
              </a>
              <a href="/procurementDash" className="sidebar-link">
                <div className="img">
                  <BsFillCartCheckFill className="sidebar-icon" />
                </div>
                <div>Procurement</div>
              </a>
              <a href="/officialOperationDash" className="sidebar-link">
                <div className="img">
                  <MdMonitor className="sidebar-icon" />
                </div>
                <div>Operation</div>
              </a>
              <a href="/unknown" className="sidebar-link">
                <div className="img">
                  <RiUserSearchFill className="sidebar-icon" />
                </div>
                <div>Human Resource</div>
              </a>
              <a href="/unknown" className="sidebar-link">
                <div className="img">
                  <MdHealthAndSafety className="sidebar-icon" />
                </div>
                <div>Environment Health and Safety</div>
              </a>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Header;

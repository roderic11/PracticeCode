import { useState, useEffect } from "react";
import { FaSignInAlt } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { login, reset } from "../features/auth/authSlice";
import Spinner from "../components/Spinner";
import "./Login.css";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [text, setText] = useState(
    "We Provide The Best Solutions for your Worst Issues."
  );
  const [delay, setDelay] = useState(70);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText((prevText) => prevText + text[currentIndex]);
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  useEffect(() => {
    setText("We Provide The Best Solutions for your Worst Issues.");
  }, []);
  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess || user) {
      navigate("/Dashboard");
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const userData = {
      email,
      password,
    };

    dispatch(login(userData));
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <>
      <div>
        <div className="login-container">
          <div className="login-form">
            <form onSubmit={onSubmit}>
              <div className="Head">
                <img
                  src="/LED-LOGO.png"
                  alt="LE&D Logo"
                  className="company-login-logo"
                />
                <h2>LE&amp;D Electrical Solutions</h2>
                <h4>Login to your Account</h4>
              </div>
              <div className="form-group">
                <label htmlFor="email-input">Enter your Username:</label>
                <input
                  type="username"
                  id="email-input"
                  name="email"
                  value={email}
                  className="input-field email-input"
                  placeholder="Username"
                  onChange={onChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password-input">Enter your Password:</label>
                <input
                  type="password"
                  id="password-input"
                  className="input-field password-input"
                  name="password"
                  value={password}
                  placeholder="Password"
                  onChange={onChange}
                />
              </div>
              <button type="submit" className="button">
                Sign In
              </button>
            </form>
          </div>
          <div className="overlay">
            <div className="side-line-log" />
            <div className="side-lines-log" />
            <div className="current-text-login">{currentText}</div>
          </div>
          <div className="login-image" />
        </div>
      </div>
    </>
  );
}

export default Login;

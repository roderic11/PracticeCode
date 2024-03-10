import React from "react";
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";

const FormInputs = ({
  name,
  email,
  password,
  password2,
  onChange,
  handleFileChange,
  handlePasswordConfirm,
  showPassword,
  setShowPassword,
  showPasswords,
  setShowPasswords,
}) => {
  return (
    <>
      <input
        type="text"
        id="name"
        name="name"
        value={name}
        onChange={onChange}
        placeholder="Set Fullname"
      />

      <input
        type="text"
        id="email"
        name="email"
        value={email}
        onChange={onChange}
        placeholder="Set Username"
      />

      {/*<input type="file" accept="image/*" onChange={handleFileChange} /> */}
      <div className="password-container">
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
          value={password}
          placeholder="Set password"
          onChange={onChange}
        />
        {showPassword ? (
          <AiFillEye
            className="password-eye"
            onClick={() => setShowPassword(false)}
          />
        ) : (
          <AiFillEyeInvisible
            className="password-eye"
            onClick={() => setShowPassword(true)}
          />
        )}
      </div>
      <div className="password-container">
        <input
          type={showPasswords ? "text" : "password"}
          className="form-control"
          id="password2"
          name="password2"
          value={password2}
          placeholder="Confirm password"
          onChange={onChange}
          onBlur={handlePasswordConfirm}
        />
        {showPasswords ? (
          <AiFillEye
            className="password-eye"
            onClick={() => setShowPasswords(false)}
          />
        ) : (
          <AiFillEyeInvisible
            className="password-eye"
            onClick={() => setShowPasswords(true)}
          />
        )}
      </div>
    </>
  );
};

export default FormInputs;

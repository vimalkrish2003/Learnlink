import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faEnvelope, faKey } from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import "./login.css"
import { Link } from "react-router-dom";


function LoginPage() {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const initialValues = { email: "", password: "", otp: "" };
  const [values, setValues] = useState({ ...initialValues, confirm_password: "" });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerify, setIsOtpVerify] = useState(false);
  const [otpError, setOtpError] = useState("");

  const handleSignUpClick = () => {
    setIsSignUpMode(true);
  };

  const handleSignInClick = () => {
    setIsSignUpMode(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const handleOtpSend = () => {
    if (!values.email) {
      setOtpError("Email is required to send OTP");
      return;
    }
    // Simulate OTP sending
    console.log("Sending OTP to", values.email);
    setIsOtpSent(true);
    setOtpError("");
  };

  const handleOtpSubmit = () => {
    if (values.otp.length !== 6 || isNaN(values.otp)) {
      setOtpError("Invalid OTP. Please enter a 6-digit numeric OTP.");
      return;
    }
    setOtpError("");
    setIsOtpVerify(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmit(true);
    const errors = validate(values);
    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      console.log("Submitting form...");
      if (!isSignUpMode) {
        console.log("Form values:", values);
      } else {
        if (isOtpSent && isOtpVerify) {
          console.log("Sign Up values:", values);
        }
      }
    }
  };

  useEffect(() => {
    if (isSubmit && Object.keys(formErrors).length === 0) {
      console.log("Form submitted successfully");
    }
  }, [formErrors, isSubmit]);

  const validate = (val) => {
    const errors = {}
    const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    const password_pattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/;
    if (isSubmit) {
      if (!val.email) {
        errors.email = "Email is required";
      } else if (!regex.test(val.email)) {
        errors.email = "Not a valid email format";
      }
      if (!val.password) {
        errors.password = "Password is required";
      } else if (!password_pattern.test(val.password)) {
        errors.password = "Password: 8-16 chars, 1 digit, 1 lowercase, 1 uppercase, 1 special, no spaces";
      }
      if (isSignUpMode) {
        if (!val.confirm_password || val.confirm_password !== val.password) {
          errors.confirm_password = "Passwords do not match";
        }
      }
    }
    return errors;
  }

  return (
    <div className={`loginContainer ${isSignUpMode ? 'sign-up-mode' : ''}`}>
      <div className="forms-container">
        <div className="signin-signup">
          <form action="#" className="sign-in-form loginForm" onSubmit={handleSubmit}>
            <h2 className="title">Sign in</h2>
            <div className="input-field">
              <FontAwesomeIcon icon={faEnvelope} className='my-auto mx-auto' />
              <input name='email' className='LoginInput' type="email" placeholder="Email" value={values.email} onChange={handleChange} />
            </div>
            <p className='errormsg'>{formErrors.email}</p>
            <div className="input-field">
              <FontAwesomeIcon icon={faLock} className='my-auto mx-auto' />
              <input name='password' className='LoginInput' type="password" placeholder="Password" value={values.password} onChange={handleChange} />
            </div>
            <p className='errormsg'>{formErrors.password}</p>
            <button className='btn' onClick={handleSubmit} type='submit'>Sign In</button>

            <p className="social-text loginp">Sign in with social platforms</p>
            <div className="social-media">
              <a href="#" className="social-icon">
                <FontAwesomeIcon icon={faGoogle} className='my-auto mx-auto' />
              </a>
              <a href="#" className="social-icon">
                <FontAwesomeIcon icon={faLinkedinIn} className='my-auto mx-auto' />
              </a>
            </div>
          </form>

          <form action="#" className="sign-up-form loginForm" onSubmit={handleSubmit}>
            <h2 className="title">Sign up</h2>
            <div className="input-field">
              <FontAwesomeIcon icon={faEnvelope} className='my-auto mx-auto' />
              <input name='email' className='LoginInput' type="email" placeholder="Email" value={values.email} onChange={handleChange} />
              <button type="button" className="otp-btn" onClick={handleOtpSend}>Verify</button>
            </div>
            <p className='errormsg'>{formErrors.email}</p>
            <p className='errormsg'>{otpError}</p>

            {isOtpSent && (
              <div className="input-field">
                <FontAwesomeIcon icon={faKey} className='my-auto mx-auto' />
                <input name='otp' className='LoginInput' type="text" placeholder="Enter OTP" value={values.otp} onChange={handleChange} />
                <button type="button" className="otp-btn" onClick={handleOtpSubmit}>Submit</button>
              </div>
            )}
            <p className='errormsg'>{formErrors.otp}</p>
            {isOtpVerify && (
              <>
                <div className="input-field">
                  <FontAwesomeIcon icon={faLock} className='my-auto mx-auto' />
                  <input name='password' className='LoginInput' type="password" placeholder="Password" value={values.password} onChange={handleChange} />
                </div>
                <p className='errormsg'>{formErrors.password}</p>
                <div className="input-field">
                  <FontAwesomeIcon icon={faLock} className='my-auto mx-auto' />
                  <input name='confirm_password' className='LoginInput' type='password' placeholder="Enter Confirm Password" value={values.confirm_password} onChange={handleChange} />
                </div>
                <p className='errormsg'>{formErrors.confirm_password}</p>
              </>
            )}
            <button className='btn' onClick={handleSubmit}>Sign Up</button>

            <p className="social-text loginp">Or Sign up with social platforms</p>
            <div className="social-media">
              <a href="#" className="social-icon">
                <FontAwesomeIcon icon={faGoogle} className='my-auto mx-auto' />
              </a>
              <a href="#" className="social-icon">
                <FontAwesomeIcon icon={faLinkedinIn} className='my-auto mx-auto' />
              </a>
            </div>
          </form>
        </div>
      </div>
      <div className="panels-container">
        <div className="panel left-panel">
          <div className="content">
            <h3 className='loginh3'>New here?</h3>
            <p className='loginp'>
              Don't dream about success. Get out there and work for it.
            </p>
            <button className="btn transparent" onClick={handleSignUpClick}>
              Sign up
            </button>
          </div>
          <img src="/img/dogLogin1.svg" className="image" alt="" />
        </div>
        <div className="panel right-panel">
          <div className="content">
            <h3 className='loginh3'>One of us?</h3>
            <p className='loginp'>
              Start where you are. Use what you have. Do what you can.
            </p>
            <button onClick={handleSignInClick} className="btn transparent" id="sign-in-btn">
              Sign in
            </button>
          </div>
          <img src="/img/dogLogin.svg" className="image" alt="" />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

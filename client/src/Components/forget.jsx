import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';

// Keyframes for Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f7fa;
  overflow: hidden;
  position: relative;
`;

const Title = styled.h1`
  animation: ${fadeIn} 1s ease-in-out;
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: #444;
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${fadeIn} 1s ease-in-out;
`;

const Input = styled.input`
  width: 300px;
  padding: 15px;
  margin: 10px 0;
  border: 1px solid ${(props) => (props.hasError ? '#ff6b00' : '#ddd')};
  border-radius: 5px;
  font-size: 16px;
`;

const Button = styled.button`
  width: 320px;
  padding: 15px;
  margin-top: 20px;
  background-color: #ff6b00;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 18px;
  cursor: pointer;

  &:hover {
    background-color: #ff8c1a;
  }
`;

const ErrorMessage = styled.span`
  color: #ff6b00;
  margin-top: -10px;
  font-size: 14px;
`;

const ProgressBarContainer = styled.div`
  width: 320px;
  height: 10px;
  background-color: #ddd;
  border-radius: 5px;
  margin: 20px 0;
`;

const ProgressBar = styled.div`
  height: 100%;
  background-color: #ff6b00;
  border-radius: 5px;
  ${({ progress }) =>
    css`
      width: ${progress};
      transition: width 0.5s;
    `}
`;

const LayeredWaves = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 200px;
  background: linear-gradient(to top, #FF9933, #FF7F26, #FF6B00);
  clip-path: path('M0,160 C480,240 960,80 1440,160 L1440,320 L0,320 Z');
`;

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    let valid = true;
    const newErrors = {};

    if (
      step === 1 &&
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)
    ) {
      newErrors.email = 'Please enter a valid email address';
      valid = false;
    }

    if (step === 2 && otp.length < 4) {
      newErrors.otp = 'OTP must be at least 4 characters long';
      valid = false;
    }

    if (step === 3) {
      if (
        !/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/.test(
          password
        )
      ) {
        newErrors.password =
          'Password: 8-16 chars, 1 digit, 1 lowercase, 1 uppercase, 1 special, no spaces';
        valid = false;
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleAction = () => {
    if (validate()) {
      if (step === 3) {
        console.log({
          email,
          otp,
          password,
          confirmPassword
        });
        alert('Password reset successful!');
      } else {
        setStep(step + 1);
      }
    }
  };

  const getProgressPercentage = () => {
    switch (step) {
      case 1:
        return '33%';
      case 2:
        return '66%';
      case 3:
        return '100%';
      default:
        return '0%';
    }
  };

  return (
    <Container>
      <Title>FORGOT PASSWORD</Title>
      <ProgressBarContainer>
        <ProgressBar progress={getProgressPercentage()} />
      </ProgressBarContainer>
      {step === 1 && (
        <Step>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            hasError={!!errors.email}
          />
          {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          <Button onClick={handleAction}>Send OTP</Button>
        </Step>
      )}
      {step === 2 && (
        <Step>
          <Input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            hasError={!!errors.otp}
          />
          {errors.otp && <ErrorMessage>{errors.otp}</ErrorMessage>}
          <Button onClick={handleAction}>Verify OTP</Button>
        </Step>
      )}
      {step === 3 && (
        <Step>
          <Input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hasError={!!errors.password}
          />
          {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          <Input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            hasError={!!errors.confirmPassword}
          />
          {errors.confirmPassword && (
            <ErrorMessage>{errors.confirmPassword}</ErrorMessage>)}
          <Button onClick={handleAction}>Reset Password</Button>
        </Step>
      )}

      {/* Single Layered Wave at the Bottom */}
      <LayeredWaves />
    </Container>
  );
};

export default ForgotPassword;

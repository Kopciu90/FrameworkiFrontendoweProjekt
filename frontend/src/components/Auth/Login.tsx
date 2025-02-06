import React, { useState } from "react";
import styled from "styled-components";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";

const AuthWrapper = styled.section`
  max-width: 30rem;
  margin: 80px auto;
  padding: 2rem;
  border-radius: 0.75rem;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const StyledLabel = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
`;

const StyledInput = styled.input`
  height: 2.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.5rem;
  font-size: 1rem;
`;

const SubmitButton = styled.button`
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: bold;
  width: 100%;
  background-color: #111827;
  color: #ffffff;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.3s;
  &:hover {
    background-color: #1f2937;
  }
`;

const SwitchAuth = styled.div`
  text-align: center;
  margin-top: 1rem;
`;

const Login = () => {
    const { login } = useAuth();
    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(userEmail, userPassword);
        } catch (error) {
            console.error("Authentication failed:", error);
        }
    };

    return (
        <AuthWrapper>
            <Header>
                <h2>Sign In</h2>
                <p>Access your account by entering your credentials below</p>
            </Header>
            <StyledForm onSubmit={handleLogin}>
                <Field>
                    <StyledLabel>Email Address</StyledLabel>
                    <StyledInput type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                </Field>
                <Field>
                    <StyledLabel>Password</StyledLabel>
                    <StyledInput type="password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} />
                </Field>
                <SubmitButton type="submit">Login</SubmitButton>
            </StyledForm>
            <SwitchAuth>
                <p>
                    New here? <Link to="/register">Create an account</Link>
                </p>
            </SwitchAuth>
        </AuthWrapper>
    );
};

export default Login;

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../services/api";
import { useNavigate } from "react-router";

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

const EditProfile = () => {
    const { user, fetchMyProfile } = useAuth();
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            await fetchMyProfile();
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        if (user && formData.username === "") {
            setFormData({ username: user.username, email: user.email, password: "" });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put(`/user/edit/${user?._id}`, formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            navigate(`/${formData.username}`);
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

    return (
        <AuthWrapper>
            <Header>
                <h1>Profile</h1>
                <p>Edit your profile details below</p>
            </Header>
            <StyledForm onSubmit={handleSubmit}>
                <Field>
                    <StyledLabel>Username</StyledLabel>
                    <StyledInput type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Enter username" />
                </Field>
                <Field>
                    <StyledLabel>Email</StyledLabel>
                    <StyledInput type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter email" />
                </Field>
                <Field>
                    <StyledLabel>New Password</StyledLabel>
                    <StyledInput type="password" name="password" value={formData.password} onChange={handleChange} />
                </Field>
                <SubmitButton type="submit">Update Profile</SubmitButton>
            </StyledForm>
        </AuthWrapper>
    );
};

export default EditProfile;

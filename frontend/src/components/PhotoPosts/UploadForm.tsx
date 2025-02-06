import React, { useState } from "react";
import styled from "styled-components";
import { api } from "../../services/api";
import { useNavigate } from "react-router";

const Container = styled.section`
  max-width: 30rem;
  margin: 5rem auto;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  margin-bottom: 10px;
  text-align: center;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputField = styled.input`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  &:hover {
    background: #0056b3;
  }
`;

const UploadForm = () => {
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return alert("Please select a file.");

        const formData = new FormData();
        formData.append("description", description);
        formData.append("photo", file);

        try {
            await api.post("/photos", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            navigate("/photos");
        } catch (error) {
            console.error("Failed to upload photo:", error);
        }
    };

    return (
        <Container>
            <Title>Upload a New Photo</Title>
            <Form onSubmit={handleSubmit}>
                <InputField type="text" placeholder="Enter a description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                <InputField type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
                <Button type="submit">Upload</Button>
            </Form>
        </Container>
    );
};

export default UploadForm;

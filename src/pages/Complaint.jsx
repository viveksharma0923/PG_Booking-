import React, { useState } from "react";
import { submitComplaint } from "../api";
import { useNavigate } from "react-router-dom";

const Complaint = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const [formData, setFormData] = useState({
        student_name: user?.full_name || "",
        phone: user?.phone || "",
        complaint_type: "",
        description: "",
    });
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] = useState("complaint");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await submitComplaint({ user_id: user.user_id, ...formData });
            setMessage("Complaint registered successfully!");
            setFormData({ ...formData, complaint_type: "", description: "" });
        } catch (err) {
            setMessage("Failed to submit complaint.");
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <h1 style={styles.title}>PG Booking System</h1>
                <button onClick={() => { localStorage.removeItem("user"); navigate("/login"); }} style={styles.logoutButton}>
                    Logout
                </button>
            </div>

            <div style={styles.tabContainer}>
                <button
                    style={activeTab === "book" ? styles.tabActive : styles.tab}
                    onClick={() => navigate("/rooms")}
                >
                    Book Room
                </button>
                <button
                    style={activeTab === "complaint" ? styles.tabActive : styles.tab}
                    onClick={() => setActiveTab("complaint")}
                >
                    Register Complaint
                </button>
            </div>

            {message && <div style={styles.successMessage}>{message}</div>}

            <div style={styles.container}>
                <h2 style={styles.formTitle}>Register Complaint</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        type="text"
                        name="student_name"
                        placeholder="Your Name"
                        value={formData.student_name}
                        onChange={handleChange}
                        style={styles.input}
                        disabled
                    />
                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        style={styles.input}
                        disabled
                    />
                    <select
                        name="complaint_type"
                        value={formData.complaint_type}
                        onChange={handleChange}
                        style={styles.select}
                        required
                    >
                        <option value="">Select Issue Type</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Food">Food</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Other">Other</option>
                    </select>
                    <textarea
                        name="description"
                        placeholder="Describe your problem..."
                        value={formData.description}
                        onChange={handleChange}
                        style={styles.textarea}
                        required
                    />
                    <button type="submit" style={styles.button}>Submit Complaint</button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    page: {
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
    },
    header: {
        backgroundColor: "#2563eb",
        padding: "2rem",
        textAlign: "center",
        position: "relative",
    },
    logoutButton: {
        position: "absolute",
        top: "2rem",
        right: "2rem",
        padding: "0.5rem 1.5rem",
        backgroundColor: "white",
        color: "#2563eb",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "500",
    },
    title: {
        color: "white",
        margin: 0,
        fontSize: "2.5rem",
        fontWeight: "bold",
    },
    tabContainer: {
        display: "flex",
        justifyContent: "center",
        gap: "1rem",
        padding: "2rem 0 1rem 0",
    },
    tab: {
        padding: "0.75rem 2rem",
        fontSize: "1rem",
        backgroundColor: "#e5e7eb",
        color: "#6b7280",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "500",
    },
    tabActive: {
        padding: "0.75rem 2rem",
        fontSize: "1rem",
        backgroundColor: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "500",
    },
    successMessage: {
        backgroundColor: "#dbeafe",
        color: "#1e40af",
        padding: "1rem",
        margin: "0 auto 1rem auto",
        maxWidth: "900px",
        borderRadius: "8px",
        textAlign: "center",
    },
    container: {
        maxWidth: "900px",
        margin: "0 auto 2rem auto",
        padding: "2.5rem",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    formTitle: {
        color: "#1e40af",
        textAlign: "center",
        marginBottom: "2rem",
        fontSize: "1.75rem",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
    },
    input: {
        padding: "0.875rem",
        fontSize: "1rem",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        backgroundColor: "#f9fafb",
    },
    select: {
        padding: "0.875rem",
        fontSize: "1rem",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        backgroundColor: "white",
        color: "#6b7280",
    },
    textarea: {
        padding: "0.875rem",
        fontSize: "1rem",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        minHeight: "120px",
        fontFamily: "inherit",
        resize: "vertical",
    },
    button: {
        padding: "0.875rem",
        fontSize: "1.125rem",
        backgroundColor: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "500",
    },
};

export default Complaint;

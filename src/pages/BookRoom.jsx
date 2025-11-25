import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { bookRoom } from "../api";

const BookRoom = () => {
    const { roomNumber } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const [formData, setFormData] = useState({
        student_name: "",
        phone: "",
        meals: false,
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === "phone" && value.length > 10) return;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await bookRoom({
                user_id: user.user_id,
                room_number: parseInt(roomNumber),
                ...formData,
            });
            alert("Booking Successful!");
            navigate("/my-bookings");
        } catch (err) {
            setError(err.response?.data?.error || "Booking failed");
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

            <div style={styles.container}>
                <h2 style={styles.formTitle}>Book Room {roomNumber}</h2>
                {error && <p style={styles.error}>{error}</p>}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        type="text"
                        name="student_name"
                        placeholder="Student Name"
                        value={formData.student_name}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />
                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        style={styles.input}
                        required
                        maxLength={10}
                    />
                    <label style={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            name="meals"
                            checked={formData.meals}
                            onChange={handleChange}
                            style={styles.checkbox}
                        />
                        <span>Include Meals (+₹3000)</span>
                    </label>
                    <button type="submit" style={styles.button}>Confirm Booking</button>
                    <button
                        type="button"
                        onClick={() => navigate("/rooms")}
                        style={styles.cancelButton}
                    >
                        Cancel
                    </button>
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
    container: {
        maxWidth: "600px",
        margin: "2rem auto",
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
    },
    checkboxLabel: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.875rem",
        backgroundColor: "#f9fafb",
        borderRadius: "6px",
        cursor: "pointer",
    },
    checkbox: {
        width: "18px",
        height: "18px",
        cursor: "pointer",
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
    cancelButton: {
        padding: "0.875rem",
        fontSize: "1rem",
        backgroundColor: "#e5e7eb",
        color: "#4b5563",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "500",
    },
    error: {
        color: "#dc2626",
        textAlign: "center",
        padding: "1rem",
        backgroundColor: "#fee2e2",
        borderRadius: "6px",
        marginBottom: "1rem",
    },
};

export default BookRoom;

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api";

const Register = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        full_name: "",
        phone: "",
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "phone" && value.length > 10) return;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.error || "Registration failed");
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>PG Booking</h1>
            {error && <p style={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    style={styles.input}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    style={styles.input}
                    required
                />
                <input
                    type="text"
                    name="full_name"
                    placeholder="Full Name"
                    value={formData.full_name}
                    onChange={handleChange}
                    style={styles.input}
                    required
                />
                <input
                    type="text"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                    style={styles.input}
                    required
                    maxLength={10}
                />
                <button type="submit" style={styles.button}>Register</button>
            </form>
            <p style={{ marginTop: "1rem" }}>
                <Link to="/login" style={styles.link}>Login</Link>
            </p>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: "400px",
        margin: "2rem auto",
        padding: "2rem",
        border: "1px solid #ccc",
        borderRadius: "8px",
        textAlign: "center",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
    },
    input: {
        padding: "0.5rem",
        fontSize: "1rem",
    },
    button: {
        padding: "0.5rem",
        fontSize: "1rem",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        cursor: "pointer",
        borderRadius: "4px",
    },
    error: {
        color: "red",
    },
    header: {
        marginBottom: "1rem",
        color: "#007bff",
    },
    link: {
        color: "#007bff",
        textDecoration: "none",
        fontWeight: "bold",
    },
};

export default Register;

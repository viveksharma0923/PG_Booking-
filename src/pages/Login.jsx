import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api";

const Login = () => {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await login(formData);
            localStorage.setItem("user", JSON.stringify(response.data));
            navigate(response.data.role === "admin" ? "/admin/users" : "/rooms");
        } catch (err) {
            setError(err.response?.data?.error || "Login failed");
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
                <button type="submit" style={styles.button}>Login</button>
            </form>
            <p style={{ marginTop: "1rem" }}>
                <Link to="/register" style={styles.link}>Register</Link>
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

export default Login;

import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <nav style={styles.nav}>
            <div style={styles.logo}>PG Booking</div>
            <ul style={styles.links}>
                {!user ? (
                    <>
                        <li><Link to="/login" style={styles.link}>Login</Link></li>
                        <li><Link to="/register" style={styles.link}>Register</Link></li>
                    </>
                ) : (
                    <>
                        {user.role === "admin" ? (
                            <>
                                <li><Link to="/admin/users" style={styles.link}>Users</Link></li>
                                <li><Link to="/admin/bookings" style={styles.link}>All Bookings</Link></li>
                            </>
                        ) : (
                            <>
                                <li><Link to="/rooms" style={styles.link}>Rooms</Link></li>
                                <li><Link to="/complaint" style={styles.link}>Complaint</Link></li>
                                <li><Link to="/my-bookings" style={styles.link}>My Bookings</Link></li>
                            </>
                        )}
                        <li>
                            <button onClick={handleLogout} style={styles.button}>Logout ({user.username})</button>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

const styles = {
    nav: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        backgroundColor: "#333",
        color: "#fff",
    },
    logo: {
        fontSize: "1.5rem",
        fontWeight: "bold",
    },
    links: {
        display: "flex",
        listStyle: "none",
        gap: "1.5rem",
    },
    link: {
        color: "#fff",
        textDecoration: "none",
        fontSize: "1rem",
    },
    button: {
        backgroundColor: "transparent",
        border: "1px solid #fff",
        color: "#fff",
        padding: "0.5rem 1rem",
        cursor: "pointer",
        borderRadius: "4px",
    },
};

export default Navbar;

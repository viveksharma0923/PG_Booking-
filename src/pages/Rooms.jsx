import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getRooms } from "../api";

const Rooms = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("book");

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await getRooms();
                setRooms(response.data);
            } catch (err) {
                setError("Failed to fetch rooms");
            }
        };
        fetchRooms();
    }, []);

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
                    onClick={() => setActiveTab("book")}
                >
                    Book Room
                </button>
                <button
                    style={activeTab === "complaint" ? styles.tabActive : styles.tab}
                    onClick={() => navigate("/complaint")}
                >
                    Register Complaint
                </button>
            </div>

            <div style={styles.container}>
                <h2 style={styles.pageTitle}>Available Rooms</h2>
                {error && <p style={styles.error}>{error}</p>}
                <div style={styles.grid}>
                    {rooms.map((room) => (
                        <div key={room.id} style={styles.card}>
                            <h3 style={styles.roomNumber}>Room {room.room_number}</h3>
                            <div style={styles.details}>
                                <p style={styles.detailItem}><strong>Type:</strong> {room.room_type}</p>
                                <p style={styles.detailItem}><strong>Beds:</strong> {room.beds}</p>
                                <p style={styles.price}>₹{room.price}/month</p>
                            </div>
                            <Link to={`/book/${room.room_number}`} style={styles.button}>Book Now</Link>
                        </div>
                    ))}
                </div>
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
    container: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 2rem 2rem 2rem",
    },
    pageTitle: {
        color: "#1e40af",
        textAlign: "center",
        marginBottom: "2rem",
        fontSize: "1.75rem",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "1.5rem",
    },
    card: {
        backgroundColor: "white",
        padding: "1.5rem",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
    },
    roomNumber: {
        color: "#1e40af",
        margin: 0,
        fontSize: "1.5rem",
    },
    details: {
        flex: 1,
    },
    detailItem: {
        margin: "0.5rem 0",
        color: "#4b5563",
    },
    price: {
        fontSize: "1.25rem",
        fontWeight: "bold",
        color: "#2563eb",
        margin: "0.5rem 0",
    },
    button: {
        display: "inline-block",
        padding: "0.75rem 1.5rem",
        backgroundColor: "#2563eb",
        color: "white",
        textDecoration: "none",
        borderRadius: "6px",
        fontWeight: "500",
        fontSize: "1rem",
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

export default Rooms;

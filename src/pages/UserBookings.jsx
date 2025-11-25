import React, { useEffect, useState } from "react";
import { getUserBookings, deleteBooking } from "../api";

const UserBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState("");
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await getUserBookings(user.user_id);
                setBookings(response.data);
            } catch (err) {
                setError("Failed to fetch your bookings");
            }
        };
        if (user) fetchBookings();
    }, [user]);

    const handleDelete = async (bookingId) => {
        if (window.confirm("Are you sure you want to delete this booking?")) {
            try {
                await deleteBooking(bookingId);
                setBookings(bookings.filter((b) => b.id !== bookingId));
            } catch (err) {
                alert("Failed to delete booking");
            }
        }
    };

    return (
        <div style={styles.container}>
            <h2>My Bookings</h2>
            {error && <p style={styles.error}>{error}</p>}
            {bookings.length === 0 ? (
                <p>No bookings found.</p>
            ) : (
                <div style={styles.grid}>
                    {bookings.map((b) => (
                        <div key={b.id} style={styles.card}>
                            <h3>Room {b.room_number}</h3>
                            <p>Type: {b.room_type}</p>
                            <p>Student: {b.student_name}</p>
                            <p>Meals: {b.meals ? "Yes" : "No"}</p>
                            <p>Total Price: ₹{b.total_price}</p>
                            <button
                                onClick={() => handleDelete(b.id)}
                                style={styles.deleteButton}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { padding: "2rem" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" },
    card: { border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" },
    deleteButton: {
        marginTop: "1rem",
        padding: "0.5rem 1rem",
        backgroundColor: "#dc3545",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
    },
    error: { color: "red" },
};

export default UserBookings;

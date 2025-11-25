import React, { useEffect, useState } from "react";
import { getAdminBookings } from "../api";

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await getAdminBookings();
                console.log("Admin Bookings Response:", response);
                console.log("Admin Bookings Data:", response.data);
                setBookings(response.data);
            } catch (err) {
                console.error("Error fetching bookings:", err);
                console.error("Error response:", err.response);
                setError(err.response?.data?.error || "Failed to fetch bookings");
            }
        };
        fetchBookings();
    }, []);

    return (
        <div style={styles.container}>
            <h2>All Bookings</h2>
            {error && <p style={styles.error}>{error}</p>}
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Student</th>
                        <th>Room</th>
                        <th>Type</th>
                        <th>Meals</th>
                        <th>Total</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map((b) => (
                        <tr key={b.id}>
                            <td>{b.id}</td>
                            <td>{b.student_name}</td>
                            <td>{b.room_number}</td>
                            <td>{b.room_type}</td>
                            <td>{b.meals ? "Yes" : "No"}</td>
                            <td>₹{b.total_price}</td>
                            <td>{b.booking_date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const styles = {
    container: { padding: "2rem" },
    table: { width: "100%", borderCollapse: "collapse", marginTop: "1rem" },
    error: { color: "red" },
};

export default AdminBookings;

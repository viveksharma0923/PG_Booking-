import React, { useEffect, useState } from "react";
import { getAdminComplaints } from "../api";
import { useNavigate } from "react-router-dom";

const AdminComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true); // Add loading state
    const navigate = useNavigate();

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                setLoading(true);
                const response = await getAdminComplaints();
                // Check the actual response structure
                setComplaints(response.data || response);
            } catch (err) {
                console.error("Error fetching complaints:", err);
                setError("Failed to fetch complaints");
            } finally {
                setLoading(false);
            }
        };
        fetchComplaints();
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2>User Complaints</h2>
                <button onClick={() => navigate("/admin/users")} style={styles.backButton}>Back to Dashboard</button>
            </div>
            {error && <p style={styles.error}>{error}</p>}
            {loading ? (
                <p>Loading complaints...</p>
            ) : complaints.length === 0 ? (
                <p>No complaints found.</p>
            ) : (
                <div style={styles.grid}>
                    {complaints.map((c, index) => (
                        <div key={c.id || index} style={styles.card}>
                            <h3>{c.complaint_type}</h3>
                            <p><strong>Student:</strong> {c.student_name} ({c.phone})</p>
                            <p><strong>Description:</strong> {c.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
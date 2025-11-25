import React, { useEffect, useState } from "react";
import { getAdminUsers, adminAddUser, deleteUser } from "../api";
import { useNavigate } from "react-router-dom";

const AdminUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        full_name: "",
        phone: "",
        role: "user",
    });
    const [error, setError] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await getAdminUsers();
            setUsers(response.data);
        } catch (err) {
            setError("Failed to fetch users");
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await adminAddUser(formData);
            fetchUsers();
            setFormData({ username: "", password: "", full_name: "", phone: "", role: "user" });
        } catch (err) {
            setError("Failed to add user");
        }
    };


    const handleDelete = async (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                console.log("Attempting to delete user with ID:", userId);
                await deleteUser(userId);
                alert("User deleted successfully!");
                fetchUsers();
            } catch (err) {
                console.error("Delete error:", err);
                const errorMsg = err.response?.data?.error || err.message || "Failed to delete user";
                setError(errorMsg);
                alert(`Error: ${errorMsg}`);
            }
        }
    };


    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2>Manage Users</h2>
                <div style={styles.headerButtons}>
                    <button onClick={() => navigate("/admin/complaints")} style={styles.navButton}>View Complaints</button>
                    <button onClick={() => { localStorage.removeItem("user"); navigate("/login"); }} style={styles.logoutButton}>Logout</button>
                </div>
            </div>
            {error && <p style={styles.error}>{error}</p>}

            <form onSubmit={handleSubmit} style={styles.form}>
                <h3>Add New User</h3>
                <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} style={styles.input} required />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} style={styles.input} required />
                <input type="text" name="full_name" placeholder="Full Name" value={formData.full_name} onChange={handleChange} style={styles.input} required />
                <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} style={styles.input} required />
                <select name="role" value={formData.role} onChange={handleChange} style={styles.input}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
                <button type="submit" style={styles.button}>Add User</button>
            </form>

            <h3>Existing Users</h3>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Full Name</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.username}</td>
                            <td>{u.full_name}</td>
                            <td>{u.phone}</td>
                            <td>{u.role}</td>
                            <td>
                                <button
                                    onClick={() => handleDelete(u.id)}
                                    style={styles.deleteButton}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const styles = {
    container: { padding: "2rem" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" },
    headerButtons: { display: "flex", gap: "1rem" },
    navButton: { padding: "0.5rem 1rem", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
    logoutButton: { padding: "0.5rem 1rem", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
    form: { display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" },
    input: { padding: "0.5rem" },
    button: { padding: "0.5rem", backgroundColor: "#28a745", color: "#fff", border: "none", cursor: "pointer" },
    deleteButton: { padding: "0.5rem", backgroundColor: "#dc3545", color: "#fff", border: "none", cursor: "pointer", borderRadius: "4px" },
    table: { width: "100%", borderCollapse: "collapse" },
    error: { color: "red" },
};

export default AdminUsers;

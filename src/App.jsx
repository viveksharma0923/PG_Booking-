import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Rooms from "./pages/Rooms";
import BookRoom from "./pages/BookRoom";
import Complaint from "./pages/Complaint";
import AdminUsers from "./pages/AdminUsers";
import AdminBookings from "./pages/AdminBookings";
import AdminComplaints from "./pages/AdminComplaints";
import UserBookings from "./pages/UserBookings";

const PrivateRoute = ({ children, role }) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return <Navigate to="/login" />;
    if (role && user.role !== role) return <Navigate to="/" />;
    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* User Routes */}
                <Route path="/rooms" element={<PrivateRoute><Rooms /></PrivateRoute>} />
                <Route path="/book/:roomNumber" element={<PrivateRoute><BookRoom /></PrivateRoute>} />
                <Route path="/complaint" element={<PrivateRoute><Complaint /></PrivateRoute>} />
                <Route path="/my-bookings" element={<PrivateRoute><UserBookings /></PrivateRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/users" element={<PrivateRoute role="admin"><AdminUsers /></PrivateRoute>} />
                <Route path="/admin/bookings" element={<PrivateRoute role="admin"><AdminBookings /></PrivateRoute>} />
                <Route path="/admin/complaints" element={<PrivateRoute role="admin"><AdminComplaints /></PrivateRoute>} />

                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;

import axios from "axios";

const API_URL = "http://localhost:8080/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const login = (data) => api.post("/login", data);
export const register = (data) => api.post("/register", data);
export const getRooms = () => api.get("/rooms");
export const bookRoom = (data) => api.post("/booking", data);
export const submitComplaint = (data) => api.post("/complaints", data);
export const getAdminUsers = () => api.get("/admin/users");
export const getAdminBookings = () => api.get("/admin/bookings");
export const adminAddUser = (data) => api.post("/admin/addUser", data);
export const deleteUser = (userId) => api.delete(`/admin/deleteUser?user_id=${userId}`);
export const getUserBookings = (userId) => api.get(`/user/bookings?user_id=${userId}`);
export const deleteBooking = (bookingId) => api.delete(`/booking/delete?booking_id=${bookingId}`);
export const getAdminComplaints = () => api.get("/admin/complaints");

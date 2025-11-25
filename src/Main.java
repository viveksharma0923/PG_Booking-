import com.sun.net.httpserver.*;
import java.io.*;
import java.net.InetSocketAddress;
import java.sql.*;
import java.util.stream.Collectors;
import org.json.*;
import java.security.MessageDigest;
public class Main {
    private static final boolean USE_PASSWORD_HASHING = false;
    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress("localhost", 8080), 0);
        server.createContext("/api/login", new LoginHandler());
        server.createContext("/api/register", new RegisterHandler());
        server.createContext("/api/rooms", new RoomsHandler());
        server.createContext("/api/booking", new BookingHandler());
        server.createContext("/api/complaints", new ComplaintHandler());
        server.createContext("/api/admin/users", new AdminUsersHandler());
        server.createContext("/api/admin/bookings", new AdminBookingsHandler());
        server.createContext("/api/admin/addUser", new AdminAddUserHandler());
        server.createContext("/api/admin/deleteUser", new DeleteUserHandler());
        server.createContext("/api/user/bookings", new UserBookingsHandler());
        server.createContext("/api/booking/delete", new DeleteBookingHandler());
        server.createContext("/api/admin/complaints", new AdminComplaintsHandler());
        server.setExecutor(null);
        System.out.println("running at http://localhost:8080");
        server.start();
    }
    // ==================== UTILS ====================
    static void cors(HttpExchange ex) throws IOException {
        Headers h = ex.getResponseHeaders();
        h.add("Access-Control-Allow-Origin", "*");
        h.add("Access-Control-Allow-Headers", "Content-Type");
        h.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

        // Handle preflight OPTIONS request globally in the helper if possible,
        // but we need to return true/false to let handler know whether to proceed.
        // However, simpler to just check method in each handler or use a filter.
        // For this simple setup, we'll just check in each handler.
    }

    static boolean handleOptions(HttpExchange ex) throws IOException {
        cors(ex);
        if (ex.getRequestMethod().equals("OPTIONS")) {
            ex.sendResponseHeaders(204, -1);
            return true;
        }
        return false;
    }
    static void send(HttpExchange ex, int status, String response) throws IOException {
        ex.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        byte[] bytes = response.getBytes("UTF-8");
        ex.sendResponseHeaders(status, bytes.length);
        ex.getResponseBody().write(bytes);
        ex.getResponseBody().close();
    }
    static String body(HttpExchange ex) throws IOException {
        return new BufferedReader(
                new InputStreamReader(ex.getRequestBody(), "UTF-8")
        ).lines().collect(Collectors.joining("\n"));
    }
    static String processPassword(String password) {
        if (!USE_PASSWORD_HASHING) return password;
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(password.getBytes("UTF-8"));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) sb.append('0');
                sb.append(hex);
            }
            return sb.toString();
        } catch (Exception e) {
            return password;
        }
    }
    static boolean isValidPhone(String phone) {
        return phone != null && phone.matches("\\d{10}");
    }
    static void close(Connection c, Statement s, ResultSet r) {
        try { if (r != null) r.close(); } catch (Exception ignored) {}
        try { if (s != null) s.close(); } catch (Exception ignored) {}
        try { if (c != null) c.close(); } catch (Exception ignored) {}
    }
    // ==================== DB ====================
    static class DB {
        static final String URL = "jdbc:mysql://localhost:3306/pg_booking?useSSL=false";
        static final String USER = "root";
        static final String PASS = "1234";
        static Connection connect() throws SQLException {
            return DriverManager.getConnection(URL, USER, PASS);
        }
    }
    // ==================== LOGIN ====================
    static class LoginHandler implements HttpHandler {
        public void handle(HttpExchange ex) throws IOException {
            if (handleOptions(ex)) return;
            Connection conn = null;
            PreparedStatement ps = null;
            ResultSet rs = null;
            try {
                JSONObject json = new JSONObject(body(ex));
                conn = DB.connect();
                ps = conn.prepareStatement("SELECT * FROM users WHERE username=? AND password=?");
                ps.setString(1, json.getString("username"));
                ps.setString(2, processPassword(json.getString("password")));
                rs = ps.executeQuery();
                if (!rs.next()) {
                    send(ex, 401, new JSONObject().put("error", "Invalid credentials").toString());
                    return;
                }
                JSONObject res = new JSONObject();
                res.put("success", true);
                res.put("user_id", rs.getInt("id"));
                res.put("username", rs.getString("username"));
                res.put("full_name", rs.getString("full_name"));
                res.put("phone", rs.getString("phone"));
                res.put("role", rs.getString("role"));
                send(ex, 200, res.toString());
            } catch (Exception e) {
                send(ex, 500, new JSONObject().put("error", e.getMessage()).toString());
            } finally { close(conn, ps, rs); }
        }
    }
    // ==================== REGISTER ====================
    static class RegisterHandler implements HttpHandler {
        public void handle(HttpExchange ex) throws IOException {
            if (handleOptions(ex)) return;
            Connection conn = null;
            PreparedStatement ps = null;
            try {
                JSONObject json = new JSONObject(body(ex));
                conn = DB.connect();
                ps = conn.prepareStatement(
                        "INSERT INTO users (username,password,full_name,phone) VALUES (?,?,?,?)"
                );
                ps.setString(1, json.getString("username"));
                ps.setString(2, processPassword(json.getString("password")));
                ps.setString(3, json.getString("full_name"));
                ps.setString(4, json.getString("phone"));
                ps.executeUpdate();
                send(ex, 200, new JSONObject().put("success", true).toString());
            } catch (SQLException e) {
                send(ex, 409, new JSONObject().put("error", "Username exists").toString());
            } catch (Exception e) {
                send(ex, 500, new JSONObject().put("error", e.getMessage()).toString());
            } finally { close(conn, ps, null); }
        }
    }
    // ==================== ROOMS ====================
    static class RoomsHandler implements HttpHandler {
        public void handle(HttpExchange ex) throws IOException {
            if (handleOptions(ex)) return;

            Connection conn = null;
            Statement st = null;
            ResultSet rs = null;
            try {
                conn = DB.connect();
                st = conn.createStatement();
                rs = st.executeQuery("SELECT * FROM rooms WHERE available=TRUE ORDER BY room_number ASC");
                JSONArray arr = new JSONArray();
                while (rs.next()) {
                    JSONObject o = new JSONObject();
                    o.put("id", rs.getInt("id"));
                    o.put("room_number", rs.getInt("room_number"));
                    o.put("room_type", rs.getString("room_type"));
                    o.put("beds", rs.getInt("beds"));
                    o.put("price", rs.getDouble("price"));
                    o.put("available", rs.getBoolean("available"));
                    arr.put(o);
                }
                send(ex, 200, arr.toString());
            } catch (Exception e) {
                send(ex, 500, new JSONObject().put("error", e.getMessage()).toString());
            } finally { close(conn, st, rs); }
        }
    }
    // ==================== BOOKING (simple meals=true/false) ====================
    static class BookingHandler implements HttpHandler {
        public void handle(HttpExchange ex) throws IOException {
            if (handleOptions(ex)) return;
            if (!ex.getRequestMethod().equals("POST")) {
                send(ex, 405, new JSONObject().put("error", "Only POST allowed").toString());
                return;
            }
            Connection conn = null;
            PreparedStatement ps = null;
            ResultSet rs = null;
            try {
                JSONObject json = new JSONObject(body(ex));
                int userId = json.getInt("user_id");
                int roomNumber = json.getInt("room_number");
                boolean meals = json.optBoolean("meals", false);
                conn = DB.connect();
                // Get room
                ps = conn.prepareStatement("SELECT id, price, available FROM rooms WHERE room_number=?");
                ps.setInt(1, roomNumber);
                rs = ps.executeQuery();
                if (!rs.next()) {
                    send(ex, 400, new JSONObject().put("error", "Room not found").toString());
                    return;
                }
                int roomId = rs.getInt("id");
                double price = rs.getDouble("price");
                if (!rs.getBoolean("available")) {
                    send(ex, 400, new JSONObject().put("error", "Room already booked").toString());
                    return;
                }
                // Meal cost
                double mealPrice = meals ? 3000 : 0;
                double total = price + mealPrice;
                // Insert booking
                ps = conn.prepareStatement(
                        "INSERT INTO bookings (user_id, student_name, phone, room_id, meals, meal_price, total_price) VALUES (?,?,?,?,?,?,?)"
                );
                ps.setInt(1, userId);
                ps.setString(2, json.getString("student_name"));
                ps.setString(3, json.getString("phone"));
                ps.setInt(4, roomId);
                ps.setBoolean(5, meals);
                ps.setDouble(6, mealPrice);
                ps.setDouble(7, total);
                ps.executeUpdate();
                // Make room unavailable
                ps = conn.prepareStatement("UPDATE rooms SET available=FALSE WHERE id=?");
                ps.setInt(1, roomId);
                ps.executeUpdate();
                send(ex, 200, new JSONObject().put("success", true).put("total", total).toString());
            } catch (Exception e) {
                send(ex, 500, new JSONObject().put("error", e.getMessage()).toString());
            } finally { close(conn, ps, rs); }
        }
    }
    // ==================== COMPLAINT ====================
    static class ComplaintHandler implements HttpHandler {
        public void handle(HttpExchange ex) throws IOException {
            if (handleOptions(ex)) return;
            Connection conn = null;
            PreparedStatement ps = null;
            try {
                JSONObject json = new JSONObject(body(ex));
                conn = DB.connect();
                ps = conn.prepareStatement(
                        "INSERT INTO complaints (user_id,student_name,phone,complaint_type,description) VALUES (?,?,?,?,?)"
                );
                ps.setInt(1, json.getInt("user_id"));
                ps.setString(2, json.getString("student_name"));
                ps.setString(3, json.getString("phone"));
                ps.setString(4, json.getString("complaint_type"));
                ps.setString(5, json.getString("description"));
                ps.executeUpdate();
                send(ex, 200, new JSONObject().put("success", true).toString());
            } catch (Exception e) {
                send(ex, 500, new JSONObject().put("error", e.getMessage()).toString());
            } finally { close(conn, ps, null); }
        }
    }
    // ==================== ADMIN USERS ====================
    static class AdminUsersHandler implements HttpHandler {
        public void handle(HttpExchange ex) throws IOException {
            if (handleOptions(ex)) return;

            Connection conn = null;
            Statement st = null;
            ResultSet rs = null;
            try {
                conn = DB.connect();
                st = conn.createStatement();
                rs = st.executeQuery("SELECT * FROM users");
                JSONArray arr = new JSONArray();
                while (rs.next()) {
                    JSONObject o = new JSONObject();
                    o.put("id", rs.getInt("id"));
                    o.put("username", rs.getString("username"));
                    o.put("full_name", rs.getString("full_name"));
                    o.put("phone", rs.getString("phone"));
                    o.put("role", rs.getString("role"));
                    arr.put(o);
                }
                send(ex, 200, arr.toString());
            } catch (Exception e) {
                send(ex, 500, new JSONObject().put("error", e.getMessage()).toString());
            } finally { close(conn, st, rs); }
        }
    }
    // ==================== ADMIN BOOKINGS ====================
    static class AdminBookingsHandler implements HttpHandler {
        public void handle(HttpExchange ex) throws IOException {
            if (handleOptions(ex)) return;

            Connection conn = null;
            Statement st = null;
            ResultSet rs = null;
            try {
                conn = DB.connect();
                st = conn.createStatement();
                String sql =
                        "SELECT b.*, u.username, r.room_number, r.room_type " +
                                "FROM bookings b " +
                                "JOIN users u ON b.user_id = u.id " +
                                "JOIN rooms r ON b.room_id = r.id " +
                                "ORDER BY b.booking_date DESC";
                rs = st.executeQuery(sql);
                JSONArray arr = new JSONArray();
                while (rs.next()) {
                    JSONObject o = new JSONObject();
                    o.put("id", rs.getInt("id"));
                    o.put("username", rs.getString("username"));
                    o.put("student_name", rs.getString("student_name"));
                    o.put("phone", rs.getString("phone"));
                    o.put("room_number", rs.getInt("room_number"));
                    o.put("room_type", rs.getString("room_type"));
                    o.put("meals", rs.getBoolean("meals"));
                    o.put("total_price", rs.getDouble("total_price"));
                    o.put("booking_date", rs.getString("booking_date"));
                    arr.put(o);
                }
                send(ex, 200, arr.toString());
            } catch (Exception e) {
                send(ex, 500, new JSONObject().put("error", e.getMessage()).toString());
            } finally { close(conn, st, rs); }
        }
    }
    // ==================== USER BOOKINGS ====================
    static class UserBookingsHandler implements HttpHandler {
        public void handle(HttpExchange ex) throws IOException {
            if (handleOptions(ex)) return;

            Connection conn = null;
            PreparedStatement ps = null;
            ResultSet rs = null;
            try {
                String query = ex.getRequestURI().getQuery();
                int userId = Integer.parseInt(query.split("=")[1]);
                conn = DB.connect();
                String sql =
                        "SELECT b.*, r.room_number, r.room_type " +
                                "FROM bookings b " +
                                "JOIN rooms r ON b.room_id=r.id " +
                                "WHERE b.user_id=?";
                ps = conn.prepareStatement(sql);
                ps.setInt(1, userId);
                rs = ps.executeQuery();
                JSONArray arr = new JSONArray();
                while (rs.next()) {
                    JSONObject o = new JSONObject();
                    o.put("id", rs.getInt("id"));
                    o.put("student_name", rs.getString("student_name"));
                    o.put("phone", rs.getString("phone"));
                    o.put("room_number", rs.getInt("room_number"));
                    o.put("room_type", rs.getString("room_type"));
                    o.put("meals", rs.getBoolean("meals"));
                    o.put("total_price", rs.getDouble("total_price"));
                    arr.put(o);
                }
                send(ex, 200, arr.toString());
            } catch (Exception e) {
                send(ex, 500, new JSONObject().put("error", e.getMessage()).toString());
            } finally { close(conn, ps, rs); }
        }
    }
    // ==================== ADMIN ADD USER ====================
    static class AdminAddUserHandler implements HttpHandler {
        public void handle(HttpExchange ex) throws IOException {
            if (handleOptions(ex)) return;

            Connection conn = null;
            PreparedStatement ps = null;
            try {
                JSONObject json = new JSONObject(body(ex));
                conn = DB.connect();
                ps = conn.prepareStatement(
                        "INSERT INTO users (username,password,full_name,phone,role) VALUES (?,?,?,?,?)"
                );
                ps.setString(1, json.getString("username"));
                ps.setString(2, processPassword(json.getString("password")));
                ps.setString(3, json.getString("full_name"));
                ps.setString(4, json.getString("phone"));
                ps.setString(5, json.optString("role", "user"));
                ps.executeUpdate();
                send(ex, 200, new JSONObject().put("success", true).toString());
            } catch (SQLException e) {
                send(ex, 409, new JSONObject().put("error", "Username exists").toString());
            } catch (Exception e) {
                send(ex, 500, new JSONObject().put("error", e.getMessage()).toString());
            } finally { close(conn, ps, null); }
        }
    }
    // ==================== DELETE USER ====================
    static class DeleteUserHandler implements HttpHandler {
        public void handle(HttpExchange ex) throws IOException {
            if (handleOptions(ex)) return;

            Connection conn = null;
            PreparedStatement ps = null;
            ResultSet rs = null;
            try {
                String query = ex.getRequestURI().getQuery();
                if (query == null || !query.startsWith("user_id=")) {
                    send(ex, 400, new JSONObject().put("error", "Missing user_id parameter").toString());
                    return;
                }
                int userId = Integer.parseInt(query.split("=")[1]);
                
                conn = DB.connect();
                conn.setAutoCommit(false); // Start transaction
                
                // Get all room IDs associated with this user's bookings
                ps = conn.prepareStatement("SELECT room_id FROM bookings WHERE user_id=?");
                ps.setInt(1, userId);
                rs = ps.executeQuery();
                
                // Collect room IDs to update
                java.util.List<Integer> roomIds = new java.util.ArrayList<>();
                while (rs.next()) {
                    roomIds.add(rs.getInt("room_id"));
                }
                rs.close();
                ps.close();
                
                // Delete user's bookings
                ps = conn.prepareStatement("DELETE FROM bookings WHERE user_id=?");
                ps.setInt(1, userId);
                ps.executeUpdate();
                ps.close();
                
                // Make all rooms available again
                for (int roomId : roomIds) {
                    ps = conn.prepareStatement("UPDATE rooms SET available=TRUE WHERE id=?");
                    ps.setInt(1, roomId);
                    ps.executeUpdate();
                    ps.close();
                }
                
                // Delete the user
                ps = conn.prepareStatement("DELETE FROM users WHERE id=?");
                ps.setInt(1, userId);
                int rowsAffected = ps.executeUpdate();
                
                if (rowsAffected == 0) {
                    conn.rollback();
                    send(ex, 404, new JSONObject().put("error", "User not found").toString());
                    return;
                }
                
                conn.commit(); // Commit transaction
                send(ex, 200, new JSONObject().put("success", true).put("message", "User deleted successfully").toString());
            } catch (NumberFormatException e) {
                try { if (conn != null) conn.rollback(); } catch (Exception ignored) {}
                send(ex, 400, new JSONObject().put("error", "Invalid user_id format").toString());
            } catch (Exception e) {
                try { if (conn != null) conn.rollback(); } catch (Exception ignored) {}
                send(ex, 500, new JSONObject().put("error", e.getMessage()).toString());
            } finally { 
                try { if (conn != null) conn.setAutoCommit(true); } catch (Exception ignored) {}
                close(conn, ps, rs); 
            }
        }
    }
    // ==================== DELETE BOOKING ====================
    static class DeleteBookingHandler implements HttpHandler {
        public void handle(HttpExchange ex) throws IOException {
            if (handleOptions(ex)) return;

            Connection conn = null;
            PreparedStatement ps = null;
            ResultSet rs = null;
            try {
                String query = ex.getRequestURI().getQuery();
                if (query == null || !query.startsWith("booking_id=")) {
                    send(ex, 400, new JSONObject().put("error", "Missing booking_id parameter").toString());
                    return;
                }
                int bookingId = Integer.parseInt(query.split("=")[1]);

                conn = DB.connect();
                conn.setAutoCommit(false); // Start transaction

                // Get room_id for this booking
                ps = conn.prepareStatement("SELECT room_id FROM bookings WHERE id=?");
                ps.setInt(1, bookingId);
                rs = ps.executeQuery();
                if (!rs.next()) {
                    conn.rollback();
                    send(ex, 404, new JSONObject().put("error", "Booking not found").toString());
                    return;
                }
                int roomId = rs.getInt("room_id");
                rs.close();
                ps.close();

                // Delete booking
                ps = conn.prepareStatement("DELETE FROM bookings WHERE id=?");
                ps.setInt(1, bookingId);
                ps.executeUpdate();
                ps.close();

                // Make room available
                ps = conn.prepareStatement("UPDATE rooms SET available=TRUE WHERE id=?");
                ps.setInt(1, roomId);
                ps.executeUpdate();

                conn.commit();
                send(ex, 200, new JSONObject().put("success", true).toString());
            } catch (Exception e) {
                try { if (conn != null) conn.rollback(); } catch (Exception ignored) {}
                send(ex, 500, new JSONObject().put("error", e.getMessage()).toString());
            } finally {
                try { if (conn != null) conn.setAutoCommit(true); } catch (Exception ignored) {}
                close(conn, ps, rs);
            }
        }
    }
    // ==================== ADMIN COMPLAINTS ====================
    static class AdminComplaintsHandler implements HttpHandler {
        public void handle(HttpExchange ex) throws IOException {
            if (handleOptions(ex)) return;

            Connection conn = null;
            Statement st = null;
            ResultSet rs = null;
            try {
                conn = DB.connect();
                st = conn.createStatement();
                rs = st.executeQuery("SELECT * FROM complaints ORDER BY id DESC");
                JSONArray arr = new JSONArray();
                while (rs.next()) {
                    JSONObject o = new JSONObject();
                    o.put("id", rs.getInt("id"));
                    o.put("user_id", rs.getInt("user_id"));
                    o.put("student_name", rs.getString("student_name"));
                    o.put("phone", rs.getString("phone"));
                    o.put("complaint_type", rs.getString("complaint_type"));
                    o.put("description", rs.getString("description"));
                    arr.put(o);
                }
                send(ex, 200, arr.toString());
            } catch (Exception e) {
                send(ex, 500, new JSONObject().put("error", e.getMessage()).toString());
            } finally { close(conn, st, rs); }
        }
    }
}
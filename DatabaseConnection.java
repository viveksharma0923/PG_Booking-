import java.sql.*;

public class DatabaseConnection {
    private static final String URL =
            "jdbc:mysql://localhost:3306/pg_booking?useSSL=false&allowPublicKeyRetrieval=true";
    private static final String USER = "root";
    private static final String PASSWORD = "1234";  // set your real MySQL password

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}
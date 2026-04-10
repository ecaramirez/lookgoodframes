<?php
// Connect WITHOUT database first
$conn = new mysqli("localhost", "root", "", "lookgood", 3307);
if ($conn->connect_error) {
    die("❌ Connection failed: " . $conn->connect_error);
}

echo "✅ Connected to MySQL!<br><br>";

// List ALL databases MySQL can see
$result = $conn->query("SHOW DATABASES");
echo "<strong>Available databases:</strong><br>";
while ($row = $result->fetch_row()) {
    echo "- " . $row[0] . "<br>";
}
?>
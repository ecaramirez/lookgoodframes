<?php
define('ADMIN_EMAIL',    'admin@lookgoodframes.com');
define('ADMIN_PASSWORD', password_hash('admin123', PASSWORD_DEFAULT));

$host = "localhost";
$user = "root";
$password = "";
$database = "lookgood";
$port = 3307;

$conn = new mysqli($host, $user, $password, $database, $port);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

?>

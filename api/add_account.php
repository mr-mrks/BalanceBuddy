<?php
require_once 'db_connect.php';
$db = get_db_connection();
if ($db === null) {
    echo "Database connection failed.";
    exit;
}
$name = $_POST['name'];
$color = $_POST['color']; // Get color from POST data
try {
    $stmt = $db->prepare('INSERT INTO accounts (name, color) VALUES (:name, :color)');
    $stmt->bindValue(':name', $name, SQLITE3_TEXT);
    $stmt->bindValue(':color', $color, SQLITE3_TEXT); // Bind color
    $stmt->execute();
    header('Location: ../index.html');
    exit;
} catch (Exception $e) {
    echo "Error adding account: " . $e->getMessage();
}
?>

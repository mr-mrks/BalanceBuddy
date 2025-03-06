<?php
require_once 'db_connect.php';
$db = get_db_connection();
if ($db === null) {
    echo "Database connection failed.";
    exit;
}
$name = $_POST['name'];
try {
    $stmt = $db->prepare('INSERT INTO accounts (name) VALUES (:name)');
    $stmt->bindValue(':name', $name, SQLITE3_TEXT);
    $stmt->execute();
    header('Location: ../index.html');
    exit;
} catch (Exception $e) {
    echo "Error adding account: " . $e->getMessage();
}
?>

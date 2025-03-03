<?php
require_once 'db_connect.php';
$db = get_db_connection();
if ($db === null) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}
try{
    $name = $_POST['name'];
    $stmt = $db->prepare('INSERT INTO accounts (name) VALUES (:name)');
    $stmt->bindValue(':name', $name, SQLITE3_TEXT);
    $stmt->execute();
    header('Content-Type: application/json');
    echo json_encode(['status' => 'success', 'message' => 'account added']);
} catch(Exception $e){
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>

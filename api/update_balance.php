<?php
require_once 'db_connect.php';
$db = get_db_connection();
if ($db === null) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}
try {
    $id = $_POST['balanceid'];
    $entry_date = $_POST['entry_date'];
    $balance = $_POST['balance'];
    $stmt = $db->prepare('UPDATE balance_entries SET entry_date = :entry_date, balance = :balance WHERE id = :id');
    $stmt->bindValue(':id', $id, SQLITE3_INTEGER);
    $stmt->bindValue(':entry_date', $entry_date, SQLITE3_TEXT);
    $stmt->bindValue(':balance', $balance, SQLITE3_FLOAT);
    $stmt->execute();
    header('Content-Type: application/json');
    echo json_encode(['status' => 'success', 'message' => 'balance updated']);
}catch(Exception $e){
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>

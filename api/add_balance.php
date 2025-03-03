<?php
require_once 'db_connect.php';
$db = get_db_connection();
if ($db === null) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}
$db->beginTransaction();
try {
    $account_id = $_POST['account_id'];
    $entry_date = $_POST['entry_date'];
    $balance = $_POST['balance'];
    $stmt = $db->prepare('INSERT INTO balance_entries (account_id, entry_date, balance) VALUES (:account_id, :entry_date, :balance)');
    $stmt->bindValue(':account_id', $account_id, SQLITE3_INTEGER);
    $stmt->bindValue(':entry_date', $entry_date, SQLITE3_TEXT);
    $stmt->bindValue(':balance', $balance, SQLITE3_FLOAT);
    $stmt->execute();
    $db->commit();
    header('Content-Type: application/json');
    echo json_encode(['status' => 'success', 'message' => 'Balance added']);
} catch (Exception $e) {
    $db->rollback();
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>

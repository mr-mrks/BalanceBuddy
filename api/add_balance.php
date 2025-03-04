<?php
require_once 'db_connect.php';
$db = get_db_connection();
if ($db === null) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}
var_dump($_POST); // Debugging line

try {
    $db->beginTransaction();

    $account_id = $_POST['account_id'];
    $entry_date = $_POST['entry_date'];
    $balance = $_POST['balance'];

    $stmt = $db->prepare('INSERT INTO balance_entries (account_id, entry_date, balance) VALUES (:account_id, :entry_date, :balance)');
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $db->lastErrorMsg());
    }

    $stmt->bindValue(':account_id', $account_id, SQLITE3_INTEGER);
    $stmt->bindValue(':entry_date', $entry_date, SQLITE3_TEXT);
    $stmt->bindValue(':balance', $balance, SQLITE3_FLOAT);

    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->errorInfo()[2]);
    }

    if (!$db->commit()) {
        throw new Exception("Commit failed: " . $db->lastErrorMsg());
    }

    header('Content-Type: application/json');
    echo json_encode(['status' => 'success', 'message' => 'Balance added']);

} catch (Exception $e) {
    $db->rollback();
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    error_log("Error in add_balance.php: " . $e->getMessage()); // Log the error
}
?>

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
    $account_id = $_GET['id'];
    $stmt = $db->prepare('SELECT id, entry_date, balance FROM balance_entries WHERE account_id = :account_id');
    $stmt->bindValue(':account_id', $account_id, SQLITE3_INTEGER);
    $results = $stmt->execute();
    $balances = [];
    while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
        $balances[] = $row;
    }
    header('Content-Type: application/json');
    echo json_encode(['status' => 'success', 'data' => $balances]);
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>

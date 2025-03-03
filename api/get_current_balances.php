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
    $results = $db->query("SELECT a.name, b.balance, b.entry_date FROM accounts a LEFT JOIN (SELECT account_id, balance, entry_date FROM balance_entries WHERE (account_id, entry_date) IN (SELECT account_id, MAX(entry_date) FROM balance_entries GROUP BY account_id)) b ON a.id = b.account_id");
    $current_balances = [];
    while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
        $current_balances[] = $row;
    }
    header('Content-Type: application/json');
    echo json_encode(['status' => 'success', 'data' => $current_balances]);
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>

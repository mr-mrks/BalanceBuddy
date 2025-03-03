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
    $results = $db->query('SELECT id, name FROM accounts');
    $accounts = [];
    while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
        $accounts[] = $row;
    }
    header('Content-Type: application/json');
    echo json_encode(['status' => 'success', 'data' => $accounts]);
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>

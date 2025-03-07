<?php
require_once 'db_connect.php';
$db = get_db_connection();
if ($db === null) {
    echo "Database connection failed.";
    exit;
}
try {
    $stmt = $db->prepare('SELECT id, name, color FROM accounts'); // Select color
    $result = $stmt->execute();
    $accounts = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $accounts[] = $row;
    }
    echo json_encode(['data' => $accounts]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>

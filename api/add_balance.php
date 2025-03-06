<?php
require_once 'db_connect.php';
$db = get_db_connection();
if ($db === null) {
    echo "Database connection failed.";
    exit;
}
$account_id = $_POST['account_id'];
$entry_date = $_POST['entry_date'];
$balance = $_POST['balance'];
try {
    $stmt = $db->prepare('INSERT INTO balance_entries (account_id, entry_date, balance) VALUES (:account_id, :entry_date, :balance)');
    $stmt->bindValue(':account_id', $account_id, SQLITE3_INTEGER);
    $stmt->bindValue(':entry_date', $entry_date, SQLITE3_TEXT);
    $stmt->bindValue(':balance', $balance, SQLITE3_FLOAT);
    $stmt->execute();
    header('Location: ../index.html');
    exit;
} catch (Exception $e) {
    echo "Error adding balance: " . $e->getMessage();
}
?>

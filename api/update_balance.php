<?php
require_once 'db_connect.php';
$db = get_db_connection();
if ($db === null) {
    echo "Database connection failed.";
    exit;
}
$balanceid = $_POST['balanceid'];
$entry_date = $_POST['entry_date'];
$balance = $_POST['balance'];
try {
    $stmt = $db->prepare('UPDATE balance_entries SET entry_date = :entry_date, balance = :balance WHERE id = :balanceid');
    $stmt->bindValue(':balanceid', $balanceid, SQLITE3_INTEGER);
    $stmt->bindValue(':entry_date', $entry_date, SQLITE3_TEXT);
    $stmt->bindValue(':balance', $balance, SQLITE3_FLOAT);
    $stmt->execute();
    header('Location: ../index.html');
    exit;
} catch (Exception $e) {
    echo "Error updating balance: " . $e->getMessage();
}
?>

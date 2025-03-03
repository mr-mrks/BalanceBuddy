<?php
function get_db_connection() {
    static $db;
    if ($db === null) {
        try {
            $db = new SQLite3('/root/BalanceBuddy/balancebuddy.db'); // Updated path
        } catch (Exception $e) {
            error_log("Database connection error: " . $e->getMessage());
            return null;
        }
    }
    return $db;
}
?>

<?php
function get_db_connection() {
    static $db;
    if ($db === null) {
        try {
            $db = new SQLite3('../balancebuddy.db');
        } catch (Exception $e) {
            error_log("Database connection error: " . $e->getMessage());
            return null;
        }
    }
    return $db;
}
?>

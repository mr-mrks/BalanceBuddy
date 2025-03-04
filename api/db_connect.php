<?php
function get_db_connection() {
    static $db;
    if ($db === null) {
        try {
            $db = new SQLite3('/var/www/html/BalanceBuddy/balancebuddy.db');
            if (!$db) {
                error_log("SQLite3 connection failed.");
                return null;
            }
        } catch (Exception $e) {
            error_log("Database connection error: " . $e->getMessage());
            return null;
        }
    }
    return $db;
}

$db = get_db_connection();
/*
if (!$db) {
    echo "Database connection failed.";
} else {
    echo "Database connection successful.";
}
*/
?>

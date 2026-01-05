<?php
/**
 * Database Helper Functions
 * Provides database-agnostic SQL functions for PostgreSQL and MySQL
 */

// Get the database type from config
global $DB_TYPE;

/**
 * Get database-agnostic date subtraction SQL
 * @param string $interval - e.g., '7 DAY', '30 DAY', '1 HOUR'
 * @return string SQL expression
 */
function getDateSubtract($interval)
{
    global $DB_TYPE;

    if ($DB_TYPE === 'pgsql') {
        // PostgreSQL: NOW() - INTERVAL '7 days'
        return "NOW() - INTERVAL '$interval'";
    } else {
        // MySQL: DATE_SUB(NOW(), INTERVAL 7 DAY)
        return "DATE_SUB(NOW(), INTERVAL $interval)";
    }
}

/**
 * Get database-agnostic UPSERT (INSERT or UPDATE) SQL
 * @param string $table - Table name
 * @param array $insertCols - Columns for INSERT
 * @param array $updateCols - Columns for UPDATE (excluding conflict key)
 * @param string $conflictKey - Unique key to check for conflicts
 * @return array ['sql' => string, 'useStandard' => bool]
 */
function getUpsertSQL($table, $insertCols, $updateCols, $conflictKey)
{
    global $DB_TYPE;

    $insertPlaceholders = ':' . implode(', :', $insertCols);
    $insertColsList = implode(', ', $insertCols);

    if ($DB_TYPE === 'pgsql') {
        // PostgreSQL: ON CONFLICT...DO UPDATE
        $updateSet = [];
        foreach ($updateCols as $col) {
            $updateSet[] = "$col = COALESCE(EXCLUDED.$col, $table.$col)";
        }
        $updateSetStr = implode(', ', $updateSet);

        return [
            'sql' => "
                INSERT INTO $table ($insertColsList)
                VALUES ($insertPlaceholders)
                ON CONFLICT ($conflictKey)
                DO UPDATE SET $updateSetStr
            ",
            'useStandard' => true
        ];
    } else {
        // MySQL: ON DUPLICATE KEY UPDATE
        $updateSet = [];
        foreach ($updateCols as $col) {
            $updateSet[] = "$col = COALESCE(VALUES($col), $col)";
        }
        $updateSetStr = implode(', ', $updateSet);

        return [
            'sql' => "
                INSERT INTO $table ($insertColsList)
                VALUES ($insertPlaceholders)
                ON DUPLICATE KEY UPDATE $updateSetStr
            ",
            'useStandard' => true
        ];
    }
}

/**
 * Get database-agnostic NOW() function
 * @return string
 */
function getNow()
{
    return 'NOW()';
}

/**
 * Get database-agnostic DATE() function
 * @param string $column - Column name
 * @return string SQL expression
 */
function getDateColumn($column)
{
    global $DB_TYPE;

    if ($DB_TYPE === 'pgsql') {
        return "DATE($column)";
    } else {
        return "DATE($column)";
    }
}

/**
 * Get database-agnostic COALESCE with NULL check
 * @param string $column - Column name
 * @param mixed $default - Default value
 * @return string SQL expression
 */
function getCoalesce($column, $default)
{
    if (is_string($default)) {
        return "COALESCE($column, '$default')";
    }
    return "COALESCE($column, $default)";
}
?>
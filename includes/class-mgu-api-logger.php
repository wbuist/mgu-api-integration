<?php
/**
 * The logging class.
 *
 * @since      1.0.0
 * @package    MGU_API_Integration
 */

class MGU_API_Logger {
    /**
     * Log levels
     */
    const ERROR = 'error';
    const WARNING = 'warning';
    const INFO = 'info';
    const DEBUG = 'debug';

    /**
     * Log a message.
     *
     * @since    1.0.0
     * @param    string    $message    The message to log.
     * @param    string    $level      The log level.
     * @param    array     $context    Additional context data.
     */
    public static function log($message, $level = self::INFO, $context = array()) {
        if (!is_string($message)) {
            $message = print_r($message, true);
        }

        $log_entry = array(
            'timestamp' => current_time('mysql'),
            'level' => $level,
            'message' => $message,
            'context' => $context
        );

        $logs = get_option('mgu_api_logs', array());
        array_unshift($logs, $log_entry);
        
        // Keep only the last 1000 log entries
        $logs = array_slice($logs, 0, 1000);
        
        update_option('mgu_api_logs', $logs);
    }

    /**
     * Log an error.
     *
     * @since    1.0.0
     * @param    string    $message    The error message.
     * @param    array     $context    Additional context data.
     */
    public static function error($message, $context = array()) {
        self::log($message, self::ERROR, $context);
    }

    /**
     * Log a warning.
     *
     * @since    1.0.0
     * @param    string    $message    The warning message.
     * @param    array     $context    Additional context data.
     */
    public static function warning($message, $context = array()) {
        self::log($message, self::WARNING, $context);
    }

    /**
     * Log an info message.
     *
     * @since    1.0.0
     * @param    string    $message    The info message.
     * @param    array     $context    Additional context data.
     */
    public static function info($message, $context = array()) {
        self::log($message, self::INFO, $context);
    }

    /**
     * Log a debug message.
     *
     * @since    1.0.0
     * @param    string    $message    The debug message.
     * @param    array     $context    Additional context data.
     */
    public static function debug($message, $context = array()) {
        // Debug logging disabled
        return;
    }

    /**
     * Get all logs.
     *
     * @since    1.0.0
     * @return   array    The logs.
     */
    public static function get_logs() {
        return get_option('mgu_api_logs', array());
    }

    /**
     * Clear all logs.
     *
     * @since    1.0.0
     */
    public static function clear_logs() {
        delete_option('mgu_api_logs');
    }
} 
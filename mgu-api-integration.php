<?php
/**
 * Plugin Name: MGU API Integration
 * Plugin URI: https://github.com/wbuist/MGUAPI
 * Description: A WordPress plugin for integrating with the MGU API system.
 * Version: 1.0.3
 * Author: William Buist
 * Author URI: https://github.com/wbuist
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: mgu-api-integration
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 *
 * @package MGU_API_Integration
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

// Enable WordPress debug logging
if (!defined('WP_DEBUG')) {
    define('WP_DEBUG', true);
}
if (!defined('WP_DEBUG_LOG')) {
    define('WP_DEBUG_LOG', true);
}
if (!defined('WP_DEBUG_DISPLAY')) {
    define('WP_DEBUG_DISPLAY', false);
}

// Log plugin initialization
error_log('MGU API Integration plugin initializing');

// Define plugin constants
define('MGU_API_VERSION', '1.0.0');
define('MGU_API_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('MGU_API_PLUGIN_URL', plugin_dir_url(__FILE__));
define('MGU_API_PLUGIN_BASENAME', plugin_basename(__FILE__));

// Include required files
require_once MGU_API_PLUGIN_DIR . 'includes/class-mgu-api-loader.php';
require_once MGU_API_PLUGIN_DIR . 'includes/class-mgu-api-logger.php';
require_once MGU_API_PLUGIN_DIR . 'includes/class-mgu-api-client.php';
require_once MGU_API_PLUGIN_DIR . 'includes/class-mgu-api-public.php';
require_once MGU_API_PLUGIN_DIR . 'includes/class-mgu-api.php';

/**
 * The code that runs during plugin activation.
 */
function activate_mgu_api_integration() {
    require_once plugin_dir_path(__FILE__) . 'includes/class-mgu-api-activator.php';
    MGU_API_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 */
function deactivate_mgu_api_integration() {
    require_once plugin_dir_path(__FILE__) . 'includes/class-mgu-api-deactivator.php';
    MGU_API_Deactivator::deactivate();
}

register_activation_hook(__FILE__, 'activate_mgu_api_integration');
register_deactivation_hook(__FILE__, 'deactivate_mgu_api_integration');

/**
 * Begins execution of the plugin.
 */
function run_mgu_api_integration() {
    error_log('MGU API Integration plugin running');
    $plugin = new MGU_API();
    
    // Make the plugin instance globally accessible
    global $mgu_api_plugin;
    $mgu_api_plugin = $plugin;
    
    $plugin->run();
}

// Run the plugin
run_mgu_api_integration(); 
<?php
/**
 * Fired during plugin activation
 *
 * @link       https://example.com
 * @since      1.0.0
 *
 * @package    MGU_API_Integration
 * @subpackage MGU_API_Integration/includes
 */

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @since      1.0.0
 * @package    MGU_API_Integration
 * @subpackage MGU_API_Integration/includes
 * @author     Your Name <email@example.com>
 */
class MGU_API_Activator {

    /**
     * Short Description. (use period)
     *
     * Long Description.
     *
     * @since    1.0.0
     */
    public static function activate() {
        // Create necessary database tables or options
        add_option('mgu_api_settings', array(
            'api_endpoint' => '',
            'api_key' => ''
        ));
    }
} 
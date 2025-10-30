<?php
/**
 * Fired during plugin deactivation
 *
 * @link       https://example.com
 * @since      1.0.0
 *
 * @package    MGU_API_Integration
 * @subpackage MGU_API_Integration/includes
 */

/**
 * Fired during plugin deactivation.
 *
 * This class defines all code necessary to run during the plugin's deactivation.
 *
 * @since      1.0.0
 * @package    MGU_API_Integration
 * @subpackage MGU_API_Integration/includes
 * @author     Your Name <email@example.com>
 */
class MGU_API_Deactivator {

    /**
     * Short Description. (use period)
     *
     * Long Description.
     *
     * @since    1.0.0
     */
    public static function deactivate() {
        // Clean up if necessary
        // Note: We're not deleting options here as they might be needed if the plugin is reactivated
    }
} 
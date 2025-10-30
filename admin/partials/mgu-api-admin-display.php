<?php
/**
 * Provide a admin area view for the plugin
 *
 * This file is used to markup the admin-facing aspects of the plugin.
 *
 * @link       https://github.com/wbuist
 * @since      1.0.0
 *
 * @package    MGU_API_Integration
 * @subpackage MGU_API_Integration/admin/partials
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}
?>

<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
    
    <?php settings_errors(); ?>

    <form method="post" action="options.php">
        <?php
        settings_fields('mgu_api_options');
        do_settings_sections('mgu_api_options');
        submit_button();
        ?>
    </form>

    <div class="card">
        <h2><?php _e('API Status', 'mgu-api-integration'); ?></h2>
        <?php
        $api_client = new MGU_API_Client();
        $test_result = $api_client->test_connection();
        
        error_log('Test connection result: ' . print_r($test_result, true));
        
        if (is_wp_error($test_result)) {
            error_log('Test connection error: ' . $test_result->get_error_message());
            error_log('Test connection error data: ' . print_r($test_result->get_error_data(), true));
            echo '<div class="notice notice-error"><p>';
            echo esc_html($test_result->get_error_message());
            echo '</p></div>';
        } else {
            error_log('Test connection successful');
            echo '<div class="notice notice-success"><p>';
            _e('API connection successful!', 'mgu-api-integration');
            echo '</p></div>';
        }
        ?>
    </div>
</div> 
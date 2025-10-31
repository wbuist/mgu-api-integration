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

    <!-- Shortcode Copy Section -->
    <div class="card" style="max-width: 100%; margin-bottom: 20px;">
        <h2><?php _e('Shortcode', 'mgu-api-integration'); ?></h2>
        <p><?php _e('Use the shortcode below to display the insurance flow on any page or post.', 'mgu-api-integration'); ?></p>
        <div class="mgu-shortcode-wrapper" style="display: flex; gap: 10px; align-items: center; margin: 15px 0;">
            <input type="text" 
                   id="mgu-shortcode-input" 
                   value="[gadget_insurance_sales]" 
                   readonly 
                   style="flex: 1; padding: 10px 15px; font-family: monospace; font-size: 14px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; cursor: text;"
                   onclick="this.select();">
            <button type="button" 
                    id="mgu-copy-shortcode-btn" 
                    class="button button-primary" 
                    style="padding: 10px 20px; white-space: nowrap;">
                <span class="mgu-copy-text"><?php _e('Copy', 'mgu-api-integration'); ?></span>
                <span class="mgu-copied-text" style="display: none;"><?php _e('Copied!', 'mgu-api-integration'); ?></span>
            </button>
        </div>
        <p class="description">
            <?php _e('Paste this shortcode into any page or post where you want the insurance flow to appear.', 'mgu-api-integration'); ?>
        </p>
    </div>

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

<script>
(function($) {
    'use strict';
    
    $(document).ready(function() {
        // Copy shortcode to clipboard
        $('#mgu-copy-shortcode-btn').on('click', function(e) {
            e.preventDefault();
            
            var $input = $('#mgu-shortcode-input');
            var $copyText = $(this).find('.mgu-copy-text');
            var $copiedText = $(this).find('.mgu-copied-text');
            var $button = $(this);
            
            // Select and copy text
            $input.select();
            $input[0].setSelectionRange(0, 99999); // For mobile devices
            
            try {
                // Try modern clipboard API first
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText($input.val()).then(function() {
                        // Success - show feedback
                        $copyText.hide();
                        $copiedText.show();
                        $button.removeClass('button-primary').addClass('button-secondary');
                        
                        // Reset after 2 seconds
                        setTimeout(function() {
                            $copyText.show();
                            $copiedText.hide();
                            $button.removeClass('button-secondary').addClass('button-primary');
                        }, 2000);
                    }).catch(function(err) {
                        console.error('Failed to copy: ', err);
                        // Fall back to document.execCommand
                        fallbackCopy();
                    });
                } else {
                    // Fallback for older browsers
                    fallbackCopy();
                }
            } catch (err) {
                console.error('Copy failed: ', err);
                fallbackCopy();
            }
            
            function fallbackCopy() {
                try {
                    var successful = document.execCommand('copy');
                    if (successful) {
                        $copyText.hide();
                        $copiedText.show();
                        $button.removeClass('button-primary').addClass('button-secondary');
                        
                        setTimeout(function() {
                            $copyText.show();
                            $copiedText.hide();
                            $button.removeClass('button-secondary').addClass('button-primary');
                        }, 2000);
                    } else {
                        alert('<?php _e('Failed to copy shortcode. Please select and copy manually.', 'mgu-api-integration'); ?>');
                    }
                } catch (err) {
                    console.error('Fallback copy failed: ', err);
                    alert('<?php _e('Please select and copy the shortcode manually.', 'mgu-api-integration'); ?>');
                }
            }
        });
    });
})(jQuery);
</script> 
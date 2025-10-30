<?php
/**
 * Provide a admin area view for the plugin
 *
 * This file is used to markup the admin-facing aspects of the plugin.
 *
 * @since      1.0.0
 * @package    MGU_API_Integration
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

// Handle form submissions
if (isset($_POST['mgu_api_test_action'])) {
    check_admin_referer('mgu_api_test_nonce');
    
    $api_client = new MGU_API_Client();
    $test_result = null;
    $error = null;

    switch ($_POST['mgu_api_test_action']) {
        case 'test_connection':
            $test_result = $api_client->test_connection();
            break;
            
        case 'clear_logs':
            MGU_API_Logger::clear_logs();
            $test_result = array('message' => 'Logs cleared successfully');
            break;
    }

    if (is_wp_error($test_result)) {
        $error = $test_result->get_error_message();
    }
}

// Get recent logs
$logs = MGU_API_Logger::get_logs();
?>

<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>

    <?php if (isset($error)): ?>
        <div class="notice notice-error">
            <p><?php echo esc_html($error); ?></p>
        </div>
    <?php endif; ?>

    <?php if (isset($test_result) && !is_wp_error($test_result)): ?>
        <div class="notice notice-success">
            <p>Test completed successfully!</p>
            <pre><?php echo esc_html(print_r($test_result, true)); ?></pre>
        </div>
    <?php endif; ?>

    <div class="card">
        <h2>API Connection Test</h2>
        <p>Test the connection to the MGU API and verify your credentials.</p>
        
        <form method="post" action="">
            <?php wp_nonce_field('mgu_api_test_nonce'); ?>
            <input type="hidden" name="mgu_api_test_action" value="test_connection">
            <?php submit_button('Test Connection', 'primary', 'submit', false); ?>
        </form>
    </div>

    <div class="card">
        <h2>Recent Logs</h2>
        <p>View recent API interactions and any errors that occurred.</p>
        
        <form method="post" action="">
            <?php wp_nonce_field('mgu_api_test_nonce'); ?>
            <input type="hidden" name="mgu_api_test_action" value="clear_logs">
            <?php submit_button('Clear Logs', 'secondary', 'submit', false); ?>
        </form>

        <?php if (empty($logs)): ?>
            <p>No logs found.</p>
        <?php else: ?>
            <table class="widefat">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Level</th>
                        <th>Message</th>
                        <th>Context</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($logs as $log): ?>
                        <tr>
                            <td><?php echo esc_html($log['timestamp']); ?></td>
                            <td><?php echo esc_html($log['level']); ?></td>
                            <td><?php echo esc_html($log['message']); ?></td>
                            <td>
                                <pre><?php echo esc_html(print_r($log['context'], true)); ?></pre>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>
</div>

<style>
.card {
    background: #fff;
    border: 1px solid #ccd0d4;
    border-radius: 4px;
    margin-top: 20px;
    padding: 20px;
    box-shadow: 0 1px 1px rgba(0,0,0,.04);
}
.card h2 {
    margin-top: 0;
}
pre {
    background: #f0f0f1;
    padding: 10px;
    overflow: auto;
    max-height: 200px;
}
</style> 
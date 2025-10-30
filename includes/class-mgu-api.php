<?php
/**
 * The main plugin class.
 *
 * @since      1.0.0
 * @package    MGU_API_Integration
 */

class MGU_API {

    /**
     * The loader that's responsible for maintaining and registering all hooks that power
     * the plugin.
     *
     * @since    1.0.0
     * @access   protected
     * @var      MGU_API_Loader    $loader    Maintains and registers all hooks for the plugin.
     */
    protected $loader;

    /**
     * The unique identifier of this plugin.
     *
     * @since    1.0.0
     * @access   protected
     * @var      string    $plugin_name    The string used to uniquely identify this plugin.
     */
    protected $plugin_name;

    /**
     * The current version of the plugin.
     *
     * @since    1.0.0
     * @access   protected
     * @var      string    $version    The current version of the plugin.
     */
    protected $version;

    /**
     * Initialize the class and set its properties.
     */
    public function __construct() {
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
        
        $this->plugin_name = 'mgu-api-integration';
        $this->version = '1.0.0';
        
        $this->load_dependencies();
        $this->define_admin_hooks();
        $this->define_public_hooks();
        $this->register_ajax_handlers();
        $this->register_shortcodes();
    }

    /**
     * Load the required dependencies for this plugin.
     *
     * @since    1.0.0
     * @access   private
     */
    private function load_dependencies() {
        $this->loader = new MGU_API_Loader();
    }

    /**
     * Register all of the hooks related to the admin area functionality
     * of the plugin.
     *
     * @since    1.0.0
     * @access   private
     */
    private function define_admin_hooks() {
        // Add admin menu
        $this->loader->add_action('admin_menu', $this, 'add_plugin_admin_menu');
        
        // Add Settings link to the plugin
        $this->loader->add_filter('plugin_action_links_' . MGU_API_PLUGIN_BASENAME, $this, 'add_action_links');

        // Register settings
        $this->loader->add_action('admin_init', $this, 'register_settings');

        // Gadget Icons settings page
        if (class_exists('MGU_API_Settings') === false) {
            require_once MGU_API_PLUGIN_DIR . 'includes/class-mgu-api-settings.php';
        }
        $settings = new MGU_API_Settings();
        $this->loader->add_action('admin_menu', $settings, 'register_admin_menu');
        $this->loader->add_action('admin_init', $settings, 'register_settings');
        $this->loader->add_action('admin_enqueue_scripts', $settings, 'admin_enqueue');
    }

    /**
     * Register all of the hooks related to the public-facing functionality
     * of the plugin.
     */
    private function define_public_hooks() {
        $plugin_public = new MGU_API_Public($this->get_plugin_name(), $this->get_version());
        
        error_log('Registering public hooks for MGU API Integration');
        
        $this->loader->add_action('wp_enqueue_scripts', $plugin_public, 'enqueue_styles');
        $this->loader->add_action('wp_enqueue_scripts', $plugin_public, 'enqueue_scripts');
    }

    /**
     * Register AJAX handlers
     */
    public function register_ajax_handlers() {
        // Register AJAX actions for both logged-in and non-logged-in users
        add_action('wp_ajax_mgu_api_get_manufacturers', array($this, 'ajax_get_manufacturers'));
        add_action('wp_ajax_nopriv_mgu_api_get_manufacturers', array($this, 'ajax_get_manufacturers'));
        
        add_action('wp_ajax_mgu_api_get_models', array($this, 'ajax_get_models'));
        add_action('wp_ajax_nopriv_mgu_api_get_models', array($this, 'ajax_get_models'));
        
        add_action('wp_ajax_mgu_api_get_quote', array($this, 'ajax_get_quote'));
        add_action('wp_ajax_nopriv_mgu_api_get_quote', array($this, 'ajax_get_quote'));
        
        add_action('wp_ajax_mgu_api_create_customer', array($this, 'ajax_create_customer'));
        add_action('wp_ajax_nopriv_mgu_api_create_customer', array($this, 'ajax_create_customer'));
        
        add_action('wp_ajax_mgu_api_update_customer', array($this, 'ajax_update_customer'));
        add_action('wp_ajax_nopriv_mgu_api_update_customer', array($this, 'ajax_update_customer'));

        // Add new handlers for basket and policy operations
        add_action('wp_ajax_mgu_api_open_basket', array($this, 'ajax_open_basket'));
        add_action('wp_ajax_nopriv_mgu_api_open_basket', array($this, 'ajax_open_basket'));
        
        add_action('wp_ajax_mgu_api_add_gadget', array($this, 'ajax_add_gadget'));
        add_action('wp_ajax_nopriv_mgu_api_add_gadget', array($this, 'ajax_add_gadget'));
        
        add_action('wp_ajax_mgu_api_confirm_basket', array($this, 'ajax_confirm_basket'));
        add_action('wp_ajax_nopriv_mgu_api_confirm_basket', array($this, 'ajax_confirm_basket'));
        
        add_action('wp_ajax_mgu_api_pay_by_direct_debit', array($this, 'ajax_pay_by_direct_debit'));
        add_action('wp_ajax_nopriv_mgu_api_pay_by_direct_debit', array($this, 'ajax_pay_by_direct_debit'));
        
        add_action('wp_ajax_mgu_api_add_loss_cover', array($this, 'ajax_add_loss_cover'));
        add_action('wp_ajax_nopriv_mgu_api_add_loss_cover', array($this, 'ajax_add_loss_cover'));
        
        add_action('wp_ajax_mgu_api_remove_loss_cover', array($this, 'ajax_remove_loss_cover'));
        add_action('wp_ajax_nopriv_mgu_api_remove_loss_cover', array($this, 'ajax_remove_loss_cover'));
        
        add_action('wp_ajax_mgu_api_get_basket', array($this, 'ajax_get_basket'));
        add_action('wp_ajax_nopriv_mgu_api_get_basket', array($this, 'ajax_get_basket'));
        
        add_action('wp_ajax_mgu_api_cancel_basket', array($this, 'ajax_cancel_basket'));
        add_action('wp_ajax_nopriv_mgu_api_cancel_basket', array($this, 'ajax_cancel_basket'));
        
        add_action('wp_ajax_mgu_api_remove_policy', array($this, 'ajax_remove_policy'));
        add_action('wp_ajax_nopriv_mgu_api_remove_policy', array($this, 'ajax_remove_policy'));
    }

    /**
     * AJAX handler for getting manufacturers
     */
    public function ajax_get_manufacturers() {
        
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'mgu_api_nonce')) {
            wp_send_json_error('Invalid security token');
            return;
        }
        
        $gadget_type = isset($_POST['gadget_type']) ? sanitize_text_field($_POST['gadget_type']) : '';
        
        // Validate gadget type against allowed values from Swagger
        $allowed_gadget_types = array('None', 'MobilePhone', 'Laptop', 'Tablet', 'VRHeadset', 'Watch', 'GamesConsole');
        if (!in_array($gadget_type, $allowed_gadget_types)) {
            wp_send_json_error('Invalid gadget type');
            return;
        }
        
        $api_client = new MGU_API_Client();
        $response = $api_client->get_manufacturers($gadget_type);
        
        if (is_wp_error($response)) {
            wp_send_json_error($response->get_error_message());
            return;
        }
        
        wp_send_json_success($response);
    }

    /**
     * AJAX handler for getting models
     */
    public function ajax_get_models() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'mgu_api_nonce')) {
            wp_send_json_error('Invalid security token');
            return;
        }
        
        $manufacturer_id = isset($_POST['manufacturer_id']) ? intval($_POST['manufacturer_id']) : 0;
        $gadget_type = isset($_POST['gadget_type']) ? sanitize_text_field($_POST['gadget_type']) : '';
        
        if (empty($manufacturer_id) || $manufacturer_id <= 0) {
            wp_send_json_error('Valid manufacturer ID is required');
            return;
        }
        
        if (empty($gadget_type)) {
            wp_send_json_error('Gadget type is required');
            return;
        }
        
        // Validate gadget type against allowed values from Swagger
        $allowed_gadget_types = array('None', 'MobilePhone', 'Laptop', 'Tablet', 'VRHeadset', 'Watch', 'GamesConsole');
        if (!in_array($gadget_type, $allowed_gadget_types)) {
            wp_send_json_error('Invalid gadget type');
            return;
        }
        
        $api_client = new MGU_API_Client();
        $response = $api_client->get_models($manufacturer_id, $gadget_type);
        
        if (is_wp_error($response)) {
            wp_send_json_error($response->get_error_message());
            return;
        }
        
        error_log('API Response: ' . print_r($response, true));
        wp_send_json_success($response);
    }

    /**
     * AJAX handler for getting a quote
     */
    public function ajax_get_quote() {
        error_log('AJAX request received for quote');
        error_log('POST data: ' . print_r($_POST, true));
        
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'mgu_api_nonce')) {
            error_log('Nonce verification failed for quote request');
            wp_send_json_error('Invalid security token');
            return;
        }
        
        $device_data = isset($_POST['device_data']) ? $_POST['device_data'] : array();
        if (empty($device_data)) {
            error_log('No device data provided');
            wp_send_json_error('Device data is required');
            return;
        }

        // Validate required fields for V2 API
        if (empty($device_data['productId']) || empty($device_data['memoryInstalled'])) {
            error_log('Missing required fields in device data: ' . print_r($device_data, true));
            wp_send_json_error('Product ID and Memory Installed are required');
            return;
        }
        
        // Validate purchase price if provided (it's optional)
        $purchase_price = 0; // Default value
        if (!empty($device_data['purchasePrice'])) {
            if (!is_numeric($device_data['purchasePrice']) || $device_data['purchasePrice'] <= 0) {
                error_log('Invalid purchase price: ' . $device_data['purchasePrice']);
                wp_send_json_error('Purchase price must be a valid positive number if provided');
                return;
            }
            $purchase_price = $device_data['purchasePrice'];
        }
        
        $api_client = new MGU_API_Client();
        $response = $api_client->get_quote_v2($device_data['productId'], $device_data['memoryInstalled'], $purchase_price);
        
        if (is_wp_error($response)) {
            error_log('API Error: ' . $response->get_error_message());
            wp_send_json_error($response->get_error_message());
            return;
        }
        
        error_log('Raw API Response: ' . print_r($response, true));
        error_log('Response type: ' . gettype($response));
        if (is_array($response)) {
            error_log('Response keys: ' . implode(', ', array_keys($response)));
        }
        
        wp_send_json_success($response);
    }

    /**
     * AJAX handler for creating a customer
     */
    public function ajax_create_customer() {
        error_log('=== Customer Creation Debug ===');
        error_log('AJAX request received for customer creation');
        error_log('POST data: ' . print_r($_POST, true));
        
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'mgu_api_nonce')) {
            error_log('Nonce verification failed for customer creation');
            wp_send_json_error('Invalid security token');
            return;
        }
        
        $customer_data = isset($_POST['customer_data']) ? $_POST['customer_data'] : array();
        
        if (empty($customer_data)) {
            error_log('No customer data provided');
            wp_send_json_error('Customer data is required');
            return;
        }

        // Convert marketingOk to boolean
        if (isset($customer_data['marketingOk'])) {
            $customer_data['marketingOk'] = filter_var($customer_data['marketingOk'], FILTER_VALIDATE_BOOLEAN);
        }

        // Validate required fields according to TGadgetCustomer specification
        $required_fields = array('givenName', 'lastName', 'email', 'mobileNumber', 'address1', 'postCode');
        foreach ($required_fields as $field) {
            if (empty($customer_data[$field])) {
                error_log("Missing required field: {$field}");
                wp_send_json_error("Missing required field: {$field}");
                return;
            }
        }

        // Validate field lengths according to Swagger specification
        $field_lengths = array(
            'title' => 4,
            'givenName' => 25,
            'lastName' => 30,
            'companyName' => 250,
            'address1' => 25,
            'address2' => 25,
            'address3' => 25,
            'address4' => 25,
            'postCode' => 9,
            'email' => 75,
            'mobileNumber' => 25,
            'homePhone' => 25,
            'externalId' => 75
        );

        foreach ($field_lengths as $field => $max_length) {
            if (isset($customer_data[$field]) && strlen($customer_data[$field]) > $max_length) {
                error_log("Field {$field} exceeds maximum length of {$max_length}");
                wp_send_json_error("Field {$field} exceeds maximum length of {$max_length}");
                return;
            }
        }
        
        error_log('Customer data validated, calling API client');
        $api_client = new MGU_API_Client();
        $response = $api_client->create_customer($customer_data);
        
        if (is_wp_error($response)) {
            error_log('API Error: ' . $response->get_error_message());
            wp_send_json_error($response->get_error_message());
            return;
        }
        
        error_log('Customer creation response: ' . print_r($response, true));
        error_log('=== End Customer Creation Debug ===');
        wp_send_json_success($response);
    }
    
    /**
     * AJAX handler for updating a customer
     */
    public function ajax_update_customer() {
        error_log('=== Customer Update Debug ===');
        error_log('AJAX request received for customer update');
        error_log('POST data: ' . print_r($_POST, true));
        
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'mgu_api_nonce')) {
            error_log('Nonce verification failed for customer update');
            wp_send_json_error('Invalid security token');
            return;
        }
        
        $customer_data = isset($_POST['customer_data']) ? $_POST['customer_data'] : array();
        
        if (empty($customer_data)) {
            error_log('No customer data provided');
            wp_send_json_error('Customer data is required');
            return;
        }

        // Convert marketingOk to boolean
        if (isset($customer_data['marketingOk'])) {
            $customer_data['marketingOk'] = filter_var($customer_data['marketingOk'], FILTER_VALIDATE_BOOLEAN);
        }

        // Ensure id is an integer (required by API)
        if (isset($customer_data['id'])) {
            $customer_data['id'] = intval($customer_data['id']);
        }

        // Validate required fields according to TGadgetCustomer specification
        $required_fields = array('givenName', 'lastName', 'email', 'mobileNumber', 'address1', 'postCode');
        foreach ($required_fields as $field) {
            if (empty($customer_data[$field])) {
                error_log("Missing required field: {$field}");
                wp_send_json_error("Missing required field: {$field}");
                return;
            }
        }

        // Validate field lengths according to Swagger specification
        $field_lengths = array(
            'title' => 4,
            'givenName' => 25,
            'lastName' => 30,
            'companyName' => 250,
            'address1' => 25,
            'address2' => 25,
            'address3' => 25,
            'address4' => 25,
            'postCode' => 9,
            'email' => 75,
            'mobileNumber' => 25,
            'homePhone' => 25,
            'externalId' => 75
        );

        foreach ($field_lengths as $field => $max_length) {
            if (isset($customer_data[$field]) && strlen($customer_data[$field]) > $max_length) {
                error_log("Field {$field} exceeds maximum length of {$max_length}");
                wp_send_json_error("Field {$field} exceeds maximum length of {$max_length}");
                return;
            }
        }
        
        error_log('Customer data validated, calling API client');
        $api_client = new MGU_API_Client();
        $response = $api_client->update_customer($customer_data);
        
        if (is_wp_error($response)) {
            error_log('API Error: ' . $response->get_error_message());
            wp_send_json_error($response->get_error_message());
            return;
        }
        
        error_log('Customer update response: ' . print_r($response, true));
        error_log('=== End Customer Update Debug ===');
        wp_send_json_success($response);
    }

    /**
     * AJAX handler for opening a basket
     */
    public function ajax_open_basket() {
        error_log('=== Open Basket Debug ===');
        error_log('AJAX request received for opening basket');
        error_log('POST data: ' . print_r($_POST, true));
        
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'mgu_api_nonce')) {
            error_log('Nonce verification failed for opening basket');
            wp_send_json_error('Invalid security token');
            return;
        }
        
        $customer_id = isset($_POST['customer_id']) ? intval($_POST['customer_id']) : 0;
        $premium_period = isset($_POST['premium_period']) ? sanitize_text_field($_POST['premium_period']) : '';
        $include_loss_cover = isset($_POST['include_loss_cover']) ? sanitize_text_field($_POST['include_loss_cover']) : '';
        
        if (!$customer_id || !$premium_period || !$include_loss_cover) {
            error_log('Missing required fields for opening basket');
            wp_send_json_error('Missing required fields');
            return;
        }
        
        // Validate premium period enum values
        $allowed_premium_periods = array('Month', 'Annual');
        if (!in_array($premium_period, $allowed_premium_periods)) {
            wp_send_json_error('Premium period must be "Month" or "Annual"');
            return;
        }
        
        // Validate include loss cover enum values
        $allowed_loss_cover = array('Yes', 'No');
        if (!in_array($include_loss_cover, $allowed_loss_cover)) {
            wp_send_json_error('Include loss cover must be "Yes" or "No"');
            return;
        }
        
        error_log('Opening basket for customer: ' . $customer_id);
        $api_client = new MGU_API_Client();
        $response = $api_client->open_basket($customer_id, $premium_period, $include_loss_cover);
        
        if (is_wp_error($response)) {
            error_log('API Error: ' . $response->get_error_message());
            wp_send_json_error($response->get_error_message());
            return;
        }
        
        error_log('Basket opened successfully: ' . print_r($response, true));
        error_log('=== End Open Basket Debug ===');
        wp_send_json_success($response);
    }

    /**
     * AJAX handler for adding a gadget to the basket
     */
    public function ajax_add_gadget() {
        error_log('=== Add Gadget Debug ===');
        error_log('AJAX request received for adding gadget');
        error_log('POST data: ' . print_r($_POST, true));
        
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'mgu_api_nonce')) {
            error_log('Nonce verification failed for adding gadget');
            wp_send_json_error('Invalid security token');
            return;
        }
        
        $basket_id = isset($_POST['basket_id']) ? intval($_POST['basket_id']) : 0;
        $gadget_data = isset($_POST['gadget_data']) ? $_POST['gadget_data'] : array();
        
        if (!$basket_id || empty($gadget_data)) {
            error_log('Missing required fields for adding gadget');
            wp_send_json_error('Missing required fields');
            return;
        }
        
        // Ensure premiumId is an integer (required by API)
        if (isset($gadget_data['premiumId'])) {
            $gadget_data['premiumId'] = intval($gadget_data['premiumId']);
        }
        
        // Ensure purchasePrice is a number (required by API)
        if (isset($gadget_data['purchasePrice'])) {
            $gadget_data['purchasePrice'] = floatval($gadget_data['purchasePrice']);
        }
        
        error_log('Adding gadget to basket: ' . $basket_id);
        $api_client = new MGU_API_Client();
        
        // Extract V2 API parameters from gadget_data
        $product_id = isset($gadget_data['productId']) ? intval($gadget_data['productId']) : 0;
        $date_of_purchase = isset($gadget_data['dateOfPurchase']) ? sanitize_text_field($gadget_data['dateOfPurchase']) : '';
        $serial_number = isset($gadget_data['serialNumber']) ? sanitize_text_field($gadget_data['serialNumber']) : '';
        $installed_memory = isset($gadget_data['installedMemory']) ? sanitize_text_field($gadget_data['installedMemory']) : '';
        $purchase_price = isset($gadget_data['purchasePrice']) ? floatval($gadget_data['purchasePrice']) : 0;
        
        error_log('V2 API parameters: productId=' . $product_id . ', dateOfPurchase=' . $date_of_purchase . ', serialNumber=' . $serial_number . ', installedMemory=' . $installed_memory . ', purchasePrice=' . $purchase_price);
        
        $response = $api_client->insure_gadget($basket_id, $product_id, $date_of_purchase, $serial_number, $installed_memory, $purchase_price);
        
        if (is_wp_error($response)) {
            error_log('API Error: ' . $response->get_error_message());
            wp_send_json_error($response->get_error_message());
            return;
        }
        
        error_log('Gadget added successfully: ' . print_r($response, true));
        error_log('=== End Add Gadget Debug ===');
        wp_send_json_success($response);
    }

    /**
     * AJAX handler for confirming the basket
     */
    public function ajax_confirm_basket() {
        error_log('=== Confirm Basket Debug ===');
        error_log('AJAX request received for confirming basket');
        error_log('POST data: ' . print_r($_POST, true));
        
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'mgu_api_nonce')) {
            error_log('Nonce verification failed for confirming basket');
            wp_send_json_error('Invalid security token');
            return;
        }
        
        $basket_id = isset($_POST['basket_id']) ? intval($_POST['basket_id']) : 0;
        
        if (!$basket_id) {
            error_log('Missing basket ID for confirmation');
            wp_send_json_error('Missing basket ID');
            return;
        }
        
        error_log('Confirming basket: ' . $basket_id);
        $api_client = new MGU_API_Client();
        $response = $api_client->confirm_basket($basket_id);
        
        if (is_wp_error($response)) {
            error_log('API Error: ' . $response->get_error_message());
            wp_send_json_error($response->get_error_message());
            return;
        }
        
        error_log('Basket confirmed successfully: ' . print_r($response, true));
        
        // If payment is required, automatically process it with stored payment data
        if (isset($response['Outcome']) && $response['Outcome'] === 'PaymentRequired') {
            error_log('Payment required, processing with stored payment data');
            
            // Get customer ID from basket (we need to find a way to get this)
            // For now, we'll need to pass the customer ID in the request
            $customer_id = isset($_POST['customer_id']) ? intval($_POST['customer_id']) : 0;
            
            if ($customer_id) {
                // Retrieve stored payment data
                $payment_data = get_transient('mgu_payment_data_' . $customer_id);
                
                if ($payment_data) {
                    error_log('Found stored payment data for customer: ' . $customer_id);
                    
                    // Process direct debit payment
                    $payment_response = $api_client->pay_by_direct_debit($basket_id, $payment_data);
                    
                    if (is_wp_error($payment_response)) {
                        error_log('Payment processing error: ' . $payment_response->get_error_message());
                        // Don't fail the entire process, just log the error
                    } else {
                        error_log('Payment processed successfully: ' . print_r($payment_response, true));
                        // Update the response with payment result
                        $response = $payment_response;
                        
                        // Clean up stored payment data
                        delete_transient('mgu_payment_data_' . $customer_id);
                    }
                } else {
                    error_log('No stored payment data found for customer: ' . $customer_id);
                }
            } else {
                error_log('No customer ID provided for payment processing');
            }
        }
        
        error_log('=== End Confirm Basket Debug ===');
        wp_send_json_success($response);
    }

    /**
     * AJAX handler for paying by direct debit
     */
    public function ajax_pay_by_direct_debit() {
        error_log('=== Pay By Direct Debit Debug ===');
        error_log('AJAX request received for direct debit payment');
        error_log('POST data: ' . print_r($_POST, true));
        
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'mgu_api_nonce')) {
            error_log('Nonce verification failed for direct debit payment');
            wp_send_json_error('Invalid security token');
            return;
        }
        
        $basket_id = isset($_POST['basket_id']) ? intval($_POST['basket_id']) : 0;
        $direct_debit = isset($_POST['direct_debit']) ? $_POST['direct_debit'] : array();
        
        if (!$basket_id || empty($direct_debit)) {
            error_log('Missing required fields for direct debit payment');
            wp_send_json_error('Missing required fields');
            return;
        }
        
        // Validate direct debit data
        $required_fields = ['NameOnAccount', 'AccountNumber', 'SortCode'];
        foreach ($required_fields as $field) {
            if (empty($direct_debit[$field])) {
                error_log('Missing required direct debit field: ' . $field);
                wp_send_json_error('Missing required field: ' . $field);
                return;
            }
        }
        
        error_log('Processing direct debit payment for basket: ' . $basket_id);
        $api_client = new MGU_API_Client();
        $response = $api_client->pay_by_direct_debit($basket_id, $direct_debit);
        
        if (is_wp_error($response)) {
            error_log('API Error: ' . $response->get_error_message());
            wp_send_json_error($response->get_error_message());
            return;
        }
        
        error_log('Direct debit payment processed successfully: ' . print_r($response, true));
        error_log('=== End Pay By Direct Debit Debug ===');
        wp_send_json_success($response);
    }

    /**
     * Run the loader to execute all of the hooks with WordPress.
     *
     * @since    1.0.0
     */
    public function run() {
        $this->loader->run();
    }

    /**
     * Register all settings
     *
     * @since    1.0.0
     */
    public function register_settings() {
        // Environment setting
        register_setting('mgu_api_options', 'mgu_api_environment', array(
            'type' => 'string',
            'sanitize_callback' => array($this, 'sanitize_environment'),
            'default' => 'sandbox'
        ));

        // Sandbox credentials
        register_setting('mgu_api_options', 'mgu_api_sandbox_client_id', array(
            'type' => 'string',
            'sanitize_callback' => array($this, 'sanitize_client_id'),
            'default' => 'APITEST001'
        ));

        register_setting('mgu_api_options', 'mgu_api_sandbox_client_secret', array(
            'type' => 'string',
            'sanitize_callback' => array($this, 'sanitize_client_secret'),
            'default' => ''
        ));

        // Production credentials
        register_setting('mgu_api_options', 'mgu_api_production_client_id', array(
            'type' => 'string',
            'sanitize_callback' => array($this, 'sanitize_client_id'),
            'default' => ''
        ));

        register_setting('mgu_api_options', 'mgu_api_production_client_secret', array(
            'type' => 'string',
            'sanitize_callback' => array($this, 'sanitize_client_secret'),
            'default' => ''
        ));

        // Legacy settings for backward compatibility
        register_setting('mgu_api_options', 'mgu_api_endpoint', array(
            'type' => 'string',
            'sanitize_callback' => array($this, 'sanitize_endpoint'),
            'default' => 'https://sandbox.api.mygadgetumbrella.com'
        ));

        register_setting('mgu_api_options', 'mgu_api_client_id', array(
            'type' => 'string',
            'sanitize_callback' => array($this, 'sanitize_client_id'),
            'default' => 'APITEST001'
        ));

        register_setting('mgu_api_options', 'mgu_api_client_secret', array(
            'type' => 'string',
            'sanitize_callback' => array($this, 'sanitize_client_secret'),
            'default' => ''
        ));

        add_settings_section(
            'mgu_api_main_section',
            __('API Configuration', 'mgu-api-integration'),
            array($this, 'section_callback'),
            'mgu_api_options'
        );

        add_settings_field(
            'mgu_api_environment',
            'Environment',
            array($this, 'environment_field_callback'),
            'mgu_api_options',
            'mgu_api_main_section'
        );

        add_settings_field(
            'mgu_api_sandbox_credentials',
            'Sandbox Credentials',
            array($this, 'sandbox_credentials_field_callback'),
            'mgu_api_options',
            'mgu_api_main_section'
        );

        add_settings_field(
            'mgu_api_production_credentials',
            'Production Credentials',
            array($this, 'production_credentials_field_callback'),
            'mgu_api_options',
            'mgu_api_main_section'
        );

        // UI setting: Show External Customer ID field on policy form
        register_setting('mgu_api_options', 'mgu_api_show_external_id', array(
            'type' => 'boolean',
            'sanitize_callback' => array($this, 'sanitize_boolean'),
            'default' => false
        ));

        add_settings_field(
            'mgu_api_show_external_id',
            __('Show External Customer ID field', 'mgu-api-integration'),
            array($this, 'show_external_id_field_callback'),
            'mgu_api_options',
            'mgu_api_main_section'
        );
    }

    /**
     * Settings section callback
     *
     * @since    1.0.0
     */
    public function section_callback() {
        echo '<p>' . __('Configure your MGU API settings below. Choose between sandbox (for testing) and production (for live transactions).', 'mgu-api-integration') . '</p>';
    }

    /**
     * Environment field callback
     *
     * @since    1.0.0
     */
    public function environment_field_callback() {
        $environment = get_option('mgu_api_environment', 'sandbox');
        echo '<select name="mgu_api_environment" id="mgu_api_environment">';
        echo '<option value="sandbox" ' . selected($environment, 'sandbox', false) . '>' . __('Sandbox (Testing)', 'mgu-api-integration') . '</option>';
        echo '<option value="production" ' . selected($environment, 'production', false) . '>' . __('Production (Live)', 'mgu-api-integration') . '</option>';
        echo '</select>';
        echo '<p class="description">' . __('Select the environment to use. Sandbox for testing, Production for live transactions.', 'mgu-api-integration') . '</p>';
    }

    /**
     * Sandbox credentials field callback
     *
     * @since    1.0.0
     */
    public function sandbox_credentials_field_callback() {
        $client_id = get_option('mgu_api_sandbox_client_id');
        $client_secret = get_option('mgu_api_sandbox_client_secret');
        
        echo '<table class="form-table">';
        echo '<tr>';
        echo '<td><label for="mgu_api_sandbox_client_id">' . __('Client ID:', 'mgu-api-integration') . '</label></td>';
        echo '<td><input type="text" name="mgu_api_sandbox_client_id" id="mgu_api_sandbox_client_id" value="' . esc_attr($client_id) . '" class="regular-text" /></td>';
        echo '</tr>';
        echo '<tr>';
        echo '<td><label for="mgu_api_sandbox_client_secret">' . __('Client Secret:', 'mgu-api-integration') . '</label></td>';
        echo '<td><input type="password" name="mgu_api_sandbox_client_secret" id="mgu_api_sandbox_client_secret" value="' . esc_attr($client_secret) . '" class="regular-text" /></td>';
        echo '</tr>';
        echo '</table>';
        echo '<p class="description">' . __('Enter your sandbox credentials for testing. These are used when Environment is set to Sandbox.', 'mgu-api-integration') . '</p>';
    }

    /**
     * Production credentials field callback
     *
     * @since    1.0.0
     */
    public function production_credentials_field_callback() {
        $client_id = get_option('mgu_api_production_client_id');
        $client_secret = get_option('mgu_api_production_client_secret');
        
        echo '<table class="form-table">';
        echo '<tr>';
        echo '<td><label for="mgu_api_production_client_id">' . __('Client ID:', 'mgu-api-integration') . '</label></td>';
        echo '<td><input type="text" name="mgu_api_production_client_id" id="mgu_api_production_client_id" value="' . esc_attr($client_id) . '" class="regular-text" /></td>';
        echo '</tr>';
        echo '<tr>';
        echo '<td><label for="mgu_api_production_client_secret">' . __('Client Secret:', 'mgu-api-integration') . '</label></td>';
        echo '<td><input type="password" name="mgu_api_production_client_secret" id="mgu_api_production_client_secret" value="' . esc_attr($client_secret) . '" class="regular-text" /></td>';
        echo '</tr>';
        echo '</table>';
        echo '<p class="description">' . __('Enter your production credentials for live transactions. These are used when Environment is set to Production.', 'mgu-api-integration') . '</p>';
    }

    /**
     * Checkbox field to toggle External Customer ID visibility
     */
    public function show_external_id_field_callback() {
        $show = get_option('mgu_api_show_external_id', false);
        echo '<label for="mgu_api_show_external_id">';
        echo '<input type="checkbox" name="mgu_api_show_external_id" id="mgu_api_show_external_id" value="1" ' . checked($show, true, false) . ' /> ';
        echo esc_html__('Display External Customer ID field on the Create Policy step', 'mgu-api-integration');
        echo '</label>';
    }

    public function sanitize_boolean($input) {
        return (bool) $input;
    }

    /**
     * Legacy API Endpoint field callback (for backward compatibility)
     *
     * @since    1.0.0
     */
    public function endpoint_field_callback() {
        $endpoint = get_option('mgu_api_endpoint');
        echo '<input type="url" name="mgu_api_endpoint" value="' . esc_attr($endpoint) . '" class="regular-text" />';
        echo '<p class="description">' . __('Enter the base URL for the MGU API (e.g., https://sandbox.api.mygadgetumbrella.com)', 'mgu-api-integration') . '</p>';
    }

    /**
     * Legacy Client ID field callback (for backward compatibility)
     *
     * @since    1.0.0
     */
    public function client_id_field_callback() {
        $client_id = get_option('mgu_api_client_id');
        echo '<input type="text" name="mgu_api_client_id" value="' . esc_attr($client_id) . '" class="regular-text" />';
        echo '<p class="description">' . __('Enter your MGU API Client ID', 'mgu-api-integration') . '</p>';
    }

    /**
     * Legacy Client Secret field callback (for backward compatibility)
     *
     * @since    1.0.0
     */
    public function client_secret_field_callback() {
        $client_secret = get_option('mgu_api_client_secret');
        $display_secret = '';
        
        if (!empty($client_secret)) {
            // Show first 4 and last 4 characters, mask the rest
            $length = strlen($client_secret);
            if ($length > 8) {
                $display_secret = substr($client_secret, 0, 4) . str_repeat('•', $length - 8) . substr($client_secret, -4);
            } else {
                $display_secret = str_repeat('•', $length);
            }
        }
        
        echo '<input type="password" name="mgu_api_client_secret" value="' . esc_attr($client_secret) . '" class="regular-text" />';
        if (!empty($display_secret)) {
            echo '<p class="description">' . __('Current secret: ', 'mgu-api-integration') . esc_html($display_secret) . '</p>';
        }
        echo '<p class="description">' . __('Enter your MGU API Client Secret', 'mgu-api-integration') . '</p>';
    }

    /**
     * Add options page
     *
     * @since    1.0.0
     */
    public function add_plugin_admin_menu() {
        add_menu_page(
            'MGU API Integration',
            'MGU API',
            'manage_options',
            'mgu-api-integration',
            array($this, 'display_plugin_admin_page'),
            'dashicons-rest-api',
            81
        );

        add_submenu_page(
            'mgu-api-integration',
            'API Test',
            'API Test',
            'manage_options',
            'mgu-api-test',
            array($this, 'display_test_page')
        );
    }

    /**
     * Render the settings page for this plugin.
     *
     * @since    1.0.0
     */
    public function display_plugin_admin_page() {
        include_once MGU_API_PLUGIN_DIR . 'admin/partials/mgu-api-admin-display.php';
    }

    /**
     * Render the test page.
     *
     * @since    1.0.0
     */
    public function display_test_page() {
        include_once MGU_API_PLUGIN_DIR . 'admin/partials/mgu-api-test-display.php';
    }

    /**
     * Add settings action link to the plugins page.
     *
     * @since    1.0.0
     */
    public function add_action_links($links) {
        $settings_link = array(
            '<a href="' . admin_url('admin.php?page=mgu-api-integration') . '">' . __('Settings', 'mgu-api-integration') . '</a>',
        );
        return array_merge($settings_link, $links);
    }

    /**
     * Register shortcodes
     */
    public function register_shortcodes() {
        add_shortcode('mgu_api_test_flow', array($this, 'render_test_flow'));
    }

    /**
     * Render the test flow
     */
    public function render_test_flow() {
        ob_start();
        include MGU_API_PLUGIN_DIR . 'public/partials/mgu-api-insurance-flow.php';
        return ob_get_clean();
    }

    /**
     * Enqueue scripts and styles for the public-facing side of the site.
     */
    public function enqueue_scripts() {

        $nonce = wp_create_nonce('mgu_api_nonce');

        wp_enqueue_script(
            'mgu-api-insurance-flow',
            MGU_API_PLUGIN_URL . 'public/js/mgu-api-insurance-flow.js',
            array('jquery'),
            MGU_API_VERSION,
            true
        );

        $localized_data = array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => $nonce
        );
 
        wp_localize_script(
            'mgu-api-insurance-flow',
            'mgu_api',
            $localized_data
        );
    }

    /**
     * The name of the plugin used to uniquely identify it within the context of
     * WordPress and to define internationalization functionality.
     *
     * @since     1.0.0
     * @return    string    The name of the plugin.
     */
    public function get_plugin_name() {
        return $this->plugin_name;
    }

    /**
     * The reference to the class that orchestrates the hooks with the plugin.
     *
     * @since     1.0.0
     * @return    MGU_API_Loader    Orchestrates the hooks of the plugin.
     */
    public function get_loader() {
        return $this->loader;
    }

    /**
     * Retrieve the version number of the plugin.
     *
     * @since     1.0.0
     * @return    string    The version number of the plugin.
     */
    public function get_version() {
        return $this->version;
    }

    public function sanitize_client_id($input) {
        $sanitized = sanitize_text_field($input);
        return $sanitized;
    }

    public function sanitize_endpoint($input) {
        $sanitized = esc_url_raw($input);
        return $sanitized;
    }

    public function sanitize_client_secret($input) {
        $sanitized = sanitize_text_field($input);
        return $sanitized;
    }

    public function sanitize_environment($input) {
        $allowed_values = array('sandbox', 'production');
        $sanitized = sanitize_text_field($input);
        
        if (!in_array($sanitized, $allowed_values)) {
            $sanitized = 'sandbox'; // Default to sandbox if invalid
        }
        
        return $sanitized;
    }

    /**
     * Get the current environment setting
     *
     * @since    1.0.0
     * @return   string
     */
    public function get_current_environment() {
        return get_option('mgu_api_environment', 'sandbox');
    }

    /**
     * Get the current environment's client ID
     *
     * @since    1.0.0
     * @return   string
     */
    public function get_current_client_id() {
        $environment = $this->get_current_environment();
        
        if ($environment === 'production') {
            return get_option('mgu_api_production_client_id', '');
        }
        
        return get_option('mgu_api_sandbox_client_id', 'APITEST001');
    }

    /**
     * Get the current environment's client secret
     *
     * @since    1.0.0
     * @return   string
     */
    public function get_current_client_secret() {
        $environment = $this->get_current_environment();
        
        if ($environment === 'production') {
            return get_option('mgu_api_production_client_secret', '');
        }
        
        return get_option('mgu_api_sandbox_client_secret', '');
    }

    /**
     * Get the current environment's base URL
     *
     * @since    1.0.0
     * @return   string
     */
    public function get_current_base_url() {
        $environment = $this->get_current_environment();
        
        if ($environment === 'production') {
            return 'https://api.mygadgetumbrella.com/api';
        }
        
        return 'https://sandbox.api.mygadgetumbrella.com/sbapi';
    }

    /**
     * Get the current environment's auth URL
     *
     * @since    1.0.0
     * @return   string
     */
    public function get_current_auth_url() {
        $environment = $this->get_current_environment();
        
        if ($environment === 'production') {
            return 'https://api.mygadgetumbrella.com/auth';
        }
        
        return 'https://sandbox.api.mygadgetumbrella.com/sbauth';
    }
    
    /**
     * AJAX handler for adding loss cover to basket
     */
    public function ajax_add_loss_cover() {
        error_log('=== Add Loss Cover Debug ===');
        error_log('AJAX request received for adding loss cover');
        error_log('POST data: ' . print_r($_POST, true));
        
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'mgu_api_nonce')) {
            error_log('Nonce verification failed for adding loss cover');
            wp_send_json_error('Invalid security token');
            return;
        }
        
        $basket_id = isset($_POST['basket_id']) ? intval($_POST['basket_id']) : 0;
        
        if (!$basket_id) {
            error_log('Missing basket ID for adding loss cover');
            wp_send_json_error('Missing basket ID');
            return;
        }
        
        error_log('Adding loss cover to basket: ' . $basket_id);
        $api_client = new MGU_API_Client();
        $response = $api_client->add_loss_cover($basket_id);
        
        if (is_wp_error($response)) {
            error_log('Error adding loss cover: ' . $response->get_error_message());
            wp_send_json_error($response->get_error_message());
            return;
        }
        
        error_log('Loss cover added successfully: ' . print_r($response, true));
        error_log('=== End Add Loss Cover Debug ===');
        wp_send_json_success($response);
    }
    
    /**
     * AJAX handler for removing loss cover from basket
     */
    public function ajax_remove_loss_cover() {
        error_log('=== Remove Loss Cover Debug ===');
        error_log('AJAX request received for removing loss cover');
        error_log('POST data: ' . print_r($_POST, true));
        
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'mgu_api_nonce')) {
            error_log('Nonce verification failed for removing loss cover');
            wp_send_json_error('Invalid security token');
            return;
        }
        
        $basket_id = isset($_POST['basket_id']) ? intval($_POST['basket_id']) : 0;
        
        if (!$basket_id) {
            error_log('Missing basket ID for removing loss cover');
            wp_send_json_error('Missing basket ID');
            return;
        }
        
        error_log('Removing loss cover from basket: ' . $basket_id);
        $api_client = new MGU_API_Client();
        $response = $api_client->remove_loss_cover($basket_id);
        
        if (is_wp_error($response)) {
            error_log('Error removing loss cover: ' . $response->get_error_message());
            wp_send_json_error($response->get_error_message());
            return;
        }
        
        error_log('Loss cover removed successfully: ' . print_r($response, true));
        error_log('=== End Remove Loss Cover Debug ===');
        wp_send_json_success($response);
    }
    
    /**
     * AJAX handler for getting basket data
     */
    public function ajax_get_basket() {
        error_log('=== Get Basket Debug ===');
        error_log('AJAX request received for getting basket');
        error_log('POST data: ' . print_r($_POST, true));
        
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'mgu_api_nonce')) {
            error_log('Nonce verification failed for getting basket');
            wp_send_json_error('Invalid security token');
            return;
        }
        
        $basket_id = isset($_POST['basket_id']) ? intval($_POST['basket_id']) : 0;
        
        if (!$basket_id) {
            error_log('Missing basket ID for getting basket');
            wp_send_json_error('Missing basket ID');
            return;
        }
        
        error_log('Getting basket data for basket: ' . $basket_id);
        $api_client = new MGU_API_Client();
        $response = $api_client->get_basket($basket_id);
        
        if (is_wp_error($response)) {
            error_log('Error getting basket: ' . $response->get_error_message());
            wp_send_json_error($response->get_error_message());
            return;
        }
        
        error_log('Basket data retrieved successfully: ' . print_r($response, true));
        error_log('=== End Get Basket Debug ===');
        wp_send_json_success($response);
    }
    
    /**
     * AJAX handler for canceling basket
     */
    public function ajax_cancel_basket() {
        error_log('=== Cancel Basket Debug ===');
        error_log('AJAX request received for canceling basket');
        error_log('POST data: ' . print_r($_POST, true));
        
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'mgu_api_nonce')) {
            error_log('Nonce verification failed for canceling basket');
            wp_send_json_error('Invalid security token');
            return;
        }
        
        $basket_id = isset($_POST['basket_id']) ? intval($_POST['basket_id']) : 0;
        
        if (!$basket_id) {
            error_log('Missing basket ID for canceling basket');
            wp_send_json_error('Missing basket ID');
            return;
        }
        
        error_log('Canceling basket: ' . $basket_id);
        $api_client = new MGU_API_Client();
        $response = $api_client->cancel_basket($basket_id);
        
        if (is_wp_error($response)) {
            error_log('Error canceling basket: ' . $response->get_error_message());
            wp_send_json_error($response->get_error_message());
            return;
        }
        
        error_log('Basket canceled successfully: ' . print_r($response, true));
        error_log('=== End Cancel Basket Debug ===');
        wp_send_json_success($response);
    }
    
    /**
     * AJAX handler for removing policy from basket
     */
    public function ajax_remove_policy() {
        error_log('=== Remove Policy Debug ===');
        error_log('AJAX request received for removing policy');
        error_log('POST data: ' . print_r($_POST, true));
        
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'mgu_api_nonce')) {
            error_log('Nonce verification failed for removing policy');
            wp_send_json_error('Invalid security token');
            return;
        }
        
        $basket_id = isset($_POST['basket_id']) ? intval($_POST['basket_id']) : 0;
        $policy_id = isset($_POST['policy_id']) ? intval($_POST['policy_id']) : 0;
        
        if (!$basket_id || !$policy_id) {
            error_log('Missing basket ID or policy ID for removing policy');
            wp_send_json_error('Missing required fields');
            return;
        }
        
        error_log('Removing policy: ' . $policy_id . ' from basket: ' . $basket_id);
        $api_client = new MGU_API_Client();
        $response = $api_client->remove_policy($basket_id, $policy_id);
        
        if (is_wp_error($response)) {
            error_log('Error removing policy: ' . $response->get_error_message());
            wp_send_json_error($response->get_error_message());
            return;
        }
        
        error_log('Policy removed successfully: ' . print_r($response, true));
        error_log('=== End Remove Policy Debug ===');
        wp_send_json_success($response);
    }
} 
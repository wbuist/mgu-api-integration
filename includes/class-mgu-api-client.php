<?php
/**
 * The API client class.
 *
 * @since      1.0.0
 * @package    MGU_API_Integration
 */

class MGU_API_Client {
    /**
     * The API endpoint URL
     *
     * @var string
     */
    protected $endpoint;

    /**
     * The client ID for API authentication
     *
     * @var string
     */
    protected $client_id;

    /**
     * The client secret for API authentication
     *
     * @var string
     */
    protected $client_secret;

    /**
     * The access token for API requests
     *
     * @var string
     */
    protected $access_token;

    /**
     * The token expiry time.
     *
     * @since    1.0.0
     * @access   private
     * @var      integer   $token_expiry    The token expiry time.
     */
    private $token_expiry;

    /**
     * The logger.
     *
     * @since    1.0.0
     * @access   private
     * @var      MGU_API_Logger    $logger    The logger.
     */
    private $logger;

    /**
     * Initialize the class and set its properties.
     *
     * @since    1.0.0
     */
    public function __construct() {
        // Get the main plugin instance to access environment settings
        global $mgu_api_plugin;
        if ($mgu_api_plugin) {
            $this->endpoint = $mgu_api_plugin->get_current_base_url();
            $this->client_id = $mgu_api_plugin->get_current_client_id();
            $this->client_secret = $mgu_api_plugin->get_current_client_secret();
        } else {
            // Fallback to legacy settings
            $this->endpoint = get_option('mgu_api_endpoint', 'https://sandbox.api.mygadgetumbrella.com');
            $this->client_id = get_option('mgu_api_client_id', 'APITEST001');
            $this->client_secret = get_option('mgu_api_client_secret', '');
        }
        
        // Check for existing valid token in transients
        $this->access_token = get_transient('mgu_api_access_token');
        $this->token_expiry = get_transient('mgu_api_token_expiry');
        
        // If no valid token, get one
        if (empty($this->access_token) || time() >= $this->token_expiry - 300) {
            error_log('MGU API Debug - No valid token found, refreshing...');
            $this->refresh_token();
        } else {
            error_log('MGU API Debug - Using cached token, expires in: ' . ($this->token_expiry - time()) . ' seconds');
        }
        
        $this->logger = new MGU_API_Logger();

        error_log('MGU API Debug - Constructor values:');
        error_log('MGU API Debug - endpoint: ' . $this->endpoint);
        error_log('MGU API Debug - client_id: ' . $this->client_id);
        error_log('MGU API Debug - client_secret: ' . substr($this->client_secret, 0, 5) . '...');
    }

    /**
     * Get a valid access token, refreshing if necessary
     */
    private function get_valid_token() {
        // Token should already be valid from constructor, but double-check
        if (empty($this->access_token) || time() >= $this->token_expiry - 300) { // Refresh 5 minutes before expiry
            error_log('MGU API Debug - Token expired during request, refreshing...');
            $this->refresh_token();
        }
        return $this->access_token;
    }

    /**
     * Refresh the access token
     */
    private function refresh_token() {
        if (empty($this->client_id) || empty($this->client_secret)) {
            error_log('MGU API Debug - Token refresh failed: Missing credentials');
            error_log('MGU API Debug - client_id: ' . $this->client_id);
            error_log('MGU API Debug - client_secret: ' . substr($this->client_secret, 0, 5) . '...');
            return false;
        }

        // Get the auth URL from the plugin instance
        global $mgu_api_plugin;
        error_log('MGU API Debug - Plugin instance available: ' . ($mgu_api_plugin ? 'Yes' : 'No'));
        
        if ($mgu_api_plugin) {
            $auth_url = $mgu_api_plugin->get_current_auth_url() . '/oauth/token';
            error_log('MGU API Debug - Using plugin auth URL: ' . $auth_url);
        } else {
            // Fallback to legacy URL construction
            $auth_url = 'https://sandbox.api.mygadgetumbrella.com/sbauth/oauth/token';
            error_log('MGU API Debug - Using fallback auth URL: ' . $auth_url);
        }
        
        error_log('MGU API Debug - Final token refresh URL: ' . $auth_url);
        
        $response = wp_remote_post($auth_url, array(
            'headers' => array(
                'accept' => 'application/json',
                'Content-Type' => 'application/x-www-form-urlencoded',
            ),
            'body' => array(
                'client_id' => $this->client_id,
                'client_secret' => $this->client_secret,
                'grant_type' => 'client_credentials'
            )
        ));

        if (is_wp_error($response)) {
            error_log('MGU API Debug - Token refresh request failed: ' . $response->get_error_message());
            return false;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        error_log('MGU API Debug - Token refresh response: ' . $body);

        if (empty($data['access_token'])) {
            error_log('MGU API Debug - Invalid token response: ' . print_r($data, true));
            return false;
        }

        $this->access_token = $data['access_token'];
        $this->token_expiry = time() + $data['expires_in'];
        
        // Store token in transients for persistence across requests
        $cache_duration = $data['expires_in'] - 300; // Cache for 5 minutes less than expiry
        set_transient('mgu_api_access_token', $this->access_token, $cache_duration);
        set_transient('mgu_api_token_expiry', $this->token_expiry, $cache_duration);
        
        error_log('MGU API Debug - Token refresh successful, expires in: ' . $data['expires_in'] . ' seconds');
        error_log('MGU API Debug - Token cached for: ' . $cache_duration . ' seconds');
        return true;
    }

    /**
     * Make an API request.
     *
     * @since    1.0.0
     * @param    string    $endpoint    The API endpoint to call.
     * @param    string    $method      The HTTP method to use.
     * @param    array     $data        The data to send with the request.
     * @param    array     $query_params Query parameters for the request.
     * @return   array|WP_Error        The API response or WP_Error on failure.
     */
    private function make_request($endpoint, $method = 'GET', $data = array(), $query_params = array()) {
        if (empty($this->endpoint) || empty($this->client_id)) {
            error_log('MGU API Debug - Configuration missing: endpoint=' . $this->endpoint . ', client_id=' . $this->client_id);
            return new WP_Error('config_error', 'API endpoint or key not configured');
        }

        $url = rtrim($this->endpoint, '/') . '/' . ltrim($endpoint, '/');
        error_log('MGU API Debug - Request URL: ' . $url);
        
        // For GET requests, append the data as query parameters
        if ($method === 'GET' && !empty($data)) {
            $url = add_query_arg($data, $url);
            error_log('MGU API Debug - GET parameters: ' . print_r($data, true));
        }
        
        // For POST requests with query parameters (like addGadgets)
        if ($method === 'POST' && !empty($query_params)) {
            $url = add_query_arg($query_params, $url);
            error_log('MGU API Debug - POST query parameters: ' . print_r($query_params, true));
        }

        // Get a valid token
        $token = $this->get_valid_token();
        if (!$token) {
            error_log('MGU API Debug - Failed to get valid token');
            return new WP_Error('auth_error', 'Failed to obtain valid access token');
        }
        error_log('MGU API Debug - Using token: ' . substr($token, 0, 20) . '...');

        $args = array(
            'method' => $method,
            'headers' => array(
                'Authorization' => 'Bearer ' . $token,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json'
            )
        );
        error_log('MGU API Debug - Request headers: ' . print_r($args['headers'], true));

        // Only add body for non-GET requests
        if ($method !== 'GET' && !empty($data)) {
            $args['body'] = json_encode($data);
            error_log('MGU API Debug - Request body: ' . $args['body']);
        }

        $response = wp_remote_request($url, $args);

        if (is_wp_error($response)) {
            error_log('MGU API Debug - Request error: ' . $response->get_error_message());
            return $response;
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $response_data = json_decode($body, true);
        
        error_log('MGU API Debug - Response code: ' . $response_code);
        error_log('MGU API Debug - Response body: ' . $body);

        // Handle token expiration
        if ($response_code === 401) {
            error_log('MGU API Debug - Token expired, clearing cache and attempting refresh');
            // Clear cached token
            delete_transient('mgu_api_access_token');
            delete_transient('mgu_api_token_expiry');
            $this->access_token = null; // Force token refresh
            return $this->make_request($endpoint, $method, $data); // Retry with original data
        }

        if ($response_code >= 400) {
            // Try multiple possible error message fields
            $error_message = 'Unknown error';
            if (isset($response_data['message'])) {
                $error_message = $response_data['message'];
            } elseif (isset($response_data['error'])) {
                $error_message = $response_data['error'];
            } elseif (isset($response_data['errors']) && is_array($response_data['errors'])) {
                $error_message = implode(', ', $response_data['errors']);
            } elseif (!empty($body)) {
                $error_message = 'API Error: ' . $body;
            }
            error_log('MGU API Debug - API error: ' . $error_message);
            return new WP_Error('api_error', $error_message, $response_data);
        }

        return $response_data;
    }

    /**
     * Create a new customer.
     *
     * @since    1.0.0
     * @param    array     $customer_data    The customer data (TGadgetCustomer structure).
     * @return   array|WP_Error             The API response or WP_Error on failure.
     */
    public function create_customer($customer_data) {
        return $this->make_request('/v2/customer', 'POST', $customer_data);
    }

    /**
     * Find a customer by MGU ID.
     *
     * @since    1.0.0
     * @param    integer   $customer_id    The MGU customer ID.
     * @return   array|WP_Error           The API response or WP_Error on failure.
     */
    public function find_customer($customer_id) {
        return $this->make_request('/v2/customer/' . $customer_id, 'GET');
    }

    /**
     * Find a customer by external ID.
     *
     * @since    1.0.0
     * @param    string    $external_id    The external customer ID.
     * @return   array|WP_Error           The API response or WP_Error on failure.
     */
    public function find_customer_by_external_id($external_id) {
        return $this->make_request('/v2/customer/find/externalid/' . $external_id, 'GET');
    }

    /**
     * Open a basket for a customer.
     *
     * @since    1.0.0
     * @param    integer   $customer_id        The customer ID.
     * @param    string    $premium_period     The premium period (Month or Annual).
     * @param    string    $include_loss_cover Whether to include loss cover (Yes or No).
     * @return   array|WP_Error               The API response or WP_Error on failure.
     */
    public function open_basket($customer_id, $premium_period, $include_loss_cover) {
        return $this->make_request('/v2/openBasket', 'GET', array(
            'customerId' => $customer_id,
            'premiumPeriod' => $premium_period,
            'includeLossCover' => $include_loss_cover
        ));
    }

    /**
     * Get an existing basket.
     *
     * @since    1.0.0
     * @param    integer   $basket_id    The basket ID.
     * @return   array|WP_Error         The API response or WP_Error on failure.
     */
    public function get_basket($basket_id) {
        return $this->make_request('/v2/getBasket', 'GET', array('basketId' => $basket_id));
    }

    /**
     * Add gadgets to the basket.
     *
     * @since    1.0.0
     * @param    integer   $basket_id     The basket ID.
     * @param    array     $gadgets       Array of TGadgetDetail objects.
     * @return   array|WP_Error          The API response or WP_Error on failure.
     */
    public function add_gadgets($basket_id, $gadgets) {
        // Add basketId to each gadget
        foreach ($gadgets as &$gadget) {
            $gadget['basketId'] = $basket_id;
        }
        return $this->make_request('/v2/insureGadgets', 'GET', array('basketId' => $basket_id));
    }

    /**
     * Get manufacturers for a specific gadget type.
     *
     * @param string $gadget_type The type of gadget (e.g., 'MobilePhone', 'Tablet', 'Laptop')
     * @return array|WP_Error Array of manufacturers or WP_Error on failure
     */
    public function get_manufacturers($gadget_type) {
        if ($gadget_type) {
            return $this->make_request('/v2/manufacturersByGadget', 'GET', array(
                'GadgetType' => $gadget_type
            ));
        } else {
            return $this->make_request('/v2/manufacturers', 'GET');
        }
    }

    /**
     * Get models for a specific manufacturer and gadget type
     *
     * @param string $manufacturer_id
     * @param string $gadget_type
     * @return array|WP_Error
     */
    public function get_models($manufacturer_id, $gadget_type) {
        // error_log('=== Models Request Debug ===');
        // error_log('Manufacturer ID: ' . $manufacturer_id);
        // error_log('Gadget Type: ' . $gadget_type);
        
        // For GET requests, we need to append the parameters to the URL
        $endpoint = '/v2/models?' . http_build_query(array(
            'ManufacturerId' => $manufacturer_id,
            'GadgetType' => $gadget_type
        ));
        
        // error_log('Full endpoint: ' . $endpoint);
        
        $response = $this->make_request($endpoint, 'GET');
        
        if (is_wp_error($response)) {
            // error_log('Models Error: ' . $response->get_error_message());
        } else {
            // error_log('Models Response: ' . print_r($response, true));
        }
        
        // error_log('=== End Models Request Debug ===');
        
        return $response;
    }

    /**
     * Confirm the basket.
     *
     * @since    1.0.0
     * @param    integer   $basket_id    The basket ID.
     * @return   array|WP_Error         The API response or WP_Error on failure.
     */
    public function confirm_basket($basket_id) {
        return $this->make_request('/v2/confirm', 'GET', array('basketId' => $basket_id));
    }

    /**
     * Process payment by direct debit.
     *
     * @since    1.0.0
     * @param    integer   $basket_id    The basket ID.
     * @param    array     $direct_debit The direct debit details.
     * @return   array|WP_Error         The API response or WP_Error on failure.
     */
    public function pay_by_direct_debit($basket_id, $direct_debit) {
        return $this->make_request('/v2/payByDirectDebit', 'POST', array(
            'basketId' => $basket_id,
            'directDebit' => $direct_debit
        ));
    }

    /**
     * Add a single gadget to basket (V2 method)
     *
     * @since    1.0.0
     * @param    integer   $basket_id         The basket ID.
     * @param    integer   $product_id        The product ID.
     * @param    string    $date_of_purchase  Date of purchase.
     * @param    string    $serial_number     Serial number.
     * @param    string    $installed_memory  Installed memory.
     * @param    number    $purchase_price    Purchase price.
     * @return   array|WP_Error              The API response or WP_Error on failure.
     */
    public function insure_gadget($basket_id, $product_id, $date_of_purchase = '', $serial_number = '', $installed_memory = '', $purchase_price = 0) {
        $params = array('basketId' => $basket_id);
        
        if ($product_id) $params['productId'] = $product_id;
        if ($date_of_purchase) $params['dateOfPurchase'] = $date_of_purchase;
        if ($serial_number) $params['serialNumber'] = $serial_number;
        if ($installed_memory) $params['installedMemory'] = $installed_memory;
        if ($purchase_price) $params['purchasePrice'] = $purchase_price;
        
        return $this->make_request('/v2/insureGadget', 'GET', $params);
    }

    /**
     * Get quote for a specific product (V2 method)
     *
     * @since    1.0.0
     * @param    integer   $product_id        The product ID.
     * @param    string    $memory_installed  Memory installed.
     * @param    number    $purchase_price    Purchase price.
     * @return   array|WP_Error              The API response or WP_Error on failure.
     */
    public function get_quote_v2($product_id, $memory_installed, $purchase_price) {
        return $this->make_request('/v2/getQuote', 'GET', array(
            'productId' => $product_id,
            'memoryInstalled' => $memory_installed,
            'purchasePrice' => $purchase_price
        ));
    }

    /**
     * Add loss cover to basket (V2 method)
     *
     * @since    1.0.0
     * @param    integer   $basket_id    The basket ID.
     * @return   array|WP_Error         The API response or WP_Error on failure.
     */
    public function add_loss_cover($basket_id) {
        return $this->make_request('/v2/addLossCover', 'GET', array('basketId' => $basket_id));
    }

    /**
     * Remove loss cover from basket (V2 method)
     *
     * @since    1.0.0
     * @param    integer   $basket_id    The basket ID.
     * @return   array|WP_Error         The API response or WP_Error on failure.
     */
    public function remove_loss_cover($basket_id) {
        return $this->make_request('/v2/removeLossCover', 'GET', array('basketId' => $basket_id));
    }

    /**
     * Remove policy from basket (V2 method)
     *
     * @since    1.0.0
     * @param    integer   $basket_id    The basket ID.
     * @param    integer   $policy_id    The policy ID.
     * @return   array|WP_Error         The API response or WP_Error on failure.
     */
    public function remove_policy($basket_id, $policy_id) {
        return $this->make_request('/v2/removePolicy', 'GET', array(
            'basketId' => $basket_id,
            'policyId' => $policy_id
        ));
    }

    /**
     * Cancel basket (V2 method)
     *
     * @since    1.0.0
     * @param    integer   $basket_id    The basket ID.
     * @return   array|WP_Error         The API response or WP_Error on failure.
     */
    public function cancel_basket($basket_id) {
        return $this->make_request('/v2/cancelBasket', 'GET', array('basketId' => $basket_id));
    }

    /**
     * Find customer by email (V2 method)
     *
     * @since    1.0.0
     * @param    string    $email_address    The email address.
     * @return   array|WP_Error             The API response or WP_Error on failure.
     */
    public function find_customer_by_email($email_address) {
        return $this->make_request('/v2/customer/find/emai/' . $email_address, 'GET');
    }

    /**
     * Find customer by mobile (V2 method)
     *
     * @since    1.0.0
     * @param    string    $mobile_number    The mobile number.
     * @return   array|WP_Error             The API response or WP_Error on failure.
     */
    public function find_customer_by_mobile($mobile_number) {
        return $this->make_request('/v2/customer/find/mobile/' . $mobile_number, 'GET');
    }

    /**
     * Test the API connection
     */
    public function test_connection() {
        return $this->make_request('/v2/manufacturers', 'GET');
    }

} 
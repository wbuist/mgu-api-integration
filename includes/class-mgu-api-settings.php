<?php
/**
 * Admin settings for selecting gadget icons.
 */

class MGU_API_Settings {

    private $option_name = 'mgu_api_gadget_icons';
    private $page_slug = 'mgu-api-gadget-icons';

    public function register_admin_menu() {
        add_submenu_page(
            'mgu-api-integration',
            __('Gadget Icons', 'mgu-api-integration'),
            __('Gadget Icons', 'mgu-api-integration'),
            'manage_options',
            $this->page_slug,
            array($this, 'render_settings_page')
        );
    }

    public function register_settings() {
        register_setting(
            'mgu_api_icons',
            $this->option_name,
            array('sanitize_callback' => array($this, 'sanitize_icons_option'))
        );

        add_settings_section(
            'mgu_icons_section',
            __('Gadget Icons', 'mgu-api-integration'),
            '__return_false',
            'mgu_api_icons'
        );

        $fields = $this->get_gadget_types();
        foreach ($fields as $key => $label) {
            add_settings_field(
                'mgu_icon_' . $key,
                esc_html($label),
                array($this, 'render_media_field'),
                'mgu_api_icons',
                'mgu_icons_section',
                array('key' => $key)
            );
        }
    }

    public function admin_enqueue($hook) {
        if ($hook !== 'mgu-api_page_' . $this->page_slug) {
            return;
        }
        wp_enqueue_media();
        wp_enqueue_script(
            'mgu-icons-admin',
            MGU_API_PLUGIN_URL . 'admin/js/mgu-icons-admin.js',
            array('jquery'),
            MGU_API_VERSION,
            true
        );
        wp_enqueue_style(
            'mgu-icons-admin',
            MGU_API_PLUGIN_URL . 'admin/css/mgu-icons-admin.css',
            array(),
            MGU_API_VERSION
        );
    }

    public function render_settings_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        echo '<div class="wrap">';
        echo '<h1>' . esc_html__('Gadget Icons', 'mgu-api-integration') . '</h1>';
        echo '<form method="post" action="options.php">';
        settings_fields('mgu_api_icons');
        do_settings_sections('mgu_api_icons');
        submit_button();
        echo '</form>';
        echo '</div>';
    }

    public function render_media_field($args) {
        $key = $args['key'];
        $options = get_option($this->option_name, array());
        $value = isset($options[$key]) ? esc_url($options[$key]) : '';

        echo '<div class="mgu-icon-field">';
        echo '<div class="mgu-icon-preview" style="width:64px;height:64px;border:1px solid #ddd;border-radius:4px;background:#fff;background-size:contain;background-position:center;background-repeat:no-repeat;';
        if ($value) {
            echo 'background-image:url(' . esc_url($value) . ');';
        }
        echo '"></div>';
        echo '<input type="url" class="regular-text mgu-icon-url" name="' . esc_attr($this->option_name) . '[' . esc_attr($key) . ']" value="' . $value . '" /> ';
        echo '<button type="button" class="button mgu-icon-select" data-target="' . esc_attr($key) . '">' . esc_html__('Select Icon', 'mgu-api-integration') . '</button> ';
        echo '<button type="button" class="button mgu-icon-remove" data-target="' . esc_attr($key) . '">' . esc_html__('Remove', 'mgu-api-integration') . '</button>';
        echo '</div>';
    }

    public function sanitize_icons_option($input) {
        $sanitized = array();
        $keys = array_keys($this->get_gadget_types());
        foreach ($keys as $key) {
            if (isset($input[$key]) && is_string($input[$key])) {
                $url = trim($input[$key]);
                $sanitized[$key] = $url !== '' ? esc_url_raw($url) : '';
            } else {
                $sanitized[$key] = '';
            }
        }
        return $sanitized;
    }

    private function get_gadget_types() {
        return array(
            'MobilePhone' => __('Mobile Phone', 'mgu-api-integration'),
            'Laptop' => __('Laptop', 'mgu-api-integration'),
            'Tablet' => __('Tablet', 'mgu-api-integration'),
            'VRHeadset' => __('VR Headset', 'mgu-api-integration'),
            'Watch' => __('Watch', 'mgu-api-integration'),
            'GamesConsole' => __('Games Console', 'mgu-api-integration'),
        );
    }
}



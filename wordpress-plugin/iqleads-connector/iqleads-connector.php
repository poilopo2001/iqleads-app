<?php
/**
 * Plugin Name: IQLead Connector
 * Plugin URI: https://iqleads.com
 * Description: Automatically send form submissions from WordPress to IQLead for AI-powered lead qualification and calling
 * Version: 1.0.0
 * Author: IQLead
 * Author URI: https://iqleads.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: iqleads-connector
 *
 * Supports: Contact Form 7, WPForms, Gravity Forms, Ninja Forms, Elementor Forms
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('IQLEADS_VERSION', '1.0.0');
define('IQLEADS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('IQLEADS_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Main IQLead Connector Class
 */
class IQLead_Connector {

    private static $instance = null;

    /**
     * Get singleton instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        // Add admin menu
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));

        // Hook into form plugins
        $this->init_form_integrations();
    }

    /**
     * Initialize form plugin integrations
     */
    private function init_form_integrations() {
        // Contact Form 7
        if (class_exists('WPCF7')) {
            add_action('wpcf7_mail_sent', array($this, 'handle_cf7_submission'), 10, 1);
        }

        // WPForms
        if (function_exists('wpforms')) {
            add_action('wpforms_process_complete', array($this, 'handle_wpforms_submission'), 10, 4);
        }

        // Gravity Forms
        if (class_exists('GFForms')) {
            add_action('gform_after_submission', array($this, 'handle_gravity_forms_submission'), 10, 2);
        }

        // Ninja Forms
        if (class_exists('Ninja_Forms')) {
            add_action('ninja_forms_after_submission', array($this, 'handle_ninja_forms_submission'), 10, 1);
        }

        // Elementor Forms
        if (did_action('elementor/loaded')) {
            add_action('elementor_pro/forms/new_record', array($this, 'handle_elementor_forms_submission'), 10, 2);
        }
    }

    /**
     * Add admin menu page
     */
    public function add_admin_menu() {
        add_options_page(
            'IQLead Connector Settings',
            'IQLead Connector',
            'manage_options',
            'iqleads-connector',
            array($this, 'render_settings_page')
        );
    }

    /**
     * Register plugin settings
     */
    public function register_settings() {
        register_setting('iqleads_settings', 'iqleads_webhook_url');
        register_setting('iqleads_settings', 'iqleads_enabled');
        register_setting('iqleads_settings', 'iqleads_debug_mode');
    }

    /**
     * Render settings page
     */
    public function render_settings_page() {
        ?>
        <div class="wrap">
            <h1>⚡ IQLead Connector Settings</h1>

            <div class="notice notice-info">
                <p><strong>📋 How to get your Webhook URL:</strong></p>
                <ol>
                    <li>Go to your IQLead dashboard</li>
                    <li>Navigate to <strong>Sources</strong></li>
                    <li>Click <strong>"Create New Source"</strong></li>
                    <li>Select <strong>"WordPress"</strong> as integration type</li>
                    <li>Copy the generated <strong>Webhook URL</strong></li>
                    <li>Paste it below</li>
                </ol>
            </div>

            <?php
            // Show detected form plugins
            $detected_plugins = $this->detect_form_plugins();
            if (!empty($detected_plugins)) {
                echo '<div class="notice notice-success">';
                echo '<p><strong>✅ Detected Form Plugins:</strong></p>';
                echo '<ul>';
                foreach ($detected_plugins as $plugin) {
                    echo '<li>' . esc_html($plugin) . '</li>';
                }
                echo '</ul>';
                echo '</div>';
            } else {
                echo '<div class="notice notice-warning">';
                echo '<p><strong>⚠️ No supported form plugins detected.</strong></p>';
                echo '<p>Please install one of: Contact Form 7, WPForms, Gravity Forms, Ninja Forms, or Elementor Pro</p>';
                echo '</div>';
            }
            ?>

            <form method="post" action="options.php">
                <?php settings_fields('iqleads_settings'); ?>
                <?php do_settings_sections('iqleads_settings'); ?>

                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">Enable IQLead Connector</th>
                        <td>
                            <input type="checkbox" name="iqleads_enabled" value="1" <?php checked(1, get_option('iqleads_enabled'), true); ?> />
                            <p class="description">Turn on to start sending leads to IQLead</p>
                        </td>
                    </tr>

                    <tr valign="top">
                        <th scope="row">Webhook URL</th>
                        <td>
                            <input type="url" name="iqleads_webhook_url" value="<?php echo esc_attr(get_option('iqleads_webhook_url')); ?>" class="regular-text" placeholder="https://your-domain.com/api/webhooks/leads/your-token" required />
                            <p class="description">Your unique IQLead webhook URL (get this from IQLead dashboard)</p>
                        </td>
                    </tr>

                    <tr valign="top">
                        <th scope="row">Debug Mode</th>
                        <td>
                            <input type="checkbox" name="iqleads_debug_mode" value="1" <?php checked(1, get_option('iqleads_debug_mode'), true); ?> />
                            <p class="description">Log all submissions to WordPress debug.log (for troubleshooting)</p>
                        </td>
                    </tr>
                </table>

                <?php submit_button('Save Settings'); ?>
            </form>

            <hr>

            <h2>🧪 Test Connection</h2>
            <p>Send a test submission to verify your webhook is working:</p>
            <form method="post" action="">
                <?php wp_nonce_field('iqleads_test_webhook', 'iqleads_test_nonce'); ?>
                <input type="hidden" name="iqleads_test_webhook" value="1">
                <table class="form-table">
                    <tr>
                        <th>Email</th>
                        <td><input type="email" name="test_email" value="test@example.com" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th>Name</th>
                        <td><input type="text" name="test_name" value="Test User" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th>Phone</th>
                        <td><input type="text" name="test_phone" value="+1234567890" class="regular-text" /></td>
                    </tr>
                </table>
                <?php submit_button('Send Test Lead', 'secondary'); ?>
            </form>

            <?php
            // Handle test webhook
            if (isset($_POST['iqleads_test_webhook']) && check_admin_referer('iqleads_test_webhook', 'iqleads_test_nonce')) {
                $this->handle_test_webhook();
            }
            ?>
        </div>
        <?php
    }

    /**
     * Detect installed form plugins
     */
    private function detect_form_plugins() {
        $plugins = array();

        if (class_exists('WPCF7')) {
            $plugins[] = 'Contact Form 7';
        }
        if (function_exists('wpforms')) {
            $plugins[] = 'WPForms';
        }
        if (class_exists('GFForms')) {
            $plugins[] = 'Gravity Forms';
        }
        if (class_exists('Ninja_Forms')) {
            $plugins[] = 'Ninja Forms';
        }
        if (did_action('elementor/loaded')) {
            $plugins[] = 'Elementor Forms';
        }

        return $plugins;
    }

    /**
     * Handle test webhook
     */
    private function handle_test_webhook() {
        $data = array(
            'email' => sanitize_email($_POST['test_email']),
            'firstName' => sanitize_text_field($_POST['test_name']),
            'phone' => sanitize_text_field($_POST['test_phone']),
            'source' => 'WordPress Test'
        );

        $result = $this->send_to_iqleads($data);

        if ($result['success']) {
            echo '<div class="notice notice-success"><p>✅ Test lead sent successfully!</p></div>';
        } else {
            echo '<div class="notice notice-error"><p>❌ Failed to send test lead: ' . esc_html($result['error']) . '</p></div>';
        }
    }

    /**
     * Send data to IQLead webhook
     */
    private function send_to_iqleads($data) {
        // Check if enabled
        if (!get_option('iqleads_enabled')) {
            return array('success' => false, 'error' => 'IQLead connector is disabled');
        }

        $webhook_url = get_option('iqleads_webhook_url');

        if (empty($webhook_url)) {
            return array('success' => false, 'error' => 'Webhook URL not configured');
        }

        // Debug logging
        if (get_option('iqleads_debug_mode')) {
            error_log('IQLead: Sending data - ' . json_encode($data));
        }

        // Send POST request
        $response = wp_remote_post($webhook_url, array(
            'headers' => array('Content-Type' => 'application/json'),
            'body' => json_encode($data),
            'timeout' => 15
        ));

        // Check for errors
        if (is_wp_error($response)) {
            $error = $response->get_error_message();
            if (get_option('iqleads_debug_mode')) {
                error_log('IQLead: Error - ' . $error);
            }
            return array('success' => false, 'error' => $error);
        }

        $status_code = wp_remote_retrieve_response_code($response);

        if ($status_code >= 200 && $status_code < 300) {
            if (get_option('iqleads_debug_mode')) {
                error_log('IQLead: Success - Status ' . $status_code);
            }
            return array('success' => true);
        } else {
            $error = 'HTTP ' . $status_code;
            if (get_option('iqleads_debug_mode')) {
                error_log('IQLead: Failed - ' . $error);
            }
            return array('success' => false, 'error' => $error);
        }
    }

    /**
     * Handle Contact Form 7 submission
     */
    public function handle_cf7_submission($contact_form) {
        $submission = WPCF7_Submission::get_instance();
        if (!$submission) return;

        $posted_data = $submission->get_posted_data();

        // Map CF7 fields to IQLead format
        $data = $this->map_cf7_fields($posted_data);

        $this->send_to_iqleads($data);
    }

    /**
     * Map Contact Form 7 fields
     */
    private function map_cf7_fields($posted_data) {
        $data = array();

        // Common CF7 field patterns
        $field_map = array(
            'email' => array('your-email', 'email', 'your-mail', 'mail'),
            'firstName' => array('your-name', 'first-name', 'firstname', 'fname', 'name'),
            'lastName' => array('your-surname', 'last-name', 'lastname', 'lname', 'surname'),
            'phone' => array('your-phone', 'phone', 'your-tel', 'tel', 'telephone'),
            'company' => array('your-company', 'company', 'company-name', 'organization'),
            'message' => array('your-message', 'message', 'your-comment', 'comment')
        );

        foreach ($field_map as $iqleads_field => $cf7_fields) {
            foreach ($cf7_fields as $cf7_field) {
                if (isset($posted_data[$cf7_field]) && !empty($posted_data[$cf7_field])) {
                    $data[$iqleads_field] = sanitize_text_field($posted_data[$cf7_field]);
                    break;
                }
            }
        }

        return $data;
    }

    /**
     * Handle WPForms submission
     */
    public function handle_wpforms_submission($fields, $entry, $form_data, $entry_id) {
        $data = array();

        foreach ($fields as $field) {
            $value = !empty($field['value']) ? $field['value'] : '';

            // Map by field type
            switch ($field['type']) {
                case 'email':
                    $data['email'] = sanitize_email($value);
                    break;
                case 'name':
                    if (isset($field['first'])) {
                        $data['firstName'] = sanitize_text_field($field['first']);
                    }
                    if (isset($field['last'])) {
                        $data['lastName'] = sanitize_text_field($field['last']);
                    }
                    break;
                case 'phone':
                    $data['phone'] = sanitize_text_field($value);
                    break;
                case 'text':
                    $label = strtolower($field['name']);
                    if (strpos($label, 'company') !== false || strpos($label, 'organization') !== false) {
                        $data['company'] = sanitize_text_field($value);
                    }
                    break;
            }
        }

        $this->send_to_iqleads($data);
    }

    /**
     * Handle Gravity Forms submission
     */
    public function handle_gravity_forms_submission($entry, $form) {
        $data = array();

        foreach ($form['fields'] as $field) {
            $value = rgar($entry, $field->id);

            switch ($field->type) {
                case 'email':
                    $data['email'] = sanitize_email($value);
                    break;
                case 'name':
                    $data['firstName'] = sanitize_text_field(rgar($entry, $field->id . '.3'));
                    $data['lastName'] = sanitize_text_field(rgar($entry, $field->id . '.6'));
                    break;
                case 'phone':
                    $data['phone'] = sanitize_text_field($value);
                    break;
                case 'text':
                    $label = strtolower($field->label);
                    if (strpos($label, 'company') !== false || strpos($label, 'organization') !== false) {
                        $data['company'] = sanitize_text_field($value);
                    }
                    break;
            }
        }

        $this->send_to_iqleads($data);
    }

    /**
     * Handle Ninja Forms submission
     */
    public function handle_ninja_forms_submission($form_data) {
        $data = array();
        $fields = $form_data['fields'];

        foreach ($fields as $field) {
            $value = $field['value'];
            $type = $field['type'];

            switch ($type) {
                case 'email':
                    $data['email'] = sanitize_email($value);
                    break;
                case 'firstname':
                    $data['firstName'] = sanitize_text_field($value);
                    break;
                case 'lastname':
                    $data['lastName'] = sanitize_text_field($value);
                    break;
                case 'phone':
                    $data['phone'] = sanitize_text_field($value);
                    break;
                case 'textbox':
                    $label = strtolower($field['label']);
                    if (strpos($label, 'company') !== false) {
                        $data['company'] = sanitize_text_field($value);
                    }
                    break;
            }
        }

        $this->send_to_iqleads($data);
    }

    /**
     * Handle Elementor Forms submission
     */
    public function handle_elementor_forms_submission($record, $handler) {
        $data = array();
        $fields = $record->get('fields');

        foreach ($fields as $field_id => $field) {
            $value = $field['value'];
            $type = $field['type'];

            switch ($type) {
                case 'email':
                    $data['email'] = sanitize_email($value);
                    break;
                case 'text':
                    $label = strtolower($field['title']);
                    if (strpos($label, 'first') !== false || strpos($label, 'prénom') !== false) {
                        $data['firstName'] = sanitize_text_field($value);
                    } elseif (strpos($label, 'last') !== false || strpos($label, 'nom') !== false) {
                        $data['lastName'] = sanitize_text_field($value);
                    } elseif (strpos($label, 'company') !== false || strpos($label, 'entreprise') !== false) {
                        $data['company'] = sanitize_text_field($value);
                    }
                    break;
                case 'tel':
                    $data['phone'] = sanitize_text_field($value);
                    break;
            }
        }

        $this->send_to_iqleads($data);
    }
}

// Initialize the plugin
add_action('plugins_loaded', array('IQLead_Connector', 'get_instance'));

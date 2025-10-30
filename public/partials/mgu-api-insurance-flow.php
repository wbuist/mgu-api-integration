<?php
/**
 * Provide a public-facing view for the plugin
 *
 * This file is used to markup the public-facing aspects of the plugin.
 *
 * @link       https://github.com/wbuist
 * @since      1.0.0
 *
 * @package    MGU_API_Integration
 * @subpackage MGU_API_Integration/public/partials
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

// Get the API client
$api_client = new MGU_API_Client();
?>

<div class="mgu-api-insurance-flow">
    
    <p class="mgu-api-description mgu-promo-box">Get a quote for your gadget insurance with multiple gadgets, loss cover options, and comprehensive coverage.</p>

    <div class="mgu-api-steps">
        <!-- Step 1: Gadget Type Selection -->
        <div id="step-gadget-type" class="mgu-api-step">
            <h3>Select Gadget Type</h3>
            <div class="mgu-api-form-group">
                <!-- Icon Grid (visible control) -->
                <div class="mgu-gadget-grid" role="radiogroup" aria-label="Select Gadget Type">
                    <button type="button" class="mgu-gadget-option mgu-gadget--MobilePhone" role="radio" aria-checked="false" data-value="MobilePhone">
                        <span class="mgu-gadget-icon" aria-hidden="true"></span>
                        <span class="mgu-gadget-label">Mobile Phone</span>
                    </button>
                    <button type="button" class="mgu-gadget-option mgu-gadget--Laptop" role="radio" aria-checked="false" data-value="Laptop">
                        <span class="mgu-gadget-icon" aria-hidden="true"></span>
                        <span class="mgu-gadget-label">Laptop</span>
                    </button>
                    <button type="button" class="mgu-gadget-option mgu-gadget--Tablet" role="radio" aria-checked="false" data-value="Tablet">
                        <span class="mgu-gadget-icon" aria-hidden="true"></span>
                        <span class="mgu-gadget-label">Tablet</span>
                    </button>
                    <button type="button" class="mgu-gadget-option mgu-gadget--VRHeadset" role="radio" aria-checked="false" data-value="VRHeadset">
                        <span class="mgu-gadget-icon" aria-hidden="true"></span>
                        <span class="mgu-gadget-label">VR Headset</span>
                    </button>
                    <button type="button" class="mgu-gadget-option mgu-gadget--Watch" role="radio" aria-checked="false" data-value="Watch">
                        <span class="mgu-gadget-icon" aria-hidden="true"></span>
                        <span class="mgu-gadget-label">Watch</span>
                    </button>
                    <button type="button" class="mgu-gadget-option mgu-gadget--GamesConsole" role="radio" aria-checked="false" data-value="GamesConsole">
                        <span class="mgu-gadget-icon" aria-hidden="true"></span>
                        <span class="mgu-gadget-label">Games Console</span>
                    </button>
                </div>

                <!-- Original select (visually hidden for compatibility) -->
                <select id="gadget-type-select" class="mgu-api-select mgu-visually-hidden" aria-hidden="true" tabindex="-1">
                    <option value="">Select a gadget type...</option>
                    <option value="MobilePhone">Mobile Phone</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Tablet">Tablet</option>
                    <option value="VRHeadset">VR Headset</option>
                    <option value="Watch">Watch</option>
                    <option value="GamesConsole">Games Console</option>
                </select>
            </div>
            <div class="mgu-api-step-result"></div>
        </div>

        <!-- Step 2: Manufacturer Selection -->
        <div class="mgu-api-step" id="step-manufacturer" style="display: none;">
            <h3>Select Manufacturer</h3>
            <select id="manufacturer-select" class="mgu-api-select">
                <option value="">Select a manufacturer...</option>
            </select>
            <div class="mgu-api-step-result"></div>
        </div>

        <!-- Step 3: Model Selection -->
        <div class="mgu-api-step" id="step-model" style="display: none;">
            <h3>Select Model</h3>
            <select id="model-select" class="mgu-api-select">
                <option value="">Select a model...</option>
            </select>
            <div class="mgu-api-step-result"></div>
        </div>

        <!-- Step 4: Device Details -->
        <div id="step-device" class="mgu-api-step" style="display: none;">
            <h3>Device Details</h3>
            <form id="device-form" class="mgu-api-form">
                <div class="mgu-api-form-group">
                    <label for="device-purchase-date">Purchase Date (Required)</label>
                    <input type="date" id="device-purchase-date" class="mgu-api-input" required>
                    <small class="mgu-api-help-text">Must be within the last 36 months</small>
                </div>
                <div class="mgu-api-form-group">
                    <label for="device-purchase-price">Purchase Price (Optional)</label>
                    <input type="number" id="device-purchase-price" class="mgu-api-input" min="0" step="0.01">
                </div>
                <div class="mgu-api-form-group">
                    <label for="device-serial-number">Serial Number (Optional)</label>
                    <input type="text" id="device-serial-number" class="mgu-api-input">
                </div>
                <!-- Memory Options (Dynamic Radio Buttons) -->
                <div id="memory-options-container" class="mgu-api-form-group" style="display: none;">
                    <label>Memory Option (Required)</label>
                    <div id="memory-radio-buttons">
                        <!-- Populated dynamically based on selected model -->
                    </div>
                </div>
                <!-- Premium Period Selection -->
                <div id="premium-period-container" class="mgu-api-form-group" style="display: none;">
                    <label>Premium Period (Required)</label>
                    <div id="premium-period-buttons" class="mgu-api-radio-group">
                        <!-- Populated dynamically with premium amounts -->
                    </div>
                </div>
                <button type="submit" id="get-quote-btn" class="mgu-api-button" disabled>Add to Quote</button>
            </form>
            <div class="mgu-api-step-result"></div>
        </div>

        <!-- Step 5: Quote Summary -->
        <div id="step-quote" class="mgu-api-step" style="display: none;">
            <h3>Review Your Quote</h3>
            
            <!-- Gadget List -->
            <div id="gadget-list" class="mgu-api-gadget-list">
                <!-- Populated dynamically -->
            </div>
            
            <!-- Loss Cover Option (Policy Level) -->
            <div class="mgu-api-form-group">
                <label>
                    <input type="checkbox" id="policy-loss-cover" name="policy-loss-cover" value="yes">
                    Add Loss Cover Protection (applies to all gadgets)
                </label>
                <div id="policy-loss-cover-info" style="margin-top: 10px;">
                    <!-- Loss cover pricing -->
                </div>
            </div>
            
            <!-- Total Premium Display -->
            <div id="total-premium-display" class="mgu-api-total-premium">
                <!-- Total premium -->
            </div>
            
            <!-- Action Buttons -->
            <button type="button" id="add-another-gadget" class="mgu-api-button mgu-api-button-secondary">Add Another Gadget</button>
            <button type="button" id="proceed-to-policy" class="mgu-api-button">Buy Policy</button>
            
            <div class="mgu-api-step-result"></div>
        </div>

        <!-- Step 5.5: Add Another Gadget -->
        <div id="step-add-gadget" class="mgu-api-step" style="display: none;">
            <h3>Add Another Gadget to Policy</h3>
            <form id="add-gadget-form" class="mgu-api-form">
                <div class="mgu-api-form-group">
                    <label for="add-gadget-type">Gadget Type</label>
                    <select id="add-gadget-type" class="mgu-api-select" required>
                        <option value="">Select a gadget type...</option>
                        <option value="MobilePhone">Mobile Phone</option>
                        <option value="Laptop">Laptop</option>
                        <option value="Tablet">Tablet</option>
                        <option value="VRHeadset">VR Headset</option>
                        <option value="Watch">Watch</option>
                        <option value="GamesConsole">Games Console</option>
                    </select>
                </div>
                <div class="mgu-api-form-group">
                    <label for="add-manufacturer">Manufacturer</label>
                    <select id="add-manufacturer" class="mgu-api-select" required>
                        <option value="">Select a manufacturer...</option>
                    </select>
                </div>
                <div class="mgu-api-form-group">
                    <label for="add-model">Model</label>
                    <select id="add-model" class="mgu-api-select" required>
                        <option value="">Select a model...</option>
                    </select>
                </div>
                <div class="mgu-api-form-group">
                    <label for="add-purchase-price">Purchase Price</label>
                    <input type="number" id="add-purchase-price" class="mgu-api-input" min="0" step="0.01" required>
                </div>
                <div class="mgu-api-form-group">
                    <label for="add-memory">Installed Memory (Optional)</label>
                    <input type="text" id="add-memory" class="mgu-api-input" placeholder="e.g., 128GB, 256GB">
                </div>
                <div class="mgu-api-form-group">
                    <label for="add-serial">Serial Number (Optional)</label>
                    <input type="text" id="add-serial" class="mgu-api-input">
                </div>
                <button type="submit" class="mgu-api-button">Add Gadget</button>
                <button type="button" id="cancel-add-gadget" class="mgu-api-button mgu-api-button-secondary">Cancel</button>
            </form>
            <div class="mgu-api-step-result"></div>
        </div>

        <!-- Step 6: Policy Creation -->
        <div class="mgu-api-step" id="step-policy" style="display: none;">
            <h3>Create Policy</h3>
            <form id="policy-form" class="mgu-api-form">
                <div class="form-group">
                    <label for="policy-first-name">First Name</label>
                    <input type="text" id="policy-first-name" required>
                </div>
                <div class="form-group">
                    <label for="policy-last-name">Last Name</label>
                    <input type="text" id="policy-last-name" required>
                </div>
                <div class="form-group">
                    <label for="policy-email">Email</label>
                    <input type="email" id="policy-email" required>
                </div>
                <div class="form-group">
                    <label for="policy-phone">Phone</label>
                    <input type="tel" id="policy-phone" required>
                </div>
                <div class="form-group">
                    <label for="policy-company">Company Name (Optional)</label>
                    <input type="text" id="policy-company">
                </div>
                <div class="form-group">
                    <label for="policy-external-id">External Customer ID (Optional)</label>
                    <input type="text" id="policy-external-id" placeholder="For integration with external systems">
                    <small class="mgu-api-help-text">Leave blank if not needed</small>
                </div>
                <div class="form-group">
                    <label for="policy-address1">Address Line 1</label>
                    <input type="text" id="policy-address1" required>
                </div>
                <div class="form-group">
                    <label for="policy-address2">Address Line 2 (Optional)</label>
                    <input type="text" id="policy-address2">
                </div>
                <div class="form-group">
                    <label for="policy-address3">Address Line 3 (Optional)</label>
                    <input type="text" id="policy-address3">
                </div>
                <div class="form-group">
                    <label for="policy-address4">Address Line 4 (Optional)</label>
                    <input type="text" id="policy-address4">
                </div>
                <div class="form-group">
                    <label for="policy-postcode">Postcode</label>
                    <input type="text" id="policy-postcode" required>
                </div>
                <div class="form-group">
                    <label for="policy-home-phone">Home Phone (Optional)</label>
                    <input type="tel" id="policy-home-phone">
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="policy-marketing"> I agree to receive marketing communications
                    </label>
                </div>
                
                <h4>Payment Details</h4>
                <div class="form-group">
                    <label for="policy-account-name">Account Holder Name</label>
                    <input type="text" id="policy-account-name" required>
                </div>
                <div class="form-group">
                    <label for="policy-account-number">Account Number</label>
                    <input type="text" id="policy-account-number" required pattern="[0-9]{8,12}" maxlength="12">
                </div>
                <div class="form-group">
                    <label for="policy-sort-code">Sort Code</label>
                    <input type="text" id="policy-sort-code" required pattern="[0-9]{6}" maxlength="6" placeholder="123456">
                </div>
                
                <button type="submit" class="mgu-api-button">Create Policy & Setup Payment</button>
            </form>
            <div class="mgu-api-step-result"></div>
        </div>
    </div>
</div>
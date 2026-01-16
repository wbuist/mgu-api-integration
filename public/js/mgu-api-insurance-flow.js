jQuery(document).ready(function($) {

    // Global variables to store state
    window.currentGadgetType = '';
    window.currentQuoteId = null;
    window.selectedQuoteOption = null;
    window.quoteOptions = [];
    let selectedModelData = null;
    let currentBasketId = null;
    let basketGadgets = [];
    let policyLossCoverEnabled = false;
    window.selectedPremiumPeriod = '';
    let lastBasketData = null;
    let currentCustomerId = null;
    let loadedModels = []; // Store models when loaded to avoid re-fetching
    let quoteDataByPolicyId = {}; // Map to store quote data by policy ID: { policyId: { monthlyPremium, annualPremium, lossMonthly, lossAnnual } }

    // Loading state helper functions
    function showLoading(stepId) {
        $('#' + stepId).addClass('loading');
        $('#' + stepId + ' select, #' + stepId + ' input, #' + stepId + ' button').prop('disabled', true);
    }

    function hideLoading(stepId) {
        $('#' + stepId).removeClass('loading');
        $('#' + stepId + ' select, #' + stepId + ' input, #' + stepId + ' button').prop('disabled', false);
    }

    function showButtonLoading(buttonId) {
        $('#' + buttonId).addClass('loading').prop('disabled', true);
    }

    function hideButtonLoading(buttonId) {
        $('#' + buttonId).removeClass('loading').prop('disabled', false);
    }

    function setActiveStep(stepId) {
        $('.mgu-api-step').removeClass('is-active');
        $('#' + stepId).addClass('is-active');
    }

    // Icon grid -> hidden select sync (progressive enhancement)
    $(document).on('click', '.mgu-gadget-option', function(e) {
        e.preventDefault();
        const value = $(this).data('value');
        if (!value) return;

        // Store the current gadget type globally
        window.currentGadgetType = value;

        // Update aria state and selected class
        $('.mgu-gadget-option').attr('aria-checked', 'false').removeClass('selected');
        $(this).attr('aria-checked', 'true').addClass('selected').focus();

        // Sync to hidden select and fire change for existing listeners
        const $select = $('#gadget-type-select');
        if ($select.length) {
            $select.val(value).trigger('change');
        }
        setActiveStep('step-manufacturer');
    });

    // Keyboard support for icon grid (Enter/Space)
    $(document).on('keydown', '.mgu-gadget-option', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            $(this).trigger('click');
        }
    });

    // Global handler: policy period toggle (Monthly/Annual)
    $(document).on('click', '#policy-period-toggle .mgu-gadget-option', function() {
        const period = $(this).data('period');
        if (!period) return;
        window.selectedPolicyPeriod = period;
        $('#policy-period-toggle .mgu-gadget-option').attr('aria-checked', 'false').removeClass('selected');
        $(this).attr('aria-checked', 'true').addClass('selected');
        $('#policy-period-help').hide();
        if (lastBasketData) {
            displayBasketPremiums(lastBasketData);
        }
    });

    // Handle gadget type selection (existing flow)
    $('#gadget-type-select').on('change', function() {
        const gadgetType = $(this).val();
        if (!gadgetType) return;

        // Store the current gadget type globally
        window.currentGadgetType = gadgetType;
        // Show manufacturer step
        $('#step-manufacturer').show();
        setActiveStep('step-manufacturer');
        
        const requestData = {
            action: 'mgu_api_get_manufacturers',
            gadget_type: gadgetType,
            nonce: mgu_api.nonce
        };
        
        // Clear any existing error messages
        $('#step-manufacturer .mgu-api-step-result').removeClass('error success').empty();
        
        // Show loading state
        showLoading('step-manufacturer');
        
        // Load manufacturers
        $.ajax({
            url: mgu_api.ajax_url,
            type: 'POST',
            data: requestData,
            success: function(response) {
                hideLoading('step-manufacturer');
                
                if (response.success && response.data && response.data.value) {
                    const manufacturers = response.data.value || [];
                    
                    if (manufacturers.length > 0) {
                        // Clear and populate dropdown
                        const select = $('#manufacturer-select');
                        select.empty().append('<option value="">Select a manufacturer...</option>');
                        
                        // Sort manufacturers alphabetically by name
                        manufacturers.sort(function(a, b) {
                            return a.name.localeCompare(b.name);
                        });
                        
                        manufacturers.forEach(function(manufacturer) {
                            select.append(`<option value="${manufacturer.id}">${manufacturer.name}</option>`);
                        });
                        
                        // Clear error message on success
                        $('#step-manufacturer .mgu-api-step-result').removeClass('error success').empty();
                    } else {
                        // No manufacturers returned - clear dropdown but don't show error (this is a valid empty result)
                        const select = $('#manufacturer-select');
                        select.empty().append('<option value="">Select a manufacturer...</option>');
                        
                        // Clear any existing messages - empty results are not errors
                        $('#step-manufacturer .mgu-api-step-result').removeClass('error success').empty();
                    }
                } else {
                    // Response failed - show error but allow retry
                    $('#step-manufacturer .mgu-api-step-result').removeClass('success').addClass('error')
                        .html('Failed to load manufacturers. <a href="#" class="retry-manufacturers">Click to retry</a>');
                    
                    // Add retry handler
                    $('.retry-manufacturers').on('click', function(e) {
                        e.preventDefault();
                        $('#step-manufacturer .mgu-api-step-result').removeClass('error success').empty();
                        $('#gadget-type-select').trigger('change'); // Retrigger the manufacturers load
                    });
                }
            },
            error: function(xhr, status, error) {
                hideLoading('step-manufacturer');
                console.error('Manufacturers error:', {xhr, status, error});
                $('#step-manufacturer .mgu-api-step-result').removeClass('success').addClass('error')
                    .html('Failed to load manufacturers. <a href="#" class="retry-manufacturers">Click to retry</a>');
                
                // Add retry handler
                $('.retry-manufacturers').on('click', function(e) {
                    e.preventDefault();
                    $('#step-manufacturer .mgu-api-step-result').removeClass('error success').empty();
                    $('#gadget-type-select').trigger('change'); // Retrigger the manufacturers load
                });
            }
        });
    });

    // Handle manufacturer selection
    $('#manufacturer-select').on('change', function() {
        const manufacturerId = $(this).val();
        const gadgetType = $('#gadget-type-select').val();
        if (!manufacturerId || !gadgetType) return;

        // Show model step
        $('#step-model').show();
        setActiveStep('step-model');
        
        // Clear any existing error messages
        $('#step-model .mgu-api-step-result').removeClass('error success').empty();
        
        // Show loading state
        showLoading('step-model');
        
        // Load models
        $.ajax({
            url: mgu_api.ajax_url,
            type: 'POST',
            data: {
                action: 'mgu_api_get_models',
                manufacturer_id: manufacturerId,
                gadget_type: gadgetType,
                nonce: mgu_api.nonce
            },
            success: function(response) {
                hideLoading('step-model');
                
                const select = $('#model-select');
                select.empty().append('<option value="">Select a model...</option>');
                
                // Check different possible response structures
                let models = null;
                if (response.success && response.data) {
                    // Try response.data.value first (current structure)
                    if (response.data.value && Array.isArray(response.data.value)) {
                        models = response.data.value;
                    }
                    // Try response.data directly (alternative structure)
                    else if (Array.isArray(response.data)) {
                        models = response.data;
                    }
                }
                
                if (models && models.length > 0) {
                    // Store models globally for later use (before reversing)
                    loadedModels = models.slice(); // Create a copy
                    
                    // Reverse the array order since API returns in correct order but we want last first
                    models.reverse();
                    
                    models.forEach(function(model) {
                        // Handle V2 API response structure
                        const modelId = model.id;
                        const modelName = model.productName || model.name || model.model || 'Unknown Model';
                        select.append(`<option value="${modelId}">${modelName}</option>`);
                    });
                    
                    // Clear error message on success
                    $('#step-model .mgu-api-step-result').removeClass('error success').empty();
                } else {
                    // No models returned - clear dropdown but don't show error (this is a valid empty result)
                    loadedModels = []; // Clear stored models
                    // Clear any existing messages - empty results are not errors
                    $('#step-model .mgu-api-step-result').removeClass('error success').empty();
                }
                
                if (!response.success || !models) {
                    // Only show error if we didn't get models
                    loadedModels = []; // Clear stored models on error
                    $('#step-model .mgu-api-step-result').removeClass('success').addClass('error')
                        .text('Failed to load models: ' + (response.data || 'Unknown error'));
                }
            },
            error: function(xhr, status, error) {
                hideLoading('step-model');
                console.error('Models error:', {xhr, status, error});
                $('#step-model .mgu-api-step-result').removeClass('success').addClass('error')
                    .text('Failed to load models');
            }
        });
    });

    // Handle model selection
    $('#model-select').on('change', function() {
        const modelId = $(this).val();
        const selectedOption = $(this).find('option:selected');
        
        if (modelId) {
            // Store the model data
            selectedModelData = {
                id: modelId,
                name: selectedOption.text()
            };
            
            // Show Step 4
            $('#step-device').show();
            setActiveStep('step-device');
            
            // Reset form and disable quote button FIRST
            resetDeviceForm();
            
            // THEN populate memory options if available (after reset so they don't get hidden)
            setTimeout(function() {
                populateMemoryOptions();
            }, 50);
            
            // Trigger initial validation
            setTimeout(function() {
                validateQuoteButton();
            }, 100);
        } else {
            selectedModelData = null;
            $('#step-device').hide();
        }
    });

    // Handle device form submission
    $('#device-form').on('submit', function(e) {
        e.preventDefault();
        
        if ($('#get-quote-btn').prop('disabled')) {
            return; // Don't submit if button is disabled
        }
        
        const deviceData = {
            productId: selectedModelData ? selectedModelData.id : null,
            memoryInstalled: getMemoryForAPI(), // Returns 0GB if no memory options available
            purchasePrice: parseFloat($('#device-purchase-price').val()) || 0,
            purchaseDate: $('#device-purchase-date').val(),
            serialNumber: $('#device-serial-number').val(),
            premiumPeriod: $('input[name="premium-period"]:checked').val()
        };

        // Add gadget to basket and show quote summary
        if (currentBasketId) {
            // We already have a basket, just add the gadget to it
            addGadgetToBasket(deviceData);
        } else {
            // First gadget, create customer and basket
            handleAddFirstGadget(deviceData);
        }
    });

    // Function to get quote
    function getQuote(deviceData) {
        // Clear any previous error messages
        $('.mgu-api-step-result').removeClass('error success').empty();
        
        $.ajax({
            url: mgu_api.ajax_url,
            type: 'POST',
            data: {
                action: 'mgu_api_get_quote',
                device_data: deviceData,
                nonce: mgu_api.nonce
            },
            success: function(response) {
                if (response.success && response.data) {
                    displayQuoteV2(response.data);
                    $('#step-quote').show();
                    // Clear any error messages
                    $('.mgu-api-step-result').removeClass('error success').empty();
                } else {
                    showError('step-device', 'Failed to get quote: ' + (response.data || 'Unknown error'));
                }
            },
            error: function(xhr, status, error) {
                showError('step-device', 'Failed to get quote');
            }
        });
    }

    // Function to display quote
    function displayQuoteV2(quoteData) {
        if (!quoteData) {
            return;
        }

        // Store the quote data globally for policy creation
        window.currentQuoteData = quoteData;

        const quoteHtml = `
            <div class="mgu-api-quote-details">
                <h4>Quote Details</h4>
                <p><strong>Monthly Premium:</strong> £${quoteData.monthlyPremium || 'N/A'}</p>
                <p><strong>Annual Premium:</strong> £${quoteData.annualPremium || 'N/A'}</p>
                <p><strong>Damage Excess:</strong> £${quoteData.damageExcess || 'N/A'}</p>
                <p><strong>Theft Excess:</strong> £${quoteData.theftExcess || 'N/A'}</p>
                ${quoteData.lossCoverAvailable ? '<p><strong>Loss Cover Available:</strong> Yes</p>' : ''}
            </div>
        `;
        
        $('.mgu-api-quote-details').html(quoteHtml);
        
        // Show the Buy Policy button for V2 API
        $('#buy-policy').show();
    }

    function displayQuote(quoteData) {
        if (!quoteData || !quoteData.value || !Array.isArray(quoteData.value)) {
            return;
        }

        // Store the options globally
        window.quoteOptions = quoteData.value;
        
        // Create HTML for each option
        const optionsHtml = quoteData.value.map(option => `
            <div class="mgu-api-quote-option">
                <h3>${window.selectedModel ? window.selectedModel.productName : 'Device'} Quote</h3>
                <div class="mgu-api-quote-details">
                    <p>Memory: ${option.standardMemory || 'N/A'} ${option.memorySize || 'GB'}</p>
                    <p>Monthly Premium: £${option.monthlyPremium || 'N/A'}</p>
                    <p>Annual Premium: £${option.annualPremium || 'N/A'}</p>
                    <p>Damage Excess: £${option.damageExcess || 'N/A'}</p>
                    <p>Theft Excess: £${option.theftExcess || 'N/A'}</p>
                    <p>Premium ID: ${option.premiumId || option.id || 'N/A'}</p>
                    ${option.lossCoverAvailable ? `
                        <p>Loss Cover Available:</p>
                        <p>Monthly: £${option.lossCoverMonthlyPremium || 'N/A'}</p>
                        <p>Annual: £${option.lossCoverAnnualPremium || 'N/A'}</p>
                    ` : ''}
                    <button class="mgu-api-button select-quote-option" data-option-id="${option.premiumId || option.id}">Select This Option</button>
                </div>
            </div>
        `).join('');

        const quoteHtml = `
            <div class="mgu-api-quote-options">
                ${optionsHtml}
            </div>
        `;
        
        $('.mgu-api-quote-details').html(quoteHtml);
    }

    // Handle quote option selection
    $(document).on('click', '.select-quote-option', function(e) {
        e.preventDefault();
        const optionId = $(this).data('option-id');
        const option = window.quoteOptions.find(opt => (opt.premiumId || opt.id) === optionId);
        
        if (option) {
            // Store the selected option
            window.selectedQuoteOption = option;
            window.currentQuoteId = option.premiumId || option.id;
            
            // Update UI
            $('.mgu-api-quote-option').removeClass('selected');
            $(this).closest('.mgu-api-quote-option').addClass('selected');
            // V2 API - button is always available after quote is displayed
        }
    });

    // Handle buy policy
    $('#buy-policy').on('click', function(e) {
        e.preventDefault();
        // For V2 API, we have a single quote, no need to select from options
        $('#step-policy').show();
        setActiveStep('step-policy');
    });

    // Handle policy form submission
    $('#policy-form').on('submit', function(e) {
        e.preventDefault();

        if (!currentBasketId) {
            showError('step-policy', 'No basket available. Please start over.');
            return;
        }

        // Gather customer data - matching TGadgetCustomer structure from Swagger
        const customerData = {
            title: "Mr", // Default to Mr, could be made configurable
            givenName: $('#policy-first-name').val(),
            lastName: $('#policy-last-name').val(),
            email: $('#policy-email').val(),
            mobileNumber: $('#policy-phone').val(),
            marketingOk: Boolean($('#policy-marketing').is(':checked')),
            // Required address fields
            address1: $('#policy-address1').val(),
            postCode: $('#policy-postcode').val(),
            // Optional fields
            companyName: $('#policy-company').val() || "",
            address2: $('#policy-address2').val() || "",
            address3: $('#policy-address3').val() || "",
            address4: $('#policy-address4').val() || "",
            homePhone: $('#policy-home-phone').val() || "",
            // External ID for integration with external systems
            externalId: $('#policy-external-id').val() || null
        };

        // Validate required fields
        if (!customerData.givenName || !customerData.lastName || !customerData.email || !customerData.mobileNumber) {
            alert('Please fill in all required fields (First Name, Last Name, Email, Phone)');
            return;
        }
        
        if (!customerData.address1 || !customerData.postCode) {
            alert('Please fill in Address Line 1 and Postcode');
            return;
        }

        // Show loading state on policy step
        showLoading('step-policy');
        
        // First update customer data, then confirm basket
        // Ensure we have a customer ID - try currentCustomerId, fall back to lastBasketData
        let customerIdToUpdate = currentCustomerId;
        if (!customerIdToUpdate && lastBasketData && lastBasketData.customerId) {
            customerIdToUpdate = lastBasketData.customerId;
            currentCustomerId = customerIdToUpdate;
        }
        
        if (!customerIdToUpdate) {
            showError('step-policy', 'Unable to update customer information. Please try again.');
            return;
        }
        
        // Add customer ID to customer data - ensure it's an integer
        customerData.id = parseInt(customerIdToUpdate, 10);
        
        $.ajax({
            url: mgu_api.ajax_url,
            type: 'POST',
            data: {
                action: 'mgu_api_update_customer',
                customer_data: customerData,
                nonce: mgu_api.nonce
            },
            success: function(updateResponse) {
                if (updateResponse.success) {
                    // Now confirm the basket
                    $.ajax({
                        url: mgu_api.ajax_url,
                        type: 'POST',
                        data: {
                            action: 'mgu_api_confirm_basket',
                            basket_id: currentBasketId,
                            customer_id: null, // Use existing customer from basket
                            nonce: mgu_api.nonce
                        },
                        success: function(confirmResponse) {
                            if (confirmResponse.success) {
                                // Check if payment is required
                                const outcome = confirmResponse.data.Outcome;
                                
                                if (outcome === 'PaymentRequired') {
                                    // Payment required - process direct debit
                                    $.ajax({
                                        url: mgu_api.ajax_url,
                                        type: 'POST',
                                        data: {
                                            action: 'mgu_api_pay_by_direct_debit',
                                            basket_id: currentBasketId,
                                            direct_debit: {
                                                NameOnAccount: $('#policy-account-name').val(),
                                                AccountNumber: $('#policy-account-number').val(),
                                                SortCode: $('#policy-sort-code').val()
                                            },
                                            nonce: mgu_api.nonce
                                        },
                                        success: function(paymentResponse) {
                                            if (paymentResponse.success) {
                                                showSuccess('step-policy', 'Policy created and payment processed successfully!');
                                            } else {
                                                showError('step-policy', 'Failed to process payment: ' + (paymentResponse.data.message || 'Unknown error'));
                                            }
                                        },
                                        error: function(xhr, status, error) {
                                            showError('step-policy', 'Error processing payment: ' + error);
                                        }
                                    });
                                } else if (outcome === 'Confirmed') {
                                    // No payment required - basket is already confirmed
                                    showSuccess('step-policy', 'Policy created successfully!');
                                } else {
                                    showError('step-policy', 'Unexpected basket status: ' + outcome);
                                }
                            } else {
                                showError('step-policy', 'Failed to confirm basket: ' + (confirmResponse.data.message || 'Unknown error'));
                            }
                        },
                        error: function(xhr, status, error) {
                            showError('step-policy', 'Error confirming basket: ' + error);
                        }
                    });
                } else {
                    showError('step-policy', 'Failed to update customer: ' + (updateResponse.data.message || 'Unknown error'));
                }
            },
            error: function(xhr, status, error) {
                showError('step-policy', 'Error updating customer: ' + error);
            }
        });
    });

    function showError(stepId, message) {
        hideLoading(stepId);
        $(`#${stepId} .mgu-api-step-result`)
            .removeClass('success')
            .addClass('error')
            .html(`<div class="error-message">${message}</div>`);
    }

    function showSuccess(stepId, message) {
        hideLoading(stepId);
        $(`#${stepId} .mgu-api-step-result`)
            .removeClass('error')
            .addClass('success')
            .html(`<div class="success-message">${message}</div>`);
    }
    
    // Helper function to format memory value with GB or TB suffix
    function formatMemoryValue(memoryValue) {
        if (!memoryValue) return '0GB';
        const memoryStr = String(memoryValue).trim();
        
        // If it already has GB or TB suffix, return as is
        if (/GB|TB/i.test(memoryStr)) {
            return memoryStr;
        }
        
        // Extract the numeric value
        const numericValue = parseFloat(memoryStr.replace(/[^0-9.]/g, ''));
        if (isNaN(numericValue)) {
            return '0GB';
        }
        
        // If number is >= 1000, convert to TB (e.g., 1024 -> 1TB, 2048 -> 2TB)
        if (numericValue >= 1000) {
            const tbValue = (numericValue / 1024).toFixed(1);
            // Remove .0 if it's a whole number
            return (tbValue % 1 === 0 ? parseInt(tbValue) : parseFloat(tbValue)) + 'TB';
        }
        
        // Otherwise use GB
        return numericValue + 'GB';
    }
    
    // Helper function to get memory value for API calls (returns 0GB if no selection)
    function getMemoryForAPI() {
        const selectedMemory = $('input[name="memory-option"]:checked').val();
        if (selectedMemory) {
            return formatMemoryValue(selectedMemory);
        }
        // No memory options available or none selected - use 0GB
        return '0GB';
    }
    
    // Function to populate memory options based on selected model
    function populateMemoryOptions() {
        if (!selectedModelData) {
            return;
        }
        
            // First try to use stored models (no API call needed)
            let selectedModel = null;
            if (loadedModels && loadedModels.length > 0) {
                // Find the selected model - try both string and number comparison
                selectedModel = loadedModels.find(model => {
                    const modelId = parseInt(model.id, 10);
                    const selectedId = parseInt(selectedModelData.id, 10);
                    return modelId === selectedId || model.id == selectedModelData.id;
                });
            }
            
            // If not found in stored data, fetch from API
            if (!selectedModel) {
            
            $.ajax({
                url: mgu_api.ajax_url,
                type: 'POST',
                data: {
                    action: 'mgu_api_get_models',
                    manufacturer_id: $('#manufacturer-select').val(),
                    gadget_type: $('#gadget-type-select').val(),
                    nonce: mgu_api.nonce
                },
                success: function(response) {
                    // Check different possible response structures
                    let models = null;
                    if (response.success && response.data) {
                        // Try response.data.value first (current structure)
                        if (response.data.value && Array.isArray(response.data.value)) {
                            models = response.data.value;
                        }
                        // Try response.data directly (alternative structure)
                        else if (Array.isArray(response.data)) {
                            models = response.data;
                        }
                    }
                    
                    if (!models || models.length === 0) {
                        $('#memory-options-container').hide();
                        return;
                    }
                    
                    // Update stored models
                    loadedModels = models;
                    
                    // Find the selected model
                    selectedModel = models.find(model => {
                        const modelId = parseInt(model.id, 10);
                        const selectedId = parseInt(selectedModelData.id, 10);
                        return modelId === selectedId || model.id == selectedModelData.id;
                    });
                    
                    if (selectedModel) {
                        processMemoryOptions(selectedModel);
                    } else {
                        $('#memory-options-container').hide();
                    }
                },
                error: function(xhr, status, error) {
                    $('#memory-options-container').hide();
                }
            });
        } else {
            // Use stored model data
            processMemoryOptions(selectedModel);
        }
        
        // Helper function to process memory options
        function processMemoryOptions(model) {
            // Check if container exists
            const $memoryContainer = $('#memory-options-container');
            if ($memoryContainer.length === 0) {
                return;
            }
            
            if (model.memoryOptions && Array.isArray(model.memoryOptions) && model.memoryOptions.length > 0) {
                
                // Clear existing options FIRST
                $('#memory-radio-buttons').empty();
                
                // Show memory options container - use multiple methods to ensure it's visible
                $memoryContainer.css({
                    'display': 'block',
                    'visibility': 'visible'
                }).show();
                
                // Verify it's actually visible
                const isVisible = $memoryContainer.is(':visible');
                if (!isVisible) {
                    // Force it visible
                    $memoryContainer.removeAttr('style').css('display', 'block');
                }
                
                // Add radio buttons for each memory option
                model.memoryOptions.forEach(function(memoryOption) {
                    // Convert memoryOption to string (it might be a number or object)
                    const memoryOptionStr = String(memoryOption);
                    
                    // Format the display value with GB/TB suffix
                    const formattedValue = formatMemoryValue(memoryOptionStr);
                    
                    // Store the original value in the radio button value, but display formatted
                    const radioId = 'memory-' + memoryOptionStr.replace(/[^a-zA-Z0-9]/g, '');
                    const radioHtml = `
                        <div class="mgu-api-radio-option mgu-option-box">
                            <input type="radio" id="${radioId}" name="memory-option" value="${formattedValue}">
                            <label for="${radioId}">
                                <span class="mgu-option-amount">${formattedValue}</span>
                            </label>
                        </div>
                    `;
                    $('#memory-radio-buttons').append(radioHtml);
                });
                
                // Add click handler for radio options (use off() first to prevent duplicates)
                $('.mgu-api-radio-option').off('click').on('click', function() {
                    $(this).addClass('selected').siblings().removeClass('selected');
                    $(this).find('input[type="radio"]').prop('checked', true);
                    
                    // Get quote data to populate premium period options
                    populatePremiumPeriodOptions(model.id, $(this).find('input[type="radio"]').val());
                    
                    validateQuoteButton();
                });

                // If only one memory option, auto-select it
                if (model.memoryOptions.length === 1) {
                    const onlyVal = formatMemoryValue(String(model.memoryOptions[0]));
                    const onlyId = 'memory-' + String(model.memoryOptions[0]).replace(/[^a-zA-Z0-9]/g, '');
                    const $only = $('#' + onlyId).closest('.mgu-api-radio-option');
                    $only.addClass('selected');
                    $('#' + onlyId).prop('checked', true);
                    populatePremiumPeriodOptions(model.id, onlyVal);
                    validateQuoteButton();
                }
            } else {
                // Hide memory options if none available
                $('#memory-options-container').hide();
            }
        }
    }
    
    // Function to populate premium period options with quote data
    function populatePremiumPeriodOptions(productId, memoryInstalled) {
        if (!productId || !memoryInstalled) {
            return;
        }
        // Get current form data
        const purchasePrice = parseFloat($('#device-purchase-price').val()) || 0;
        
        // Show loading state
        showLoading('step-device');
        
        $.ajax({
            url: mgu_api.ajax_url,
            type: 'POST',
            data: {
                action: 'mgu_api_get_quote',
                device_data: {
                    productId: productId,
                    memoryInstalled: memoryInstalled ? formatMemoryValue(memoryInstalled) : '0GB',
                    purchasePrice: purchasePrice,
                    purchaseDate: $('#device-purchase-date').val(),
                    serialNumber: $('#device-serial-number').val()
                },
                nonce: mgu_api.nonce
            },
            success: function(response) {
                hideLoading('step-device');
                if (response.success && response.data) {
                    const quoteData = response.data;
                    
                    // Store quote data globally for policy creation
                    window.currentQuoteData = quoteData;
                    // Persist period-specific loss cover premiums for later display
                    window.currentQuoteData.lossMonthly = Number(quoteData.lossCoverMonthlyPremium || 0);
                    window.currentQuoteData.lossAnnual = Number(quoteData.lossCoverAnnualPremium || 0);
                    
                    // Store quote monthly/annual for later use in summary
                    window.currentQuoteData = window.currentQuoteData || {};
                    window.currentQuoteData.monthlyPremium = quoteData.monthlyPremium || 0;
                    window.currentQuoteData.annualPremium = quoteData.annualPremium || 0;
                }
            },
            error: function(xhr, status, error) {
                hideLoading('step-device');
            }
        });
    }
    
    // Function to handle adding the first gadget to basket
    function handleAddFirstGadget(deviceData) {
        // Show loading state
        showLoading('step-device');
        
        // First, create customer if not exists
        const customerData = {
            title: "Mr",
            givenName: "Test", // We'll use test data for now
            lastName: "Customer",
            email: "test@example.com",
            mobileNumber: "07123456789",
            marketingOk: false,
            address1: "123 Test Street",
            postCode: "SW1A 1AA",
            companyName: "",
            address2: "",
            address3: "",
            address4: "",
            homePhone: "",
            externalId: null
        };
        
        $.ajax({
            url: mgu_api.ajax_url,
            type: 'POST',
            data: {
                action: 'mgu_api_create_customer',
                customer_data: customerData,
                nonce: mgu_api.nonce
            },
            success: function(response) {
                if (response.success && response.data && response.data.value) {
                    const customerId = response.data.value;
                    currentCustomerId = customerId;
                    
                    // Open basket
                    openBasketAndAddGadget(customerId, deviceData);
                } else {
                    hideLoading('step-device');
                    showError('step-device', 'Failed to create customer: ' + (response.data || 'Unknown error'));
                }
            },
            error: function(xhr, status, error) {
                hideLoading('step-device');
                showError('step-device', 'Error creating customer: ' + error);
            }
        });
    }
    
    // Function to open basket and add gadget
    function openBasketAndAddGadget(customerId, deviceData) {
        $.ajax({
            url: mgu_api.ajax_url,
            type: 'POST',
            data: {
                action: 'mgu_api_open_basket',
                customer_id: customerId,
                premium_period: deviceData.premiumPeriod || 'Annual',
                include_loss_cover: 'No', // Will be set at policy level
                nonce: mgu_api.nonce
            },
            success: function(basketResponse) {
                if (basketResponse.success && basketResponse.data && basketResponse.data.value) {
                    currentBasketId = basketResponse.data.value;
                    
                    // Add gadget to basket
                    addGadgetToBasket(deviceData);
                } else {
                    hideLoading('step-device');
                    showError('step-device', 'Failed to open basket: ' + (basketResponse.data || 'Unknown error'));
                }
            },
            error: function(xhr, status, error) {
                hideLoading('step-device');
                showError('step-device', 'Error opening basket: ' + error);
            }
        });
    }
    
    // Function to add gadget to basket
    function addGadgetToBasket(deviceData) {
        $.ajax({
            url: mgu_api.ajax_url,
            type: 'POST',
            data: {
                action: 'mgu_api_add_gadget',
                basket_id: currentBasketId,
                gadget_data: {
                    productId: deviceData.productId,
                    dateOfPurchase: deviceData.purchaseDate,
                    serialNumber: deviceData.serialNumber,
                    installedMemory: deviceData.memoryInstalled,
                    purchasePrice: deviceData.purchasePrice
                },
                nonce: mgu_api.nonce
            },
            success: function(response) {
                hideLoading('step-device');
                if (response.success) {
                    // Store gadget data for display
                    basketGadgets.push({
                        productId: deviceData.productId,
                        memoryInstalled: deviceData.memoryInstalled,
                        purchasePrice: deviceData.purchasePrice,
                        purchaseDate: deviceData.purchaseDate,
                        serialNumber: deviceData.serialNumber,
                        premiumPeriod: deviceData.premiumPeriod,
                        modelName: selectedModelData ? selectedModelData.name : 'Unknown Model',
                        gadgetType: window.currentGadgetType || '' // Store gadget type to check if it's a laptop
                    });
                    
                    // Show quote summary and refresh basket data
                    $('#step-quote').show();
                    // Hide Step 6 (Policy Creation) when showing Step 5
                    $('#step-policy').hide();
                    // Display quote summary (gadget list and toggles)
                    displayQuoteSummary();
                    // Get updated basket data and fetch fresh quote for this gadget
                    // Pass deviceData so we can fetch a fresh quote with the correct purchase price
                    getBasketDataWithQuoteStorage(deviceData);
                } else {
                    showError('step-device', 'Failed to add gadget: ' + (response.data || 'Unknown error'));
                }
            },
            error: function(xhr, status, error) {
                hideLoading('step-device');
                showError('step-device', 'Error adding gadget: ' + error);
            }
        });
    }
    
    // Function to display quote summary
    function displayQuoteSummary() {
        // Clear gadget list - it will be populated by displayBasketPremiums
        $('#gadget-list').html('<h4>Gadgets in your policy:</h4>');
        
        // Always enable loss cover checkbox - consumers can toggle freely
        $('#policy-loss-cover').prop('disabled', false);
        $('#policy-loss-cover-info').html(`
            <div class="mgu-help-text-small">
                Loss cover is not available for Laptops.
            </div>
        `);
        
        // Get basket data to display proper premiums
        getBasketData();
        // Period toggle handlers
        $(document).off('click', '#policy-period-toggle .mgu-gadget-option');
        $(document).on('click', '#policy-period-toggle .mgu-gadget-option', function() {
            const period = $(this).data('period');
            if (!period) return;
            window.selectedPremiumPeriod = period;
            $('#policy-period-toggle .mgu-gadget-option').attr('aria-checked', 'false').removeClass('selected');
            $(this).attr('aria-checked', 'true').addClass('selected');
            $('#policy-period-help').hide();
            if (lastBasketData) {
                displayBasketPremiums(lastBasketData);
            }
        });
    }
    
    // Function to refresh quotes for all gadgets in the basket
    function refreshQuotesForAllGadgets() {
        if (!currentBasketId) {
            getBasketData();
            return;
        }
        
        // First get the basket data to see all policies
        $.ajax({
            url: mgu_api.ajax_url,
            type: 'POST',
            data: {
                action: 'mgu_api_get_basket',
                basket_id: currentBasketId,
                nonce: mgu_api.nonce
            },
            success: function(response) {
                if (response.success && response.data && response.data.policies) {
                    const policies = response.data.policies;
                    
                    // Fetch fresh quotes for each policy
                    let quotesFetched = 0;
                    const totalPolicies = policies.length;
                    
                    policies.forEach((policy, index) => {
                        // Find matching gadget data from basketGadgets
                        const gadgetData = basketGadgets[index];
                        if (gadgetData) {
                            $.ajax({
                                url: mgu_api.ajax_url,
                                type: 'POST',
                                data: {
                                    action: 'mgu_api_get_quote',
                                    device_data: {
                                        productId: gadgetData.productId,
                                        memoryInstalled: gadgetData.memoryInstalled,
                                        purchasePrice: gadgetData.purchasePrice,
                                        purchaseDate: gadgetData.purchaseDate,
                                        serialNumber: gadgetData.serialNumber
                                    },
                                    nonce: mgu_api.nonce
                                },
                                success: function(quoteResponse) {
                                    if (quoteResponse.success && quoteResponse.data) {
                                        const freshQuoteData = quoteResponse.data;
                                        quoteDataByPolicyId[policy.id] = {
                                            monthlyPremium: Number(freshQuoteData.monthlyPremium || 0),
                                            annualPremium: Number(freshQuoteData.annualPremium || 0),
                                            lossMonthly: Number(freshQuoteData.lossCoverMonthlyPremium || 0),
                                            lossAnnual: Number(freshQuoteData.lossCoverAnnualPremium || 0)
                                        };
                                    }
                                    
                                    quotesFetched++;
                                    if (quotesFetched === totalPolicies) {
                                        // All quotes fetched, refresh display
                                        displayBasketPremiums(response.data);
                                    }
                                },
                                error: function(xhr, status, error) {
                                    quotesFetched++;
                                    if (quotesFetched === totalPolicies) {
                                        displayBasketPremiums(response.data);
                                    }
                                }
                            });
                        } else {
                            quotesFetched++;
                            if (quotesFetched === totalPolicies) {
                                displayBasketPremiums(response.data);
                            }
                        }
                    });
                } else {
                    getBasketData();
                }
            },
            error: function(xhr, status, error) {
                getBasketData();
            }
        });
    }
    
    // Function to get basket data and display premiums
    function getBasketData() {
        if (!currentBasketId) {
            return;
        }
        
        $.ajax({
            url: mgu_api.ajax_url,
            type: 'POST',
            data: {
                action: 'mgu_api_get_basket',
                basket_id: currentBasketId,
                nonce: mgu_api.nonce
            },
            success: function(response) {
                if (response.success && response.data) {
                    lastBasketData = response.data;
                    displayBasketPremiums(response.data);
                } else {
                    displayBasketPremiums(null);
                }
            },
            error: function(xhr, status, error) {
                displayBasketPremiums(null);
            }
        });
    }
    
    // Function to get basket data and store quote data by policy ID
    function getBasketDataWithQuoteStorage(deviceData) {
        if (!currentBasketId) {
            return;
        }
        
        $.ajax({
            url: mgu_api.ajax_url,
            type: 'POST',
            data: {
                action: 'mgu_api_get_basket',
                basket_id: currentBasketId,
                nonce: mgu_api.nonce
            },
            success: function(response) {
                if (response.success && response.data) {
                    lastBasketData = response.data;
                    
                    // Find the newly added policy (last in array)
                    if (response.data.policies && Array.isArray(response.data.policies)) {
                        const newPolicies = response.data.policies;
                        const lastPolicy = newPolicies[newPolicies.length - 1];
                        
                        if (lastPolicy && lastPolicy.id && deviceData) {
                            // Fetch a FRESH quote for this specific gadget
                            $.ajax({
                                url: mgu_api.ajax_url,
                                type: 'POST',
                                data: {
                                    action: 'mgu_api_get_quote',
                                    device_data: {
                                        productId: deviceData.productId,
                                        memoryInstalled: deviceData.memoryInstalled,
                                        purchasePrice: deviceData.purchasePrice,
                                        purchaseDate: deviceData.purchaseDate,
                                        serialNumber: deviceData.serialNumber
                                    },
                                    nonce: mgu_api.nonce
                                },
                                success: function(quoteResponse) {
                                    if (quoteResponse.success && quoteResponse.data) {
                                        const freshQuoteData = quoteResponse.data;
                                        
                                        // Store the FRESH quote data keyed by policy ID
                                        quoteDataByPolicyId[lastPolicy.id] = {
                                            monthlyPremium: Number(freshQuoteData.monthlyPremium || 0),
                                            annualPremium: Number(freshQuoteData.annualPremium || 0),
                                            lossMonthly: Number(freshQuoteData.lossCoverMonthlyPremium || 0),
                                            lossAnnual: Number(freshQuoteData.lossCoverAnnualPremium || 0)
                                        };
                                        
                                        // Refresh the display with the fresh quote data
                                        displayBasketPremiums(response.data);
                                    } else {
                                        // Fallback: use API premium data from basket
                                        displayBasketPremiums(response.data);
                                    }
                                },
                                error: function(xhr, status, error) {
                                    // Fallback: use API premium data from basket
                                    displayBasketPremiums(response.data);
                                }
                            });
                        } else {
                            // No new policy found or no device data - just display
                            displayBasketPremiums(response.data);
                        }
                    } else {
                        displayBasketPremiums(response.data);
                    }
                } else {
                    displayBasketPremiums(null);
                }
            },
            error: function(xhr, status, error) {
                displayBasketPremiums(null);
            }
        });
    }
    
    // Function to display basket premiums
    function displayBasketPremiums(basketData) {
        let basePremium = 0;
        let lossCoverPremium = 0;
        let totalPremium = 0;
        let discountTotal = 0;
        let numberOfPolicies = 0;
        let individualGadgets = [];
        
        if (!window.selectedPremiumPeriod) {
            // Before period chosen, clear totals area and show helper
            $('#total-premium-display').html('<div class="mgu-api-help-text">Premiums will be shown when you choose payment period.</div>');
            return;
        }

        if (basketData) {
            // Get basket-level information
            const grossPremium = basketData.grossPremium || 0;
            discountTotal = basketData.DiscountTotal || 0; // This is a percentage (0.1 = 10%)
            numberOfPolicies = basketData.NumberOfPolicies || 0;
            
            // Get individual gadget information
            if (basketData.policies && Array.isArray(basketData.policies)) {
                individualGadgets = basketData.policies.map(policy => ({
                    id: policy.id,
                    gadgetType: policy.gadgetType,
                    make: policy.make,
                    model: policy.model,
                    premium: policy.premium || 0,
                    grossPremium: policy.grossPremium || 0,
                    netPremium: policy.netPremium || 0,
                    discountPercent: policy.discountPercent || 0,
                    lossCover: policy.lossCover || false,
                    lossPremium: policy.lossPremium || 0,
                    // Potential API fields for loss cover (log and use heuristics later)
                    lossMonthlyPremium: policy.lossMonthlyPremium != null ? policy.lossMonthlyPremium : undefined,
                    lossPremiumMonthly: policy.lossPremiumMonthly != null ? policy.lossPremiumMonthly : undefined,
                    lossAnnualPremium: policy.lossAnnualPremium != null ? policy.lossAnnualPremium : undefined,
                    lossPremiumAnnual: policy.lossPremiumAnnual != null ? policy.lossPremiumAnnual : undefined
                }));

            }
            
            // Calculate base premiums using stored quote data by policy ID
            let baseMonthlySum = 0;
            let baseAnnualSum = 0;
            individualGadgets.forEach(gadget => {
                const policyId = gadget.id;
                const storedQuoteData = quoteDataByPolicyId[policyId];
                if (storedQuoteData) {
                    baseMonthlySum += Number(storedQuoteData.monthlyPremium || 0);
                    baseAnnualSum += Number(storedQuoteData.annualPremium || 0);
                } else {
                    // Fallback to API premium data if no stored quote
                    const apiPremium = gadget.premium || gadget.netPremium || gadget.grossPremium || 0;
                    // If API gives us a single premium, we don't know if it's monthly or annual
                    // For now, assume it's the period that's selected
                    if (window.selectedPremiumPeriod === 'Annual') {
                        baseAnnualSum += Number(apiPremium);
                    } else {
                        baseMonthlySum += Number(apiPremium);
                    }
                }
            });
            
            // Loss cover sums from stored per-gadget quote values - EXCLUDE LAPTOPS
            const individualLossPremiumsMonthly = individualGadgets.reduce((total, gadget) => {
                // Don't include laptops in loss cover premium calculation
                if (gadget.gadgetType === 'Laptop') return total;
                const policyId = gadget.id;
                const storedQuoteData = quoteDataByPolicyId[policyId];
                return total + (storedQuoteData ? Number(storedQuoteData.lossMonthly || 0) : 0);
            }, 0);
            const individualLossPremiumsAnnual = individualGadgets.reduce((total, gadget) => {
                // Don't include laptops in loss cover premium calculation
                if (gadget.gadgetType === 'Laptop') return total;
                const policyId = gadget.id;
                const storedQuoteData = quoteDataByPolicyId[policyId];
                return total + (storedQuoteData ? Number(storedQuoteData.lossAnnual || 0) : 0);
            }, 0);
            
            // Check if loss cover is enabled
            const isLossCoverChecked = $('#policy-loss-cover').is(':checked');
            
            if (window.selectedPremiumPeriod === 'Annual') {
                basePremium = baseAnnualSum;
                lossCoverPremium = isLossCoverChecked ? individualLossPremiumsAnnual : 0;
            } else {
                basePremium = baseMonthlySum;
                lossCoverPremium = isLossCoverChecked ? individualLossPremiumsMonthly : 0;
            }
            totalPremium = basePremium + lossCoverPremium;
            
            // Apply discount (discountTotal is a percentage)
            if (discountTotal > 0) {
                const discountAmount = totalPremium * discountTotal;
                totalPremium = totalPremium - discountAmount;
            }
        }
        
        // Update loss cover info - checkbox is always enabled
        // Always keep the checkbox enabled - consumers can toggle as needed
        $('#policy-loss-cover').prop('disabled', false);
        
        $('#policy-loss-cover-info').html(`
            <div class="mgu-help-text-small">
                Loss cover is not available for Laptops.
            </div>
        `);
        
        // Update the premium display with detailed breakdown
        let premiumHtml = '<div class="mgu-quote-summary-container">';
        premiumHtml += '<h4 class="mgu-quote-summary-title">Your Quote Summary</h4>';
        
            // Show individual gadgets
            if (individualGadgets.length > 0) {
                premiumHtml += '<div class="mgu-gadget-items-wrapper">';
                individualGadgets.forEach((gadget, index) => {
                    // Match by policy ID instead of index to handle same product added multiple times
                    const policyId = gadget.id;
                    const storedQuoteData = quoteDataByPolicyId[policyId];
                    
                    // Determine display base premium by selected period
                    // Priority: 1) Stored quote data by policy ID, 2) API premium data, 3) Fallback to 0
                    let baseDisplay = 0;
                    if (storedQuoteData) {
                        baseDisplay = window.selectedPremiumPeriod === 'Annual'
                            ? (storedQuoteData.annualPremium || 0)
                            : (storedQuoteData.monthlyPremium || 0);
                    } else {
                        // Fallback to API premium data
                        baseDisplay = gadget.premium || gadget.netPremium || gadget.grossPremium || 0;
                    }
                    
                    // Use stored quote values for loss cover (from TGadgetPremium response)
                    const lossMonthly = storedQuoteData ? Number(storedQuoteData.lossMonthly || 0) : 0;
                    const lossAnnual = storedQuoteData ? Number(storedQuoteData.lossAnnual || 0) : 0;
                    
                    // Get gadget details from basketGadgets array (for display info like purchase price)
                    // Try to match by finding a gadget with matching productId, but prefer index as fallback
                    let gadgetDetails = basketGadgets[index];
                    // If index doesn't match well, try to find by productId (though this won't work if same product added twice)
                    // For now, we'll use index but the premium comes from policy ID matching above
                premiumHtml += `
                    <div class="mgu-gadget-item-detail">
                        <h5>Gadget ${index + 1}: ${gadget.make} ${gadget.model}</h5>
                        <p><strong>Memory:</strong> ${gadgetDetails ? (gadgetDetails.memoryInstalled || 'N/A') : 'N/A'}</p>
                        <p><strong>Purchase Price:</strong> £${gadgetDetails ? gadgetDetails.purchasePrice.toFixed(2) : '0.00'}</p>
                        <p><strong>Purchase Date:</strong> ${gadgetDetails ? gadgetDetails.purchaseDate : 'N/A'}</p>
                        <p><strong>Premium Period:</strong> ${window.selectedPremiumPeriod || '—'}</p>
                        <p><strong>Premium:</strong> £${baseDisplay.toFixed(2)}`;
                
                if (gadget.discountPercent > 0) {
                    premiumHtml += ` <span class="mgu-discount-amount">(${gadget.discountPercent}% discount applied)</span>`;
                }
                
                premiumHtml += '</p>';
                
                // Show loss cover per gadget using stored quote values if available and loss cover is enabled
                const lossCoverEnabled = $('#policy-loss-cover').is(':checked');
                // Check if this gadget is a laptop - use gadgetType from API response (most reliable)
                const isLaptop = gadget.gadgetType === 'Laptop' || 
                                (gadgetDetails && gadgetDetails.gadgetType === 'Laptop') ||
                                (basketGadgets[index] && basketGadgets[index].gadgetType === 'Laptop');
                
                if (lossCoverEnabled) {
                    if (isLaptop) {
                        // Laptops don't get loss cover - show message instead
                        premiumHtml += `<p><strong>Loss Cover:</strong> <span class="mgu-help-text-small" style="color: #666; font-style: italic;">Loss cover is not available for laptops</span></p>`;
                    } else if (lossMonthly > 0 || lossAnnual > 0) {
                        // Show loss cover premium for non-laptop devices
                        const lossDisplay = window.selectedPremiumPeriod === 'Annual' ? lossAnnual : lossMonthly;
                        premiumHtml += `<p><strong>Loss Cover:</strong> £${lossDisplay.toFixed(2)}</p>`;
                    }
                }
                
                // Add delete button with policy ID for removal
                premiumHtml += `<button type="button" class="mgu-delete-gadget-btn" data-policy-id="${gadget.id}">Delete</button>`;
                
                premiumHtml += '</div>';
            });
            premiumHtml += '</div>';
        }
        
        // Show detailed breakdown
        premiumHtml += '<div class="mgu-quote-breakdown">';
        
        // Calculate pre-discount total
        const preDiscountTotal = basePremium + lossCoverPremium;
        const discountAmount = discountTotal > 0 ? preDiscountTotal * discountTotal : 0;
        
        // Gross premium before discount
        premiumHtml += `<p class="mgu-quote-breakdown-bold">Gross Premium (before discount): £${basePremium.toFixed(2)}</p>`;
        
        // Loss cover before discount
        if (lossCoverPremium > 0) {
            premiumHtml += `<p>Loss Cover (before discount): £${lossCoverPremium.toFixed(2)}</p>`;
        }
        
        // Total premium before discount
        premiumHtml += `<p class="mgu-quote-breakdown-bold">Total Premium (before discount): £${preDiscountTotal.toFixed(2)}</p>`;
        
        // Discount percentage and note
        const discountPercentage = (discountTotal * 100).toFixed(0);
        if (numberOfPolicies === 1) {
            premiumHtml += `<p class="mgu-quote-discount-info">Discount: 0% - Insure one more gadget to get 10% discount</p>`;
        } else if (numberOfPolicies === 2) {
            premiumHtml += `<p class="mgu-quote-discount-positive">Discount: ${discountPercentage}% - Insure 4 or more gadgets for our maximum discount</p>`;
        } else if (numberOfPolicies === 3) {
            premiumHtml += `<p class="mgu-quote-discount-positive">Discount: ${discountPercentage}% - Insure 4 or more gadgets for our maximum discount</p>`;
        } else if (numberOfPolicies >= 4) {
            premiumHtml += `<p class="mgu-quote-discount-positive">Discount: ${discountPercentage}%</p>`;
        } else {
            premiumHtml += `<p class="mgu-quote-discount-positive">Discount: ${discountPercentage}%</p>`;
        }
        
        // Discount amount
        if (discountAmount > 0) {
            premiumHtml += `<p class="mgu-discount-amount">Discount Amount: -£${discountAmount.toFixed(2)}</p>`;
        }
        
        // Final premium
        premiumHtml += `<p class="mgu-quote-final-premium">Final Premium: £${totalPremium.toFixed(2)}</p>`;
        premiumHtml += '</div>';
        premiumHtml += '</div>';
        
        $('#total-premium-display').html(premiumHtml);
    }
    
    // Function to reset device form
    function resetDeviceForm() {
        $('#device-form')[0].reset();
        // Set purchase date to today
        const today = new Date().toISOString().split('T')[0];
        $('#device-purchase-date').val(today);
        
        // Only hide memory options if we're actually resetting (not when model is selected)
        // Memory options will be populated right after this, so we'll clear but not necessarily hide
        $('#memory-radio-buttons').empty();
        $('#premium-period-container').hide();
        $('#premium-period-buttons').empty();
        $('#get-quote-btn').prop('disabled', true);
        $('#step-device .mgu-api-step-result').removeClass('error success').empty();
        
        // Note: We don't hide memory-options-container here because populateMemoryOptions() 
        // will be called right after and will show it if memory options exist
    }
    
    // Function to validate quote button state
    function validateQuoteButton() {
        const purchaseDate = $('#device-purchase-date').val();
        const purchasePrice = $('#device-purchase-price').val();
        
        // Check if memory options container is visible (meaning memory options exist)
        const memoryOptionsExist = $('#memory-options-container').is(':visible');
        // Only require memory selection if memory options are displayed
        const memorySelected = !memoryOptionsExist || $('input[name="memory-option"]:checked').length > 0;
        
        // Check if purchase date is within 36 months
        let dateValid = false;
        if (purchaseDate) {
            const purchaseDateObj = new Date(purchaseDate);
            const now = new Date();
            const thirtySixMonthsAgo = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
            dateValid = purchaseDateObj >= thirtySixMonthsAgo && purchaseDateObj <= now;
        }
        
        // Premium period now selected at policy level
        const premiumPeriodSelected = true;
        
        // Enable button if required fields are filled and date is valid (purchase price is optional)
        const allValid = purchaseDate && memorySelected && premiumPeriodSelected && dateValid;
        
        $('#get-quote-btn').prop('disabled', !allValid);
        
        // Visual feedback - add/remove disabled class
        if (allValid) {
            $('#get-quote-btn').removeClass('disabled').addClass('enabled');
        } else {
            $('#get-quote-btn').removeClass('enabled').addClass('disabled');
        }
    }
    
    // Add event handlers for form validation
    $('#device-purchase-date, #device-purchase-price').on('input change', function() {
        validateQuoteButton();
    });
    
    // Premium period handled at policy level

    // Marketing toggle: reflect selected styling on click/change
    $(document).on('change', '#policy-marketing', function() {
        const $wrap = $(this).closest('.mgu-marketing-toggle');
        const $label = $wrap.find('label[for="policy-marketing"]');
        if ($(this).is(':checked')) {
            $wrap.addClass('selected');
            if ($label.length) {
                $label.text('I agree to receive marketing communications');
            }
        } else {
            $wrap.removeClass('selected');
            if ($label.length) {
                $label.text('Please do not send me Marketing Communications');
            }
        }
    });
    
    
    // Add click handler for quote button
    $('#get-quote-btn').on('click', function(e) {
        if ($(this).prop('disabled')) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });
    
    // Step 5: Add Another Gadget button
    $('#add-another-gadget').on('click', function() {
        handleAddAnotherGadget();
    });
    
    // Step 5: Proceed to Policy button
    $('#proceed-to-policy').on('click', function() {
        handleProceedToPolicy();
    });
    
    // Step 5: Policy Loss Cover checkbox
    $(document).on('change', '#policy-loss-cover', function() {
        handlePolicyLossCoverToggle();
        const $wrap = $(this).closest('.mgu-loss-toggle');
        const $text = $wrap.find('.mgu-loss-text');
        if ($(this).is(':checked')) {
            $wrap.addClass('selected');
            if ($text.length) { $text.text('Included'); }
        } else {
            $wrap.removeClass('selected');
            if ($text.length) { $text.text('Excluded'); }
        }
        // Re-render totals immediately client-side
        if (lastBasketData) {
            displayBasketPremiums(lastBasketData);
        }
    });
    

    // Make the whole loss box clickable and keep text/selection in sync
    $(document).on('click', '.mgu-loss-toggle', function(e) {
        // Ignore direct clicks on the checkbox; change handler will run
        if ($(e.target).is('#policy-loss-cover') || $(e.target).closest('label').length) return;
        const $cb = $(this).find('#policy-loss-cover');
        $cb.prop('checked', !$cb.prop('checked')).trigger('change');
    });
    
    // Handle delete gadget button clicks
    $(document).on('click', '.mgu-delete-gadget-btn', function(e) {
        e.preventDefault();
        const policyId = parseInt($(this).data('policy-id'), 10);
        if (!policyId) {
            return;
        }
        handleDeleteGadget(policyId);
    });
    
    // Function to handle Add Another Gadget
    function handleAddAnotherGadget() {
        // Reset all forms
        $('#gadget-type-select').val('').trigger('change');
        $('#manufacturer-select').empty().append('<option value="">Select a manufacturer...</option>');
        $('#model-select').empty().append('<option value="">Select a model...</option>');
        resetDeviceForm();
        // Note: We don't clear quoteDataByPolicyId here because we want to keep quote data for existing gadgets
        
        // Hide all steps except Step 1
        $('.mgu-api-step').hide();
        $('#step-gadget-type').show();
        
        // Clear any error messages
        $('.mgu-api-step-result').removeClass('error success').empty();
    }
    
    // Function to handle Proceed to Policy
    function handleProceedToPolicy() {
        // Validate period has been selected
        if (!window.selectedPremiumPeriod) {
            alert('Please select a billing period (Monthly or Annual) before proceeding.');
            return;
        }
        
        // Get current selections
        const selectedPeriod = window.selectedPremiumPeriod;
        const lossCoverEnabled = $('#policy-loss-cover').is(':checked');
        
        // Show loading state
        showLoading('step-quote');
        
        // Step 1: Cancel current basket
        cancelAndRecreateBasket(selectedPeriod, lossCoverEnabled);
    }
    
    // Function to cancel old basket and create new one with correct settings
    function cancelAndRecreateBasket(selectedPeriod, lossCoverEnabled) {
        $.ajax({
            url: mgu_api.ajax_url,
            type: 'POST',
            data: {
                action: 'mgu_api_cancel_basket',
                basket_id: currentBasketId,
                nonce: mgu_api.nonce
            },
            success: function(response) {
                if (response.success) {
                    // Clear old quote data since policy IDs will be new after basket recreation
                    quoteDataByPolicyId = {};
                    // Step 2: Get customer ID from old basket and open new one
                    openBasketWithSettings(selectedPeriod, lossCoverEnabled);
                } else {
                    hideLoading('step-quote');
                    showError('step-quote', 'Failed to update basket: ' + (response.data || 'Unknown error'));
                }
            },
            error: function(xhr, status, error) {
                hideLoading('step-quote');
                showError('step-quote', 'Error updating basket: ' + error);
            }
        });
    }
    
    // Function to open new basket with correct period/loss cover, then re-add gadgets
    function openBasketWithSettings(selectedPeriod, lossCoverEnabled) {
        // Get customer ID from last basket data
        let customerId = null;
        if (lastBasketData && lastBasketData.customerId) {
            customerId = lastBasketData.customerId;
        } else {
            hideLoading('step-quote');
            showError('step-quote', 'Unable to get customer ID');
            return;
        }
        
        $.ajax({
            url: mgu_api.ajax_url,
            type: 'POST',
            data: {
                action: 'mgu_api_open_basket',
                customer_id: customerId,
                premium_period: selectedPeriod,
                include_loss_cover: lossCoverEnabled ? 'Yes' : 'No',
                nonce: mgu_api.nonce
            },
            success: function(basketResponse) {
                if (basketResponse.success && basketResponse.data && basketResponse.data.value) {
                    currentBasketId = basketResponse.data.value;
                    // Update currentCustomerId with the customerId used to open this basket
                    currentCustomerId = customerId;
                    // Step 3: Re-add all gadgets
                    reAddAllGadgets();
                } else {
                    hideLoading('step-quote');
                    showError('step-quote', 'Failed to open basket: ' + (basketResponse.data || 'Unknown error'));
                }
            },
            error: function(xhr, status, error) {
                hideLoading('step-quote');
                showError('step-quote', 'Error opening basket: ' + error);
            }
        });
    }
    
    // Function to re-add all gadgets to the new basket
    function reAddAllGadgets() {
        if (!basketGadgets || basketGadgets.length === 0) {
            hideLoading('step-quote');
            showError('step-quote', 'No gadgets to add');
            return;
        }
        
        let gadgetsToAdd = [...basketGadgets];
        let addIndex = 0;
        
        function addNextGadget() {
            // This function will be called recursively until all gadgets are added
            // The success handler will call getBasketData() when all are done
            
            const gadget = gadgetsToAdd[addIndex];
            
            $.ajax({
                url: mgu_api.ajax_url,
                type: 'POST',
                data: {
                    action: 'mgu_api_add_gadget',
                    basket_id: currentBasketId,
                    gadget_data: {
                        productId: gadget.productId,
                        dateOfPurchase: gadget.purchaseDate,
                        serialNumber: gadget.serialNumber || '',
                        installedMemory: gadget.memoryInstalled ? formatMemoryValue(gadget.memoryInstalled) : '0GB',
                        purchasePrice: gadget.purchasePrice
                    },
                    nonce: mgu_api.nonce
                },
                success: function(response) {
                    if (response.success) {
                        addIndex++;
                        if (addIndex >= gadgetsToAdd.length) {
                            // All gadgets re-added - refresh basket data and fetch fresh quotes for all
                            hideLoading('step-quote');
                            // Update policyLossCoverEnabled flag
                            policyLossCoverEnabled = $('#policy-loss-cover').is(':checked');
                            // Fetch fresh quotes for all re-added gadgets
                            refreshQuotesForAllGadgets();
                            // Show policy step
                            $('#step-policy').show();
                            setActiveStep('step-policy');
                        } else {
                            addNextGadget();
                        }
                    } else {
                        hideLoading('step-quote');
                        showError('step-quote', 'Failed to add gadget: ' + (response.data || 'Unknown error'));
                    }
                },
                error: function(xhr, status, error) {
                    hideLoading('step-quote');
                    showError('step-quote', 'Error adding gadget: ' + error);
                }
            });
        }
        
        // Start adding gadgets one by one
        addNextGadget();
    }
    
    // Function to handle delete gadget
    function handleDeleteGadget(policyId) {
        if (!currentBasketId) {
            showError('step-quote', 'No basket available');
            return;
        }
        
        // Show loading state
        showLoading('step-quote');
        
        $.ajax({
            url: mgu_api.ajax_url,
            type: 'POST',
            data: {
                action: 'mgu_api_remove_policy',
                basket_id: currentBasketId,
                policy_id: policyId,
                nonce: mgu_api.nonce
            },
            success: function(response) {
                hideLoading('step-quote');
                if (response.success) {
                    // Find and remove gadget from local array by matching with API response data
                    if (response.data && response.data.policies) {
                        const remainingPolicyIds = response.data.policies.map(p => p.id);
                        // Remove gadgets that are no longer in the basket
                        basketGadgets = basketGadgets.filter((gadget, index) => {
                            if (lastBasketData && lastBasketData.policies && lastBasketData.policies[index]) {
                                return remainingPolicyIds.includes(lastBasketData.policies[index].id);
                            }
                            return true;
                        });
                    }
                    // Also remove quote data for deleted policy
                    delete quoteDataByPolicyId[policyId];
                    // Refresh basket data and display
                    lastBasketData = response.data;
                    displayBasketPremiums(response.data);
                } else {
                    showError('step-quote', 'Failed to remove gadget: ' + (response.data.message || 'Unknown error'));
                }
            },
            error: function(xhr, status, error) {
                hideLoading('step-quote');
                showError('step-quote', 'Error removing gadget: ' + error);
            }
        });
    }
    
    // Function to handle Policy Loss Cover toggle
    function handlePolicyLossCoverToggle() {
        policyLossCoverEnabled = $('#policy-loss-cover').is(':checked');
        
        // Update premium display immediately (don't wait for API response)
        getBasketData();
        
        // Update basket loss cover
        updateBasketLossCover();
    }
    
    // Function to update basket loss cover
    function updateBasketLossCover() {
        if (!currentBasketId) {
            return;
        }
        
        const action = policyLossCoverEnabled ? 'add_loss_cover' : 'remove_loss_cover';
        
        $.ajax({
            url: mgu_api.ajax_url,
            type: 'POST',
            data: {
                action: 'mgu_api_' + action,
                basket_id: currentBasketId,
                nonce: mgu_api.nonce
            },
            success: function(response) {
                if (response.success) {
                    // Refresh basket data and display updated totals
                    getBasketData();
                } else {
                    showError('step-quote', 'Failed to update loss cover: ' + (response.data || 'Unknown error'));
                }
            },
            error: function(xhr, status, error) {
                showError('step-quote', 'Error updating loss cover: ' + error);
            }
        });
    }
}); 
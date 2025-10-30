jQuery(document).ready(function($) {
    console.log('Script loaded');
    console.log('AJAX URL:', mgu_api.ajax_url);
    console.log('Nonce:', mgu_api.nonce);

    // Global variables to store state
    window.currentGadgetType = '';
    window.currentQuoteId = null;
    window.selectedQuoteOption = null;
    window.quoteOptions = [];
    let selectedModelData = null;
    let currentBasketId = null;
    let basketGadgets = [];
    let policyLossCoverEnabled = false;

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

    // Handle gadget type selection
    $('#gadget-type-select').on('change', function() {
        const gadgetType = $(this).val();
        if (!gadgetType) return;

        console.log('Selected gadget type:', gadgetType);

        // Show manufacturer step
        $('#step-manufacturer').show();
        
        const requestData = {
            action: 'mgu_api_get_manufacturers',
            gadget_type: gadgetType,
            nonce: mgu_api.nonce
        };
        
        console.log('Sending manufacturer request:', requestData);
        
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
                console.log('Manufacturers response:', response);
                console.log('Response success:', response.success);
                console.log('Response data:', response.data);
                
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
                        console.log('Successfully loaded ' + manufacturers.length + ' manufacturers');
                    } else {
                        // No manufacturers returned - clear dropdown but don't show error (this is a valid empty result)
                        const select = $('#manufacturer-select');
                        select.empty().append('<option value="">Select a manufacturer...</option>');
                        
                        console.log('No manufacturers available for gadget type:', gadgetType);
                        // Clear any existing messages - empty results are not errors
                        $('#step-manufacturer .mgu-api-step-result').removeClass('error success').empty();
                    }
                } else {
                    // Response failed - show error but allow retry
                    console.log('Manufacturers request failed - response:', response);
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
        
        console.log('Loading models with:', {
            manufacturer_id: manufacturerId,
            gadget_type: gadgetType,
            nonce: mgu_api.nonce
        });
        
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
                console.log('Models response:', response);
                console.log('Models response success:', response.success);
                console.log('Models response data:', response.data);
                
                const select = $('#model-select');
                select.empty().append('<option value="">Select a model...</option>');
                
                if (response.success && response.data && response.data.value) {
                    const models = response.data.value || [];
                    
                    if (models.length > 0) {
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
                        console.log('Successfully loaded ' + models.length + ' models');
                    } else {
                        // No models returned - clear dropdown but don't show error (this is a valid empty result)
                        console.log('No models available for this manufacturer and gadget type');
                        // Clear any existing messages - empty results are not errors
                        $('#step-model .mgu-api-step-result').removeClass('error success').empty();
                    }
                } else {
                    // Only show error if we didn't get models
                    console.log('Models failed - response:', response);
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
            
            // Populate memory options if available
            populateMemoryOptions();
            
            // Reset form and disable quote button
            resetDeviceForm();
            
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
            memoryInstalled: $('input[name="memory-option"]:checked').val(),
            purchasePrice: parseFloat($('#device-purchase-price').val()) || 0,
            purchaseDate: $('#device-purchase-date').val(),
            serialNumber: $('#device-serial-number').val(),
            premiumPeriod: $('input[name="premium-period"]:checked').val()
        };

        console.log('Submitting device data:', deviceData);
        console.log('Selected model object:', window.selectedModel);
        console.log('Model select value:', $('#model-select').val());

        // Add gadget to basket and show quote summary
        console.log('DEBUG - Current basket ID:', currentBasketId);
        if (currentBasketId) {
            // We already have a basket, just add the gadget to it
            console.log('DEBUG - Adding additional gadget to existing basket:', currentBasketId);
            addGadgetToBasket(deviceData);
        } else {
            // First gadget, create customer and basket
            console.log('DEBUG - Adding first gadget, creating customer and basket');
            handleAddFirstGadget(deviceData);
        }
    });

    // Function to get quote
    function getQuote(deviceData) {
        console.log('Sending quote request with data:', deviceData);
        
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
                console.log('Quote response received:', response);
                if (response.success && response.data) {
                    console.log('Quote data:', response.data);
                    displayQuoteV2(response.data);
                    $('#step-quote').show();
                    // Clear any error messages
                    $('.mgu-api-step-result').removeClass('error success').empty();
                } else {
                    console.error('Quote error:', response.data);
                    showError('step-device', 'Failed to get quote: ' + (response.data || 'Unknown error'));
                }
            },
            error: function(xhr, status, error) {
                console.error('Quote request failed:', {xhr, status, error});
                showError('step-device', 'Failed to get quote');
            }
        });
    }

    // Function to display quote
    function displayQuoteV2(quoteData) {
        console.log('Displaying V2 quote data:', quoteData);
        
        if (!quoteData) {
            console.error('Invalid quote data received');
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
        console.log('Displaying quote data:', quoteData);
        
        if (!quoteData || !quoteData.value || !Array.isArray(quoteData.value)) {
            console.error('Invalid quote data received');
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
            
            console.log('Selected quote option:', window.selectedQuoteOption);
            console.log('Current quote ID:', window.currentQuoteId);
        }
    });

    // Handle buy policy
    $('#buy-policy').on('click', function(e) {
        e.preventDefault();
        // For V2 API, we have a single quote, no need to select from options
        console.log('Buy Policy clicked - moving to policy creation');
        $('#step-policy').show();
    });

    // Handle policy form submission
    $('#policy-form').on('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted - Starting policy creation process');
        console.log('Current basket ID:', currentBasketId);

        if (!currentBasketId) {
            console.error('No basket ID available');
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
            console.error('Missing required customer fields');
            alert('Please fill in all required fields (First Name, Last Name, Email, Phone)');
            return;
        }
        
        if (!customerData.address1 || !customerData.postCode) {
            console.error('Missing required address fields');
            alert('Please fill in Address Line 1 and Postcode');
            return;
        }

        console.log('DEBUG - Customer data being sent:', JSON.stringify(customerData, null, 2));
        console.log('DEBUG - Using existing basket ID:', currentBasketId);

        // Show loading state on policy step
        showLoading('step-policy');
        
        // Update customer data and confirm basket (using existing basket)
        console.log('DEBUG - Updating customer and confirming existing basket');
        
        // For now, we'll use the existing basket and confirm it
        // In a real implementation, you might want to update customer data first
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
                console.log('DEBUG - Basket confirmed:', confirmResponse);
                if (confirmResponse.success) {
                    // Check if payment is required
                    const outcome = confirmResponse.data.Outcome;
                    console.log('DEBUG - Confirm basket outcome:', outcome);
                    
                    if (outcome === 'PaymentRequired') {
                        // Payment required - process direct debit
                        console.log('DEBUG - Payment required, processing direct debit');
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
                                console.log('DEBUG - Payment processed:', paymentResponse);
                                if (paymentResponse.success) {
                                    showSuccess('step-policy', 'Policy created and payment processed successfully!');
                                } else {
                                    showError('step-policy', 'Failed to process payment: ' + (paymentResponse.data.message || 'Unknown error'));
                                }
                            },
                            error: function(xhr, status, error) {
                                console.error('DEBUG - Payment processing error:', {xhr, status, error});
                                showError('step-policy', 'Error processing payment: ' + error);
                            }
                        });
                    } else if (outcome === 'Confirmed') {
                        // No payment required - basket is already confirmed
                        console.log('DEBUG - No payment required, basket confirmed');
                        showSuccess('step-policy', 'Policy created successfully!');
                    } else {
                        showError('step-policy', 'Unexpected basket status: ' + outcome);
                    }
                } else {
                    showError('step-policy', 'Failed to confirm basket: ' + (confirmResponse.data.message || 'Unknown error'));
                }
            },
            error: function(xhr, status, error) {
                console.error('DEBUG - Basket confirmation error:', {xhr, status, error});
                showError('step-policy', 'Error confirming basket: ' + error);
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
    
    // Function to populate memory options based on selected model
    function populateMemoryOptions() {
        // We need to get the full model data from the models that were loaded
        if (!selectedModelData) return;
        
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
                if (response.success && response.data && response.data.value) {
                    const models = response.data.value;
                    const selectedModel = models.find(model => model.id == selectedModelData.id);
                    
                    if (selectedModel && selectedModel.memoryOptions && selectedModel.memoryOptions.length > 0) {
                        // Show memory options container
                        $('#memory-options-container').show();
                        
                        // Clear existing options
                        $('#memory-radio-buttons').empty();
                        
                        // Add radio buttons for each memory option
                        selectedModel.memoryOptions.forEach(function(memoryOption) {
                            const radioId = 'memory-' + memoryOption.replace(/[^a-zA-Z0-9]/g, '');
                            const radioHtml = `
                                <div class="mgu-api-radio-option">
                                    <input type="radio" id="${radioId}" name="memory-option" value="${memoryOption}">
                                    <label for="${radioId}">${memoryOption}</label>
                                </div>
                            `;
                            $('#memory-radio-buttons').append(radioHtml);
                        });
                        
                        // Add click handler for radio options
                        $('.mgu-api-radio-option').on('click', function() {
                            $(this).addClass('selected').siblings().removeClass('selected');
                            $(this).find('input[type="radio"]').prop('checked', true);
                            
                            // Get quote data to populate premium period options
                            populatePremiumPeriodOptions(selectedModel.id, $(this).find('input[type="radio"]').val());
                            
                            validateQuoteButton();
                        });
                    } else {
                        // Hide memory options if none available
                        $('#memory-options-container').hide();
                    }
                }
            }
        });
    }
    
    // Function to populate premium period options with quote data
    function populatePremiumPeriodOptions(productId, memoryInstalled) {
        // Get current form data
        const purchasePrice = parseFloat($('#device-purchase-price').val()) || 0;
        
        console.log('DEBUG - Populating premium period options for product:', productId, 'memory:', memoryInstalled, 'price:', purchasePrice);
        
        // Show loading state
        showLoading('step-device');
        
        $.ajax({
            url: mgu_api.ajax_url,
            type: 'POST',
            data: {
                action: 'mgu_api_get_quote',
                device_data: {
                    productId: productId,
                    memoryInstalled: memoryInstalled,
                    purchasePrice: purchasePrice,
                    purchaseDate: $('#device-purchase-date').val(),
                    serialNumber: $('#device-serial-number').val()
                },
                nonce: mgu_api.nonce
            },
            success: function(response) {
                hideLoading('step-device');
                console.log('DEBUG - Quote response for premium period options:', response);
                if (response.success && response.data) {
                    const quoteData = response.data;
                    console.log('DEBUG - Quote data:', quoteData);
                    
                    // Store quote data globally for policy creation
                    window.currentQuoteData = quoteData;
                    
                    // Show premium period container
                    $('#premium-period-container').show();
                    
                    // Clear existing options
                    $('#premium-period-buttons').empty();
                    
                    // Use base premiums (loss cover handled separately)
                    let monthlyPremium = quoteData.monthlyPremium || 0;
                    let annualPremium = quoteData.annualPremium || 0;
                    
                    // Add radio buttons for monthly and annual premiums
                    const monthlyHtml = `
                        <div class="mgu-api-radio-option">
                            <input type="radio" id="premium-monthly" name="premium-period" value="Month">
                            <label for="premium-monthly">Monthly - £${monthlyPremium.toFixed(2)}</label>
                        </div>
                    `;
                    
                    const annualHtml = `
                        <div class="mgu-api-radio-option">
                            <input type="radio" id="premium-annual" name="premium-period" value="Annual">
                            <label for="premium-annual">Annual - £${annualPremium.toFixed(2)}</label>
                        </div>
                    `;
                    
                    $('#premium-period-buttons').append(monthlyHtml).append(annualHtml);
                    console.log('DEBUG - Premium period buttons added');
                    
                    // Add click handler for premium period options
                    $('.mgu-api-radio-option').on('click', function() {
                        $(this).addClass('selected').siblings().removeClass('selected');
                        $(this).find('input[type="radio"]').prop('checked', true);
                        
                        // Update stored quote data with selected premium period
                        if (window.currentQuoteData) {
                            window.currentQuoteData.selectedPremiumPeriod = $(this).find('input[type="radio"]').val();
                            console.log('DEBUG - Updated quote data with premium period:', window.currentQuoteData.selectedPremiumPeriod);
                        }
                        
                        validateQuoteButton();
                    });
                } else {
                    console.error('DEBUG - Quote request failed:', response);
                }
            },
            error: function(xhr, status, error) {
                hideLoading('step-device');
                console.error('Error getting quote for premium period options:', {xhr, status, error});
            }
        });
    }
    
    // Function to handle adding the first gadget to basket
    function handleAddFirstGadget(deviceData) {
        console.log('DEBUG - Adding first gadget to basket:', deviceData);
        
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
                    console.log('DEBUG - Customer created/found with ID:', customerId);
                    
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
                    console.log('DEBUG - Basket opened with ID:', currentBasketId);
                    
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
                    console.log('DEBUG - Gadget added to basket successfully');
                    
                    // Store gadget data for display
                    basketGadgets.push({
                        productId: deviceData.productId,
                        memoryInstalled: deviceData.memoryInstalled,
                        purchasePrice: deviceData.purchasePrice,
                        purchaseDate: deviceData.purchaseDate,
                        serialNumber: deviceData.serialNumber,
                        premiumPeriod: deviceData.premiumPeriod,
                        modelName: selectedModelData ? selectedModelData.name : 'Unknown Model'
                    });
                    
                    // Show quote summary and refresh basket data
                    $('#step-quote').show();
                    // Hide Step 6 (Policy Creation) when showing Step 5
                    $('#step-policy').hide();
                    // Get updated basket data to show all gadgets and correct totals
                    getBasketData();
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
        console.log('DEBUG - Displaying quote summary for gadgets:', basketGadgets);
        
        // Display gadget list
        let gadgetListHtml = '<h4>Gadgets in your policy:</h4>';
        basketGadgets.forEach((gadget, index) => {
            gadgetListHtml += `
                <div class="mgu-api-gadget-item" style="border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 5px;">
                    <strong>${gadget.modelName}</strong><br>
                    Memory: ${gadget.memoryInstalled || 'N/A'}<br>
                    Purchase Price: £${gadget.purchasePrice.toFixed(2)}<br>
                    Purchase Date: ${gadget.purchaseDate}<br>
                    Premium Period: ${gadget.premiumPeriod}
                </div>
            `;
        });
        $('#gadget-list').html(gadgetListHtml);
        
        // Always enable loss cover checkbox - consumers can toggle freely
        $('#policy-loss-cover').prop('disabled', false);
        console.log('DEBUG - Loss cover checkbox always enabled, disabled state:', $('#policy-loss-cover').prop('disabled'));
        $('#policy-loss-cover-info').html(`
            <div style="font-size: 0.9em; color: #666;">
                Loss cover option available - toggle as needed
            </div>
        `);
        
        // Get basket data to display proper premiums
        getBasketData();
    }
    
    // Function to get basket data and display premiums
    function getBasketData() {
        if (!currentBasketId) {
            console.error('DEBUG - No basket ID available for getting basket data');
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
                    console.log('DEBUG - Basket data received:', response.data);
                    displayBasketPremiums(response.data);
                } else {
                    console.error('DEBUG - Failed to get basket data:', response);
                    displayBasketPremiums(null);
                }
            },
            error: function(xhr, status, error) {
                console.error('DEBUG - Error getting basket data:', error);
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
                    lossPremium: policy.lossPremium || 0
                }));
            }
            
            // Calculate individual premiums (without loss cover)
            const individualBasePremiums = individualGadgets.reduce((total, gadget) => total + (gadget.premium || 0), 0);
            const individualLossPremiums = individualGadgets.reduce((total, gadget) => total + (gadget.lossPremium || 0), 0);
            
            // Check if loss cover is enabled
            const isLossCoverChecked = $('#policy-loss-cover').is(':checked');
            
            if (isLossCoverChecked) {
                // Use individual calculations
                basePremium = individualBasePremiums;
                lossCoverPremium = individualLossPremiums;
                totalPremium = basePremium + lossCoverPremium;
            } else {
                // Calculate base premium without loss cover
                basePremium = individualBasePremiums;
                lossCoverPremium = 0;
                totalPremium = basePremium;
            }
            
            // Apply discount (discountTotal is a percentage)
            if (discountTotal > 0) {
                const discountAmount = totalPremium * discountTotal;
                totalPremium = totalPremium - discountAmount;
            }
            
            console.log('DEBUG - Premium calculation:', {
                basePremium: basePremium,
                lossCoverPremium: lossCoverPremium,
                discountTotal: discountTotal,
                numberOfPolicies: numberOfPolicies,
                isLossCoverChecked: isLossCoverChecked,
                totalPremium: totalPremium,
                individualGadgets: individualGadgets,
                basketData: basketData
            });
        }
        
        // Update loss cover info - checkbox is always enabled
        console.log('DEBUG - Basket data for loss cover:', basketData);
        console.log('DEBUG - Loss cover available:', basketData ? basketData.lossCoverAvailable : 'No basket data');
        
        // Always keep the checkbox enabled - consumers can toggle as needed
        $('#policy-loss-cover').prop('disabled', false);
        
        if (basketData && basketData.lossCoverAvailable) {
            $('#policy-loss-cover-info').html(`
                <div style="font-size: 0.9em; color: #666;">
                    Loss cover available for this policy
                </div>
            `);
        } else {
            $('#policy-loss-cover-info').html(`
                <div style="font-size: 0.9em; color: #999;">
                    Loss cover may not be available for this policy
                </div>
            `);
        }
        
        console.log('DEBUG - Loss cover checkbox always enabled');
        
        // Update the premium display with detailed breakdown
        let premiumHtml = '<div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">';
        premiumHtml += '<h4>Your Quote Summary</h4>';
        
        // Show individual gadgets
        if (individualGadgets.length > 0) {
            premiumHtml += '<div style="margin: 10px 0;">';
            individualGadgets.forEach((gadget, index) => {
                premiumHtml += `
                    <div style="border: 1px solid #ddd; padding: 10px; margin: 5px 0; border-radius: 3px; background: white;">
                        <h5 style="margin: 0 0 5px 0;">Gadget ${index + 1}: ${gadget.make} ${gadget.model}</h5>
                        <p style="margin: 2px 0;">Premium: £${gadget.premium.toFixed(2)}`;
                
                if (gadget.discountPercent > 0) {
                    premiumHtml += ` <span style="color: #28a745; font-weight: bold;">(${gadget.discountPercent}% discount applied)</span>`;
                }
                
                premiumHtml += '</p>';
                
                if (gadget.lossCover && gadget.lossPremium > 0) {
                    premiumHtml += `<p style="margin: 2px 0; color: #666;">Loss Cover: £${gadget.lossPremium.toFixed(2)}</p>`;
                }
                
                premiumHtml += '</div>';
            });
            premiumHtml += '</div>';
        }
        
        // Show detailed breakdown
        premiumHtml += '<div style="border-top: 2px solid #ddd; padding-top: 10px; margin-top: 10px;">';
        
        // Calculate pre-discount total
        const preDiscountTotal = basePremium + lossCoverPremium;
        const discountAmount = discountTotal > 0 ? preDiscountTotal * discountTotal : 0;
        
        // Gross premium before discount
        premiumHtml += `<p style="margin: 5px 0;"><strong>Gross Premium (before discount): £${basePremium.toFixed(2)}</strong></p>`;
        
        // Loss cover before discount
        if (lossCoverPremium > 0) {
            premiumHtml += `<p style="margin: 5px 0;">Loss Cover (before discount): £${lossCoverPremium.toFixed(2)}</p>`;
        }
        
        // Total premium before discount
        premiumHtml += `<p style="margin: 5px 0; font-weight: bold;">Total Premium (before discount): £${preDiscountTotal.toFixed(2)}</p>`;
        
        // Discount percentage and note
        const discountPercentage = (discountTotal * 100).toFixed(0);
        if (numberOfPolicies === 1) {
            premiumHtml += `<p style="margin: 5px 0; color: #666; font-style: italic;">Discount: 0% - Insure one more gadget to get 10% discount</p>`;
        } else if (numberOfPolicies === 2) {
            premiumHtml += `<p style="margin: 5px 0; color: #28a745; font-weight: bold;">Discount: ${discountPercentage}% - Insure 4 or more gadgets for our maximum discount</p>`;
        } else if (numberOfPolicies === 3) {
            premiumHtml += `<p style="margin: 5px 0; color: #28a745; font-weight: bold;">Discount: ${discountPercentage}% - Insure 4 or more gadgets for our maximum discount</p>`;
        } else if (numberOfPolicies >= 4) {
            premiumHtml += `<p style="margin: 5px 0; color: #28a745; font-weight: bold;">Discount: ${discountPercentage}%</p>`;
        } else {
            premiumHtml += `<p style="margin: 5px 0; color: #28a745; font-weight: bold;">Discount: ${discountPercentage}%</p>`;
        }
        
        // Discount amount
        if (discountAmount > 0) {
            premiumHtml += `<p style="margin: 5px 0; color: #28a745; font-weight: bold;">Discount Amount: -£${discountAmount.toFixed(2)}</p>`;
        }
        
        // Final premium
        premiumHtml += `<p style="margin: 10px 0; font-size: 1.2em; font-weight: bold; color: #007cba;">Final Premium: £${totalPremium.toFixed(2)}</p>`;
        premiumHtml += '</div>';
        premiumHtml += '</div>';
        
        $('#total-premium-display').html(premiumHtml);
        
        console.log('DEBUG - Premiums displayed - Base: £' + basePremium.toFixed(2) + ', Loss Cover: £' + lossCoverPremium.toFixed(2) + ', Discount: £' + discountTotal.toFixed(2) + ', Total: £' + totalPremium.toFixed(2));
    }
    
    // Function to reset device form
    function resetDeviceForm() {
        $('#device-form')[0].reset();
        // Set purchase date to today
        const today = new Date().toISOString().split('T')[0];
        $('#device-purchase-date').val(today);
        
        $('#memory-options-container').hide();
        $('#memory-radio-buttons').empty();
        $('#premium-period-container').hide();
        $('#premium-period-buttons').empty();
        $('#get-quote-btn').prop('disabled', true);
        $('#step-device .mgu-api-step-result').removeClass('error success').empty();
    }
    
    // Function to validate quote button state
    function validateQuoteButton() {
        const purchaseDate = $('#device-purchase-date').val();
        const purchasePrice = $('#device-purchase-price').val();
        const memorySelected = $('input[name="memory-option"]:checked').length > 0;
        
        // Check if purchase date is within 36 months
        let dateValid = false;
        if (purchaseDate) {
            const purchaseDateObj = new Date(purchaseDate);
            const now = new Date();
            const thirtySixMonthsAgo = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
            dateValid = purchaseDateObj >= thirtySixMonthsAgo && purchaseDateObj <= now;
            
            // Debug date validation
            console.log('Date Validation Debug:', {
                purchaseDate: purchaseDate,
                purchaseDateObj: purchaseDateObj,
                now: now,
                thirtySixMonthsAgo: thirtySixMonthsAgo,
                isAfter36MonthsAgo: purchaseDateObj >= thirtySixMonthsAgo,
                isBeforeNow: purchaseDateObj <= now,
                dateValid: dateValid
            });
        }
        
        // Check if premium period is selected
        const premiumPeriodSelected = $('input[name="premium-period"]:checked').length > 0;
        
        // Enable button if required fields are filled and date is valid (purchase price is optional)
        const allValid = purchaseDate && memorySelected && premiumPeriodSelected && dateValid;
        
        // Debug logging
        console.log('Quote Button Validation:', {
            purchaseDate: purchaseDate,
            memorySelected: memorySelected,
            premiumPeriodSelected: premiumPeriodSelected,
            dateValid: dateValid,
            allValid: allValid,
            buttonDisabled: !allValid
        });
        
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
    
    // Add event handler for premium period selection
    $(document).on('change', 'input[name="premium-period"]', function() {
        validateQuoteButton();
    });
    
    
    // Add click handler for quote button debugging
    $('#get-quote-btn').on('click', function(e) {
        console.log('Quote button clicked!');
        console.log('Button disabled state:', $(this).prop('disabled'));
        console.log('Button classes:', $(this).attr('class'));
        
        if ($(this).prop('disabled')) {
            console.log('Button is disabled - preventing form submission');
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });
    
    // Step 5: Add Another Gadget button
    $('#add-another-gadget').on('click', function() {
        console.log('DEBUG - Add Another Gadget clicked');
        handleAddAnotherGadget();
    });
    
    // Step 5: Proceed to Policy button
    $('#proceed-to-policy').on('click', function() {
        console.log('DEBUG - Proceed to Policy clicked');
        handleProceedToPolicy();
    });
    
    // Step 5: Policy Loss Cover checkbox
    $(document).on('change', '#policy-loss-cover', function() {
        console.log('DEBUG - Policy loss cover toggled:', $(this).is(':checked'));
        console.log('DEBUG - Checkbox disabled state:', $(this).prop('disabled'));
        handlePolicyLossCoverToggle();
    });
    
    // Also add click handler to ensure clicks are captured
    $(document).on('click', '#policy-loss-cover', function() {
        console.log('DEBUG - Policy loss cover clicked');
        console.log('DEBUG - Checkbox checked state:', $(this).is(':checked'));
        console.log('DEBUG - Checkbox disabled state:', $(this).prop('disabled'));
    });
    
    // Function to handle Add Another Gadget
    function handleAddAnotherGadget() {
        console.log('DEBUG - Resetting Steps 1-4 for adding another gadget');
        console.log('DEBUG - Current basket ID before reset:', currentBasketId);
        
        // Reset all forms
        $('#gadget-type-select').val('').trigger('change');
        $('#manufacturer-select').empty().append('<option value="">Select a manufacturer...</option>');
        $('#model-select').empty().append('<option value="">Select a model...</option>');
        resetDeviceForm();
        
        // Hide all steps except Step 1
        $('.mgu-api-step').hide();
        $('#step-gadget-type').show();
        
        // Clear any error messages
        $('.mgu-api-step-result').removeClass('error success').empty();
        
        console.log('DEBUG - Current basket ID after reset:', currentBasketId);
        console.log('DEBUG - Ready to add another gadget');
    }
    
    // Function to handle Proceed to Policy
    function handleProceedToPolicy() {
        console.log('DEBUG - Proceeding to policy creation');
        
        // Update loss cover setting in basket if needed
        if (policyLossCoverEnabled !== $('#policy-loss-cover').is(':checked')) {
            policyLossCoverEnabled = $('#policy-loss-cover').is(':checked');
            updateBasketLossCover();
        } else {
            // Go directly to policy creation
            $('#step-policy').show();
        }
    }
    
    // Function to handle Policy Loss Cover toggle
    function handlePolicyLossCoverToggle() {
        policyLossCoverEnabled = $('#policy-loss-cover').is(':checked');
        console.log('DEBUG - Policy loss cover enabled:', policyLossCoverEnabled);
        
        // Update premium display immediately (don't wait for API response)
        getBasketData();
        
        // Update basket loss cover
        updateBasketLossCover();
    }
    
    // Function to update basket loss cover
    function updateBasketLossCover() {
        if (!currentBasketId) {
            console.error('DEBUG - No basket ID available for loss cover update');
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
                    console.log('DEBUG - Loss cover updated successfully');
                    // Refresh basket data and display updated totals
                    getBasketData();
                } else {
                    console.error('DEBUG - Failed to update loss cover:', response.data);
                    showError('step-quote', 'Failed to update loss cover: ' + (response.data || 'Unknown error'));
                }
            },
            error: function(xhr, status, error) {
                console.error('DEBUG - Error updating loss cover:', error);
                showError('step-quote', 'Error updating loss cover: ' + error);
            }
        });
    }
}); 
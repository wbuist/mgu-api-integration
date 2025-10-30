# MGU API Integration Plugin - Current State Documentation

## Overview

The MGU API Integration plugin is a WordPress plugin that provides integration with the My Gadget Umbrella (MGU) insurance API. It allows users to create insurance policies for gadgets through a step-by-step flow interface.

## Current Functionality

### ✅ Working Features

1. **Manufacturer Selection**
   - Fetches manufacturers by gadget type (MobilePhone, Laptop, Tablet, etc.)
   - Uses endpoint: `/v2/manufacturersByGadget`
   - Validates gadget types against Swagger specification

2. **Model Selection**
   - Retrieves available models for selected manufacturer and gadget type
   - Uses endpoint: `/v2/models`
   - Returns models with memory options and product details

3. **Quote Generation**
   - Gets premium quotes for specific gadget models
   - Uses endpoint: `/v2/getQuote`
   - Returns pricing information including monthly/annual premiums, excess amounts, and loss cover options

4. **Customer Creation**
   - Creates new customers in the MGU system
   - Uses endpoint: `/v2/customer` (POST)
   - Validates all required fields according to TGadgetCustomer specification
   - Handles field length validation per Swagger spec
   - **Note**: Works fine for new customers, fails for duplicates (awaiting API fix from Russell)

5. **Basket Management**
   - Opens baskets for customers
   - Uses endpoint: `/v2/openBasket`
   - Supports premium periods (Month/Annual) and loss cover options

6. **Gadget Addition**
   - Adds gadgets to baskets
   - Uses endpoint: `/v2/insureGadget` or `/v2/insureGadgets`
   - Supports single gadget or multiple gadgets per basket

7. **Basket Confirmation**
   - Confirms baskets for payment
   - Uses endpoint: `/v2/confirm`
   - Returns payment status and requirements

8. **Payment Processing**
   - Supports direct debit payments
   - Uses endpoint: `/v2/payByDirectDebit` (POST)
   - Validates bank account details

### 🔧 Current Issues

1. **Duplicate Customer Error**
   - **Problem**: When a customer already exists in the MGU system, the API returns a 400 error with "Duplicate customer found"
   - **Current Behavior**: The plugin fails and shows an error message
   - **Impact**: Users cannot proceed with policy creation if they've previously created a customer
   - **Status**: Awaiting API fix from Russell to include customer ID in error response

## Current Flow

1. **Step 1**: User selects gadget type (MobilePhone, Laptop, etc.)
2. **Step 2**: User selects manufacturer from available options
3. **Step 3**: User selects specific model and memory configuration
4. **Step 4**: System retrieves and displays quote options
5. **Step 5**: User enters customer details
6. **Step 6**: System attempts to create customer
   - ✅ **WORKS** for new customers
   - ❌ **FAILS** if customer already exists (awaiting Russell's fix)
7. **Step 7**: System opens basket for customer
8. **Step 8**: System adds selected gadget to basket
9. **Step 9**: System confirms basket
10. **Step 10**: User enters payment details and completes purchase

## Technical Architecture

### Core Classes
- `MGU_API` - Main plugin class, handles AJAX endpoints
- `MGU_API_Client` - API client for making requests to MGU API
- `MGU_API_Loader` - WordPress hooks loader
- `MGU_API_Public` - Public-facing functionality

### Key Files
- `includes/class-mgu-api.php` - Main plugin logic and AJAX handlers
- `includes/class-mgu-api-client.php` - API communication
- `public/js/mgu-api-insurance-flow.js` - Frontend JavaScript
- `public/partials/mgu-api-insurance-flow.php` - Frontend HTML template

### Configuration
- API endpoint configuration via WordPress admin
- Client ID and secret management
- Token-based authentication with automatic refresh

## Next Steps

### Priority 1: Complete Payment Flow
- Test the complete flow from customer creation to payment completion
- Identify any missing pieces in the payment flow
- Fix any issues found

### Priority 2: Handle Duplicate Customer Issue
- Wait for Russell's API fix
- Implement the duplicate customer handling once API is updated

### Priority 3: Code Quality
- Fix PHP deprecation warnings
- Add proper error handling throughout
- Implement comprehensive testing

---

*Last Updated: September 11, 2025*
*Plugin Version: 1.0.0*

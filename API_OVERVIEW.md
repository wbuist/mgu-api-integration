# Introducing the WCS | MyGadgetUmbrella Insurance API

## 1. Why this API matters
Today's customers expect to protect their smartphones, tablets, and wearables at the point of sale or immediately after a repair. The WCS | MyGadgetUmbrella Insurance API lets you embed tailored insurance offers directly inside your existing sales or repair workflow—strengthening customer loyalty, generating new revenue, and removing the administrative burden of managing policies.

## 2. What the API delivers
- **Live pricing:** Real‑time quotes for loss, theft, and damage cover, available monthly or annually.
- **Automated compliance:** Customer documents, policy wording, and regulatory disclosures are produced and sent for you.
- **Seamless policy issuance:** A single flow confirms cover, generates certificates, and collects payment.
- **Transparent lifecycle:** Endpoints to view, update, or cancel policies keep your records in sync.
- **Multiple gadget support:** Add multiple devices to a single policy basket for streamlined customer experience.
- **Enhanced customer management:** Find customers by email, mobile, or external ID for better integration.

## 3. How it works in practice
1. **Match the device:** Your system knows the make and model. A quick lookup returns the exact manufacturer and model codes recognised by the insurer.
2. **Retrieve a quote:** Pass the device codes, sale price, and customer location. The API returns one or more quote options—monthly or annual, with or without loss cover.
3. **Present and decide:** You show the options on‑screen, answer any questions, and let the customer choose.
4. **Confirm cover:** Send a basket containing customer details and the chosen products. The API responds with a live policy reference, schedule of insurance, and payment confirmation.

Most integrations involve just a few endpoints and complete in under a second.

## 4. Authentication
The API uses **OAuth 2.0** with `client_credentials` grant type for secure authentication:

1. **Obtain Access Token:** Make a POST request to the auth endpoint with your Client ID and Client Secret
2. **Use Bearer Token:** Include the access token in the `Authorization: Bearer {token}` header for all API calls
3. **Token Management:** Tokens have expiration times and should be refreshed as needed

### Authentication Endpoints:
- **Sandbox:** `https://sandbox.api.mygadgetumbrella.com/sbauth/oauth/token`
- **Production:** `https://api.mygadgetumbrella.com/auth/oauth/token` (when available)

## 5. Environment Configuration
The plugin supports both sandbox and production environments:

- **Sandbox Environment:** For testing and development
  - Base URL: `https://sandbox.api.mygadgetumbrella.com/sbapi`
  - Auth URL: `https://sandbox.api.mygadgetumbrella.com/sbauth`
  
- **Production Environment:** For live customer transactions
  - Base URL: `https://api.mygadgetumbrella.com/api` (when available)
  - Auth URL: `https://api.mygadgetumbrella.com/auth` (when available)

Each environment requires separate Client ID and Client Secret credentials for security.

## 6. Core integration endpoints (V2 API)
A little technical detail for your developers. Each call uses HTTPS with an **Authorization: Bearer** header obtained from our OAuth 2.0 token endpoint. JSON in, JSON out. Sandbox and production differ only in base URL.

| Method   | Endpoint                                 | Purpose                              | Typical request fields                                  | Typical response highlights                |
|----------|------------------------------------------|--------------------------------------|--------------------------------------------------------|--------------------------------------------|
| **GET**  | `/v2/manufacturers`                      | List supported manufacturers         | `GadgetType` (optional)                                | `id`, `name`                               |
| **GET**  | `/v2/models`                             | List models for a manufacturer       | `ManufacturerId`, `GadgetType`                         | `id`, `make`, `model`, `memoryOptions`    |
| **GET**  | `/v2/getQuote`                           | Price a device (get quote)           | `productId`, `memoryInstalled`, `purchasePrice`        | `monthlyPremium`, `annualPremium`, `excess`|
| **POST** | `/v2/customer`                           | Register a customer                  | Customer details (name, contact, address, etc.)        | `id`                                        |
| **GET**  | `/v2/customer/{customerId}`              | Find customer by ID                  | `customerId`                                           | Customer details                            |
| **GET**  | `/v2/customer/find/email/{email}`        | Find customer by email               | `email`                                                | Array of matching customers                |
| **GET**  | `/v2/customer/find/mobile/{mobile}`      | Find customer by mobile              | `mobile`                                               | Array of matching customers                |
| **GET**  | `/v2/openBasket`                         | Create a basket for policies         | `customerId`, `premiumPeriod`, `includeLossCover`      | `basketId`                                 |
| **GET**  | `/v2/insureGadget`                       | Add single gadget to basket          | `basketId`, `productId`, `purchasePrice`, etc.         | Updated basket details                     |
| **GET**  | `/v2/insureGadgets`                      | Add multiple gadgets to basket       | `basketId`                                             | Updated basket details                     |
| **GET**  | `/v2/confirm`                            | Confirm and finalise the basket      | `basketId`                                             | Policy references, payment info            |
| **POST** | `/v2/payByDirectDebit`                   | Process payment by direct debit      | `basketId`, `directDebit` details                      | Payment confirmation                       |
| **GET**  | `/v2/addLossCover`                       | Add loss cover to basket             | `basketId`                                             | Updated basket details                     |
| **GET**  | `/v2/removeLossCover`                    | Remove loss cover from basket        | `basketId`                                             | Updated basket details                     |
| **GET**  | `/v2/removePolicy`                       | Remove policy from basket            | `basketId`, `policyId`                                 | Updated basket details                     |
| **GET**  | `/v2/cancelBasket`                       | Cancel entire basket                 | `basketId`                                             | Cancellation confirmation                  |

*Example — retrieve a quote:*

```bash
curl -X GET "https://sandbox.api.mygadgetumbrella.com/sbapi/v2/getQuote?productId=123&memoryInstalled=128GB&purchasePrice=999.99" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

The response returns available premiums, ready to present to the customer.

## 7. New V2 Features
The updated API includes several enhancements:

- **Enhanced Customer Management:** Find customers by email, mobile number, or external ID
- **Multiple Gadget Support:** Add multiple devices to a single policy basket
- **Loss Cover Management:** Dynamically add or remove loss cover options
- **Policy Management:** Remove individual policies from baskets before confirmation
- **Basket Management:** Cancel entire baskets with proper cleanup
- **Improved Error Handling:** More detailed error messages and response codes
- **Better Premium Calculation:** Enhanced quote system with detailed breakdowns

## 8. Built for busy retailers and repairers
- **Simple payloads:** Clean JSON objects with clear validation rules, making front‑end or middleware mapping straightforward.
- **Scalable cloud infrastructure:** 99.9% uptime, tight SLA, and ISO‑27001‑accredited hosting.
- **Security first:** OAuth 2.0 bearer tokens, IP whitelisting on request, and TLS 1.3 as standard.
- **Environment flexibility:** Easy switching between sandbox and production with separate credentials.

## 9. Getting started
- **Create sandbox credentials** in minutes and experiment with the interactive Swagger playground.
- **Configure your environment** in the plugin settings (sandbox or production).
- **Use our Postman collection,** examples, and self‑service developer portal to test live quotes.
- **Move to production** when ready with a simple environment toggle and production credentials.

## 10. Plugin Configuration
The WordPress plugin provides a simple interface for:
- **Environment Selection:** Toggle between sandbox and production
- **Credential Management:** Separate Client ID and Secret for each environment
- **Test Interface:** Built-in test flow using the `[gadget_insurance_sales]` shortcode
- **API Testing:** Admin panel for testing individual endpoints

## 11. Next steps
If you would like to explore partnership opportunities, see a demo, or start a pilot, we would love to talk. Please contact our Business Integration team at **[api@mygadgetumbrella.co.uk](mailto:api@mygadgetumbrella.co.uk)** or call **+44 (0)20 1234 5678**.

Together, we can give your customers peace of mind where and when they need it most.
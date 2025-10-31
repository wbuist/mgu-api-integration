=== MGU API Integration ===
Contributors: wbuist
Tags: insurance, api, gadgets, quotes, mgu
Requires at least: 5.8
Tested up to: 6.6
Requires PHP: 7.4
Stable tag: 1.0.2
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Integrates WordPress with the MGU API for a multi-gadget insurance flow: quoting, basket, and policy purchase.

== Description ==

This plugin connects your WordPress site to the MGU API, enabling users to:

- Get quotes for devices (gadgets)
- Add multiple gadgets to a single basket with automatic discounts
- Toggle loss cover and choose monthly or annual premiums
- Complete policy purchase with a clean, multi-step UI

Features include cached API tokens, robust AJAX handlers, externalized assets, and a production-ready UI under the `mgu-api-insurance-flow`.

== Installation ==

1. Upload the ZIP via Plugins → Add New → Upload Plugin
2. Activate the plugin
3. Add the shortcode `[mgu_api_test_flow]` to a page (uses the production `insurance-flow` under the hood)

== Frequently Asked Questions ==

= Does it support multiple gadgets with discounts? =
Yes. The basket supports multiple items and applies percentage discounts from the API.

= Are tokens cached? =
Yes. Access tokens are cached via WordPress transients and refreshed when required.

== Changelog ==

= 1.0.0 =
Initial production-ready structure with insurance flow, token caching, and multi-gadget basket.

== Upgrade Notice ==

= 1.0.0 =
Initial release.



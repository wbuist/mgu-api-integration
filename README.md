# MGU API Integration (WordPress Plugin)

Production-ready plugin that integrates with the MGU API to offer a multi-gadget insurance flow with discounts, loss cover, and a clean step-by-step UI.

## Getting Started

1. Install the release ZIP from GitHub Releases or "Download ZIP".
2. Activate the plugin in WordPress.
3. Add the shortcode `[mgu_api_test_flow]` to a page.

## Development

- Public assets: `public/`
- PHP classes: `includes/`
- Main plugin file: `mgu-api-integration.php`

### Versioning
- Update the `Version` header in `mgu-api-integration.php` and the `Stable tag` in `readme.txt`.
- Tag releases as `vX.Y.Z` to generate a ZIP via GitHub Actions.

### Release
- The GitHub Actions workflow packages the plugin into `mgu-api-integration.zip` with the correct folder structure.

## License

GPL-2.0-or-later

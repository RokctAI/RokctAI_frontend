# API Reference: platform

Source file: `app/config/platform.ts`

## Whitelisted API Endpoints

### `function getBrandingSync()`
Simple module-level cache to ensure branding is only fetched once per session.
This prevents flickering and redundant server calls.
let brandingPromise: Promise<any> | null = null;
Synchronously attempts to get branding from localStorage.
Used for initial state in client components to prevent "pop-in".

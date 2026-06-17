# API Reference: branding

Source file: `components/custom/branding.tsx`

## Whitelisted API Endpoints

### `function Branding({ showBadge = false, forceWhite = false, className }: { showBadge?: boolean; forceWhite?: boolean; className?: string; })`
A Client Component that displays the platform name with the country code.
It uses localStorage caching to ensure the branding appears instantly on refresh.
Uses a 'mounted' state to prevent hydration mismatches from localStorage access.

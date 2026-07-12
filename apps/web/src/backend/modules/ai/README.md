# AI module

Bounded context for AI-assisted features (image analysis, classification, etc.).

## Structure

- `domain/` — AI-specific types and result contracts.
- `infrastructure/` — future home for external AI gateway clients.
- `application/` — use cases such as `analyzeListingImage`.
- `tests/contract/` — contracts that verify the module's public surface.
- `contract/` — operational/contracts documentation.

## Public surface

```ts
import { analyzeListingImage } from '@/backend/modules/ai';
```

## Notes

The current implementation is a thin client-side wrapper around the `/api/gemini/identify` API route. Infrastructure extraction will follow as the AI surface grows.

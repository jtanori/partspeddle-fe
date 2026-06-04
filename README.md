<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/40c0ce99-de13-4aaf-8f47-cfe9dabf9c22

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Performance Testing

To run load tests against a staging/production environment, use the [k6](https://k6.io/) CLI:

1. Run baseline load test:
   `API_URL=https://staging-api.vintrack.com k6 run tests/performance/search-api-load.js`

2. Run burst test:
   `API_URL=https://staging-api.vintrack.com k6 run tests/performance/search-api-burst.js`

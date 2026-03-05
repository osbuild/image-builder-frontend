import { test as base } from '@playwright/test';

/**
 * Fixture that blocks analytics requests to reduce noise in test traces and prevent
 * consent overlays from loading. Amplitude is intentionally left unblocked for
 * analytics use. Blocks TrustArc, Red Hat smetrics, Segment, GA, and GTM.
 */
export const blockAnalyticsTest = base.extend({
  page: async ({ page }, runTest) => {
    await page.route(/consent\.trustarc\.com/, (route) => route.abort());
    await page.route(/\.trustarc\.com/, (route) => route.abort());
    await page.route(/\.truste-svc\.net/, (route) => route.abort());
    await page.route(/smetrics\.redhat\.com/, (route) => route.abort());
    await page.route(/segment\.io/, (route) => route.abort());
    await page.route(/google-analytics\.com/, (route) => route.abort());
    await page.route(/googletagmanager\.com/, (route) => route.abort());

    await runTest(page);
  },
});

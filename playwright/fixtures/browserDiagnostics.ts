import { test as base } from '@playwright/test';

// Attaches what the browser reported to any test that fails. A blank page or a
// control that never appears looks identical from the outside whether the cause
// was a JS exception, a failed module load, or a backend returning 502, and the
// assertion that times out can say nothing about which it was.
//
// Only failures produce an attachment, so a green run stays quiet.

// Capped so that a page erroring in a loop cannot produce an unreadable
// attachment. Warnings get their own smaller budget because the console shell
// emits them in bursts, and they would otherwise crowd out the errors.
const MAX_ERRORS = 150;
const MAX_WARNINGS = 30;

export type BrowserDiagnosticsFixture = {
  browserDiagnostics: void;
};

export const test = base.extend<BrowserDiagnosticsFixture>({
  browserDiagnostics: [
    async ({ page }, use, testInfo) => {
      const startedAt = Date.now();
      const entries: string[] = [];
      let errorCount = 0;
      let warningCount = 0;

      const record = (line: string, isWarning = false) => {
        if (isWarning && warningCount >= MAX_WARNINGS) return;
        if (!isWarning && errorCount >= MAX_ERRORS) return;
        if (isWarning) warningCount++;
        else errorCount++;
        const at = String(Date.now() - startedAt).padStart(6);
        entries.push(`+${at}ms  ${line}`);
      };

      page.on('pageerror', (error) =>
        record(`PAGEERROR   ${error.message.split('\n')[0]}`),
      );

      page.on('console', (message) => {
        const type = message.type();
        if (type !== 'error' && type !== 'warning') return;
        record(
          `CONSOLE ${type.toUpperCase().padEnd(7)} ${message.text().slice(0, 300)}`,
        );
      });

      page.on('requestfailed', (request) =>
        record(
          `REQ FAILED  ${request.method()} ${request.url().slice(0, 160)} ` +
            `- ${request.failure()?.errorText ?? 'unknown'}`,
        ),
      );

      page.on('response', (response) => {
        if (response.status() < 400) return;
        record(
          `HTTP ${response.status()}    ${response.request().method()} ` +
            `${response.url().slice(0, 160)}`,
        );
      });

      await use(undefined);

      if (testInfo.status === testInfo.expectedStatus) return;
      if (entries.length === 0) return;

      await testInfo.attach('browser-diagnostics.log', {
        body: entries.join('\n'),
        contentType: 'text/plain',
      });
    },
    { auto: true },
  ],
});

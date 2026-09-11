import { describe, expect, it } from 'vitest';

import { validateScript } from '../../validators';

const isFirstBootScriptValid = (script: string) =>
  validateScript(script).length === 0;

describe('first boot validation', () => {
  describe('valid scripts', () => {
    it('accepts an empty script', () => {
      expect(isFirstBootScriptValid('')).toBe(true);
    });

    it('accepts a bash script with a shebang', () => {
      expect(isFirstBootScriptValid('#!/bin/bash\necho hello')).toBe(true);
    });

    it('accepts a shell script with an env shebang', () => {
      expect(isFirstBootScriptValid('#!/usr/bin/env bash\necho hello')).toBe(
        true,
      );
    });

    it('accepts a Python script with a shebang', () => {
      expect(isFirstBootScriptValid('#!/usr/bin/python3\nprint("hello")')).toBe(
        true,
      );
    });

    it('accepts a script with a Windows line ending after the shebang', () => {
      expect(isFirstBootScriptValid('#!/bin/bash\r\necho hello')).toBe(true);
    });
  });

  describe('invalid scripts', () => {
    it('rejects a script without a shebang', () => {
      expect(isFirstBootScriptValid('echo hello')).toBe(false);
    });

    it('rejects an empty first line before the shebang', () => {
      expect(isFirstBootScriptValid('\n#!/bin/bash\necho hello')).toBe(false);
    });

    it('rejects a shebang that appears after the first line', () => {
      expect(isFirstBootScriptValid('echo hello\n#!/bin/bash')).toBe(false);
    });

    it('rejects a whitespace-prefixed shebang', () => {
      expect(isFirstBootScriptValid(' #!/bin/bash\necho hello')).toBe(false);
    });
  });
});

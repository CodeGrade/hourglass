import { Policy, policyPermits } from '@student/exams/show/types';
import { isCovered, isFullscreen, openFullscreen } from './helpers';

/**
 * Lock down the client browser.
 * @throws Error if lockdown fails
 */
export default async function lock(policies: readonly Policy[]): Promise<void> {
  if (policyPermits(policies, 'TOLERATE_WINDOWED')) return;

  try {
    await navigator.clipboard.writeText('');
  } catch (_eClipboard) {
    // clearing the clipboard via the proper API failed
    // so use the legacy API
    try {
      const input = document.createElement('input');
      document.append(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    } catch (_eExecCommand) {
      // We weren't able to clear the clipboard at all
      // probably should flag an anomaly, since the browser is weird
    }
  }

  const isChrome = navigator.userAgent.search('Chrome') >= 0;
  const isFirefox = navigator.userAgent.search('Firefox') >= 0;
  if (!isChrome && !isFirefox) {
    throw new Error('Please use Chrome, Chromium, or Firefox to continue.');
  }

  if (!isFullscreen()) {
    try {
      await openFullscreen();
    } catch (e) {
      throw new Error('Error entering fullscreen. Please manually fullscreen the window with F11.');
    }
  }

  if (!isCovered()) {
    throw new Error('On second monitor...');
  }

  if (!isFullscreen()) {
    throw new Error('Close the developer console to continue.');
  }
}

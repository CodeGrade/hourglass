import { Policy, policyPermits } from '@student/exams/show/types';
import {
  PolicyExemption,
} from '@student/exams/show/components/__generated__/ExamShowContents.graphql';
import { isFullscreen, openFullscreen } from './helpers';

/**
 * Lock down the client browser.
 * @throws Error if lockdown fails
 */
export default async function lock(
  policies: readonly Policy[],
  policyExemptions: readonly PolicyExemption[],
): Promise<void> {
  if (policyPermits(policies, 'TOLERATE_WINDOWED')
      || policyPermits(policyExemptions, 'TOLERATE_WINDOWED')) return;

  await clearClipboard();

  const isChrome = navigator.userAgent.search('Chrome') >= 0;
  const isFirefox = navigator.userAgent.search('Firefox') >= 0;
  if (!isChrome && !isFirefox) {
    throw new Error('Please use Chrome, Chromium, or Firefox to continue.');
  }

  let fullscreenInfo = isFullscreen();
  if (!fullscreenInfo.success) {
    try {
      await openFullscreen();
    } catch (e) {
      throw new Error('Error entering fullscreen. Please manually fullscreen the window with F11.');
    }
  }

  fullscreenInfo = isFullscreen();
  if (!fullscreenInfo.success) {
    throw new Error(`Cannot confirm fullscreen.\n${JSON.stringify(fullscreenInfo)}`);
  }
}
export async function clearClipboard() {
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
}

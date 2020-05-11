import { Policy, policyPermits } from '@hourglass/types';
import { isCovered, isFullscreen, openFullscreen } from './helpers';

/**
 * Lock down the client browser.
 * @throws Error if lockdown fails
 */
export default async function lock(policies: Policy[]): Promise<void> {
  if (policyPermits(policies, 'tolerate-windowed')) return;

  // browser detection
  // TODO: more robust browser detection, with version numbers:
  //   https://github.com/lancedikson/bowser
  // disallow mobile entirely!
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

  await navigator.clipboard.writeText('');
}

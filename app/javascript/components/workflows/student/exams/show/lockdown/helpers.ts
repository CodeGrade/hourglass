import { sleep } from '@hourglass/common/helpers';

export function isCovered(): boolean {
  return window.screenLeft === 0 && window.screenTop === 0;
}

export function isFullscreen(): boolean {
  const maximized = window.outerHeight >= window.screen.height;
  const fullheight = window.innerHeight >= window.outerHeight;
  const fullWidth = window.innerWidth >= window.outerWidth;
  return maximized && fullheight && fullWidth;
}

export async function openFullscreen(): Promise<void> {
  await document.documentElement.requestFullscreen();
  return sleep(200);
}

export function isFullscreen(): boolean {
  const maximized = window.outerHeight === window.screen.height;
  const fullheight = window.innerHeight === window.outerHeight;
  const fullWidth = window.innerWidth === window.outerWidth;
  const covered = window.screenLeft === 0 && window.screenTop === 0;
  return maximized && fullheight && fullWidth && covered;
}

export async function openFullscreen(): Promise<void> {
  // eslint-disable-next-line
  const elem = document.documentElement as any;
  if (elem.mozRequestFullScreen) { // Firefox
    return elem.mozRequestFullScreen();
  }
  if (elem.webkitRequestFullscreen) { // Chrome, Safari and Opera
    return elem.webkitRequestFullscreen();
  }
  if (elem.msRequestFullscreen) { // IE/Edge
    return elem.msRequestFullscreen();
  }
  return document.documentElement.requestFullscreen();
}

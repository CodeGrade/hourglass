export function isFullscreen() {
  const maximized = window.outerHeight == screen.height;
  const fullheight = window.innerHeight == window.outerHeight;
  const fullWidth = window.innerWidth == window.outerWidth;
  const covered = window.screenLeft == 0 && window.screenTop == 0;
  return maximized && fullheight && fullWidth && covered;
}

export async function openFullscreen() {
  const elem = document.documentElement as any;
  if (elem.requestFullscreen) {
    return elem.requestFullscreen();
  } if (elem.mozRequestFullScreen) { // Firefox
    return elem.mozRequestFullScreen();
  } if (elem.webkitRequestFullscreen) { // Chrome, Safari and Opera
    return elem.webkitRequestFullscreen();
  } if (elem.msRequestFullscreen) { // IE/Edge
    return elem.msRequestFullscreen();
  }
}

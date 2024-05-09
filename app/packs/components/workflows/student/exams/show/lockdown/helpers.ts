type FullscreenInfo = {
  ua: string,
  platform: string,
  zoomLevel: number,
  success: boolean,
  screenLeft: number,
  screenTop: number,
  outerHeight: number,
  innerHeight: number,
  screenHeight: number,
  screenAvailHeight: number,
  innerWidth: number,
  outerWidth: number,
  screenWidth: number,
  screenAvailWidth: number,
};
export function isFullscreen(): FullscreenInfo {
  const chromeLike = (navigator.userAgent.search('Chrome') >= 0);
  // Due to https://issues.chromium.org/issues/40820753,
  // Chrome does not report the available width or height in the right
  // units.  Assume a HiDPI screen (2x density) as default zoom level.
  const fudgeFactor = chromeLike ? (window.devicePixelRatio / 2) : 1;
  const effectiveAvailHeight = window.screen.availHeight / fudgeFactor;
  const effectiveAvailWidth = window.screen.availWidth / fudgeFactor;
  const fullheight = window.innerHeight + window.screenTop >= effectiveAvailHeight;
  const fullWidth = window.innerWidth + window.screenLeft >= effectiveAvailWidth;
  const upperLeft = window.screenLeft < 40 && window.screenTop < 40;
  return {
    ua: navigator.userAgent,
    platform: navigator.platform,
    zoomLevel: window.devicePixelRatio,
    success: fullheight && fullWidth && upperLeft,
    screenLeft: window.screenLeft,
    screenTop: window.screenTop,
    outerHeight: window.outerHeight,
    innerHeight: window.innerHeight,
    screenHeight: window.screen.height,
    screenAvailHeight: window.screen.availHeight,
    innerWidth: window.innerWidth,
    outerWidth: window.outerWidth,
    screenWidth: window.screen.width,
    screenAvailWidth: window.screen.availWidth,
  };
}
interface PromiseWithResolvers<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
}
function promiseWithResolvers<T>() : PromiseWithResolvers<T> {
  let resolve;
  let reject;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
async function sleep(n) {
  const { promise, resolve } = promiseWithResolvers();
  setTimeout(resolve, n);
  return promise;
}
async function resolveFullscreenChange() : Promise<true | Event> {
  const { promise, resolve } = promiseWithResolvers<true | Event>();
  const observer = new ResizeObserver((entries) => {
    entries.forEach((_entry) => {
      requestAnimationFrame((_time1) => {
        requestAnimationFrame(async (_time2) => {
          await sleep(2000);
          resolve(true);
          observer.disconnect();
        });
      });
    });
  });
  const fullscreenChange = () => {
    observer.observe(document.documentElement);
    document.documentElement.removeEventListener('fullscreenchange', fullscreenChange);
  };
  document.documentElement.addEventListener('fullscreenchange', fullscreenChange);
  const fullscreenError = (e) => {
    resolve(e);
    document.documentElement.removeEventListener('fullscreenerror', fullscreenError);
  };
  document.documentElement.addEventListener('fullscreenerror', fullscreenError);
  return promise;
}
export async function openFullscreen() {
  /*
   According to the spec
   (https://fullscreen.spec.whatwg.org/#ref-for-dom-element-requestfullscreen%E2%91%A0, step 7)
   the promise from requestFullscreen() is resolved in parallel with
   the event loop.  We previously had a delay of 200ms as a kludge for this,
   but it seems the better approach is to wait for the fullscreenchange event to fire
   However, browsers animate their fullscreenchange chrome transitions,
   which take an indeterminate amount of time.  So the measurements of window
   sizes might be inaccurate, depending on when during that parallel execution
   they actually occur.  The trick is to use a `requestPostAnimationFrame` callback,
   which doesn't actually exist yet, but which can be simulated by requesting two
   consecutive animation frames, as in
   https://stackoverflow.com/questions/56399913/wait-for-reflow-to-end-after-requestfullscreen
  */
  const promise = resolveFullscreenChange();
  document.documentElement.requestFullscreen();
  return promise;
}

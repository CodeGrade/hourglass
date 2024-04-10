type CoverageInfo = {
  success: boolean,
  screenLeft: number,
  screenTop: number,
};

export function isCovered(): CoverageInfo {
  return {
    screenLeft: window.screenLeft,
    screenTop: window.screenTop,
    success: window.screenLeft === 0 && window.screenTop === 0,
  };
}

type FullscreenInfo = {
  success: boolean,
  outerHeight: number,
  innerHeight: number,
  screenHeight: number,
  innerWidth: number,
  outerWidth: number,
  screenWidth: number,
};
export function isFullscreen(): FullscreenInfo {
  const maximized = window.outerHeight >= window.screen.height;
  const fullheight = window.innerHeight >= window.outerHeight;
  const fullWidth = window.innerWidth >= window.outerWidth;
  return {
    success: maximized && fullheight && fullWidth,
    outerHeight: window.outerHeight,
    innerHeight: window.innerHeight,
    screenHeight: window.screen.height,
    innerWidth: window.innerWidth,
    outerWidth: window.outerWidth,
    screenWidth: window.screen.width,
  };
}

export async function openFullscreen(): Promise<true | Event> {
  const { promise, resolve } = Promise.withResolvers<true | Event>();
  const observer = new ResizeObserver((entries) => {
    entries.forEach((_entry) => {
      requestAnimationFrame((_timestamp1) => {
        requestAnimationFrame((_timestamp2) => {
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
  const fullscreenError = (e: Event) => {
    resolve(e);
    document.documentElement.removeEventListener('fullscreenerror', fullscreenError);
  };
  document.documentElement.addEventListener('fullscreenerror', fullscreenError);
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
  document.documentElement.requestFullscreen();
  return promise;
}

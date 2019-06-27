# Anomaly Detection Progress

## Currently Detected
- if the developer console is open before the exam is started, `isFullScreen` is `false`
- if the developer console is opened during the exam, resize gets triggered
- window resizes trigger a fullscreen check. if `isFullScreen` returns `false`, an anomaly is recorded and the user is locked out of the exam.
- `mouseout` event detects when the mouse leaves the window, triggers an anomaly
  - in chrome, mousing over the "x" at the top center of the screen to leave fullscreen counts as a `mouseout`.
- `blur` event detects when the window loses focus from the user, triggers an anomaly
- `contextmenu` is sent when the user right-clicks in the window, and this is disabled with `preventDefault` and `stopPropagation`. no anomaly is recorded
- if a user attempts to save a snapshot and they already have a final submission or have some anomaly, they are locked out.

## To-do
- Chrome's "toggle device toolbar" mode (ctrl+shift+m when developer tools is open) is seen as "fullscreen" no matter what state the window is in.
  - the user could have other windows or the developer console open, but focus detection will still work if the cursor leaves the page

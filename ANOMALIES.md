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
- detect browser extensions
- use [`Object.freeze`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) to prevent tampering
- We should work to implement subresource integrity checks (i.e. `<script integrity="..." ...>` [link](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)) as well
  - rails has this built-in (`integrity: true`) on script tag helpers
- a CSP and script nonces and a CSP report URI that creates anomalies
- The final step of the initialization must be to ping the server and request authorization to proceed with the exam, e.g. by sending some secret value (that was textually part of the inline script) back to the server and getting a confirmation code
  - Until the server receives the authorization request, the exam UI should be disabled; if the server never receives such a request, it should reject any of that student's submissions (though it should still autosave intermediate results -- I'd love to know how the student managed to trigger that!)
- `MutationObservers` will let us check for attribute modification and page structure modification; if anything looks suspicious, flag the exam and block if from submission
- https://arxiv.org/pdf/1905.12951.pdf might have some reference points for us to keep track of

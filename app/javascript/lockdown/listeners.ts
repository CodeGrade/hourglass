const listeners: {
  event: string;
  handler: (e: any) => void;
}[] = [
  {
    event: 'mouseout',
    handler: (e) => {
      //if (e.toElement === null && e.relatedTarget === null) {
      //  anomalyDetected('mouseout', e);
      //}
    },
  },
  {
    event: 'resize',
    handler: (e) => {
      //if (!isFullscreen()) {
      //  anomalyDetected('left fullscreen', e);
      //}
    },
  },
  {
    event: 'blur',
    handler: (e) => {
      //anomalyDetected('window blurred', e);
    },
  },
  {
    event: 'contextmenu',
    handler: (e) => {
      // e.preventDefault();
      // e.stopPropagation();
      // console.log('user tried to open context menu');
      // // TODO: anomaly
    },
  },
];

export default listeners;

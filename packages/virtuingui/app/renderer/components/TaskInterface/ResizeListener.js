/*
  This global level function is used for the web viewer so that whenever the
*/
/* eslint-disable no-underscore-dangle */
/* eslint no-param-reassign: ["error", { "props": false }] */
const ResizeListener = (() => {
  const attachEvent = document.attachEvent;
  const requestFrame = (() => {
    const raf = window.requestAnimationFrame;
    return (fn) => raf(fn);
  })();

  const cancelFrame = (() => {
    const cancel = window.cancelAnimationFrame;
    return (id) => cancel(id);
  })();

  const resizeListener = (e) => {
    const win = e.target || e.srcElement;
    if (win.__resizeRAF__) cancelFrame(win.__resizeRAF__);
    win.__resizeRAF__ = requestFrame(() => {
      const trigger = win.__resizeTrigger__;
      trigger.__resizeListeners__.forEach((fn) => {
        fn.call(trigger, e);
      });
    });
  };

  function objectLoad() {
    this.contentDocument.defaultView.__resizeTrigger__ = this.__resizeElement__;
    this.contentDocument.defaultView.addEventListener('resize', resizeListener);
  }

  window.addResizeListener = (element, fn) => {
    if (!element.__resizeListeners__) {
      element.__resizeListeners__ = [];
      if (attachEvent) {
        element.__resizeTrigger__ = element;
        element.attachEvent('onresize', resizeListener);
      } else {
        if (getComputedStyle(element).position === 'static') element.style.position = 'relative';
        const obj = element.__resizeTrigger__ = document.createElement('object');
        obj.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
        obj.__resizeElement__ = element;
        obj.onload = objectLoad;
        obj.type = 'text/html';
        obj.data = 'about:blank';
        element.appendChild(obj);
      }
    }
    element.__resizeListeners__.push(fn);
  };

  window.removeResizeListener = (element, fn) => {
    element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
    if (!element.__resizeListeners__.length) {
      if (attachEvent) element.detachEvent('onresize', resizeListener);
      else {
        element.__resizeTrigger__.contentDocument.defaultView.removeEventListener('resize', resizeListener);
        element.__resizeTrigger__ = !element.removeChild(element.__resizeTrigger__);
      }
    }
  };
})();
/* eslint-enable no-underscore-dangle */
export default ResizeListener;

import('@dimforge/rapier2d-compat').then(RAPIER => {
  return RAPIER.init().then(() => {
    window.RAPIER = RAPIER;
    window.dispatchEvent(new CustomEvent('rapierLoaded'));
  });
}).catch(() => {
  window.dispatchEvent(new CustomEvent('rapierFailed'));
});
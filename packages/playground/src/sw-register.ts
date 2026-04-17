if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  // Track whether there's already a controlling SW (to distinguish first install from update)
  const hadController = !!navigator.serviceWorker.controller

  navigator.serviceWorker.register('/sw.js').catch((err) => {
    console.warn('SW registration failed:', err)
  })

  // When a new SW takes control, notify the page (skip first install)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) {
      window.dispatchEvent(new CustomEvent('sw-update'))
    }
  })
}

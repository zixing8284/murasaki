if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  // Track whether there's already a controlling SW (to distinguish first install from update)
  const hadController = !!navigator.serviceWorker.controller

  // Resolve `sw.js` against Vite's runtime `base` so the worker registers
  // under the same scope as the deployed app (e.g. `/murasaki/` on Pages).
  const swUrl = `${import.meta.env.BASE_URL}sw.js`

  navigator.serviceWorker.register(swUrl).catch((err) => {
    console.warn('SW registration failed:', err)
  })

  // When a new SW takes control, notify the page (skip first install)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) {
      window.dispatchEvent(new CustomEvent('sw-update'))
    }
  })
}

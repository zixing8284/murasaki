import type { HTMLAttributeReferrerPolicy } from 'react'

export const IFRAME_CONFIG = {
  referrerPolicy: 'no-referrer' as HTMLAttributeReferrerPolicy,
  sandbox:
    'allow-downloads allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts',
}

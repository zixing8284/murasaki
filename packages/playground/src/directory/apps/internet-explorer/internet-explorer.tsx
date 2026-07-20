import type { ReactElement } from 'react'
import type { ProcessComponentProps } from '../../../contexts/process/types'
import { useState } from 'react'
import { Ie2Chrome } from '../../../shell/window/ie2-chrome'
import { IeFavoritesSidebar } from './ie-favorites-sidebar'

const HOME_URL = 'https://zixing8284.github.io/'

export function InternetExplorer({ windowId }: ProcessComponentProps): ReactElement {
  const [showFavorites, setShowFavorites] = useState(false)

  return (
    <Ie2Chrome
      windowId={windowId}
      src={HOME_URL}
      onFavoritesClick={() => setShowFavorites(prev => !prev)}
      renderSidebar={showFavorites
        ? navigate => (
          <IeFavoritesSidebar
            onNavigate={navigate}
            onClose={() => setShowFavorites(false)}
          />
        )
        : undefined}
    />
  )
}

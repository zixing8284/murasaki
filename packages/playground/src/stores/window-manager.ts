import { create } from 'zustand'
import { useShallow } from 'zustand/shallow'

export interface WindowRecord {
  id: string
  appId: string
  title: string
  icon: string
  minimized: boolean
  maximized: boolean
}

export interface WindowManagerState {
  windows: Record<string, WindowRecord>
  zStack: string[]
  activeId: string | null
  container: HTMLElement | null
  windowContainers: Record<string, HTMLElement | null>
}

export interface WindowManagerActions {
  openWindow: (config: Omit<WindowRecord, 'minimized' | 'maximized'>) => void
  closeWindow: (id: string) => void
  activateWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  toggleMaximize: (id: string) => void
  restoreWindow: (id: string) => void
  deactivateAll: () => void
  handleTaskbarClick: (id: string) => void
  setContainer: (container: HTMLElement | null) => void
  setWindowContainer: (windowId: string, container: HTMLElement | null) => void
}

const initialState: WindowManagerState = {
  windows: {},
  zStack: [],
  activeId: null,
  container: null,
  windowContainers: {},
}

export const useWindowManager = create<WindowManagerState & WindowManagerActions>((set, get) => ({
  ...initialState,

  openWindow: (config) => {
    set((state) => {
      if (state.windows[config.id])
        return state // already exists
      const record: WindowRecord = { ...config, minimized: false, maximized: false }
      return {
        windows: { ...state.windows, [config.id]: record },
        zStack: [...state.zStack, config.id],
        activeId: config.id,
      }
    })
  },

  closeWindow: (id) => {
    set((state) => {
      const { [id]: _, ...rest } = state.windows
      const newZStack = state.zStack.filter(wid => wid !== id)
      let newActiveId = state.activeId
      if (state.activeId === id) {
        // pick top-most non-minimized
        for (let i = newZStack.length - 1; i >= 0; i--) {
          const wid = newZStack[i]
          if (!rest[wid]?.minimized) {
            newActiveId = wid
            break
          }
        }
        if (newActiveId === id)
          newActiveId = null
      }
      return {
        windows: rest,
        zStack: newZStack,
        activeId: newActiveId,
      }
    })
  },

  activateWindow: (id) => {
    set((state) => {
      if (!state.windows[id])
        return state
      const zStack = state.zStack.filter(wid => wid !== id)
      return {
        zStack: [...zStack, id],
        activeId: id,
        windows: {
          ...state.windows,
          [id]: { ...state.windows[id], minimized: false },
        },
      }
    })
  },

  minimizeWindow: (id) => {
    set((state) => {
      if (!state.windows[id])
        return state
      const windows = {
        ...state.windows,
        [id]: { ...state.windows[id], minimized: true },
      }
      let newActiveId = state.activeId
      if (state.activeId === id) {
        // pick top-most non-minimized
        for (let i = state.zStack.length - 1; i >= 0; i--) {
          const wid = state.zStack[i]
          if (!windows[wid]?.minimized) {
            newActiveId = wid
            break
          }
        }
        if (newActiveId === id)
          newActiveId = null
      }
      return {
        windows,
        activeId: newActiveId,
      }
    })
  },

  toggleMaximize: (id) => {
    set((state) => {
      if (!state.windows[id])
        return state
      return {
        windows: {
          ...state.windows,
          [id]: {
            ...state.windows[id],
            maximized: !state.windows[id].maximized,
          },
        },
      }
    })
  },

  restoreWindow: (id) => {
    set((state) => {
      if (!state.windows[id])
        return state
      const zStack = state.zStack.filter(wid => wid !== id)
      return {
        windows: {
          ...state.windows,
          [id]: { ...state.windows[id], minimized: false },
        },
        zStack: [...zStack, id],
        activeId: id,
      }
    })
  },

  deactivateAll: () => {
    set(() => ({ activeId: null }))
  },

  handleTaskbarClick: (id) => {
    const { windows, activeId, restoreWindow, minimizeWindow, activateWindow } = get()
    const win = windows[id]
    if (!win)
      return
    if (win.minimized) {
      restoreWindow(id)
    }
    else if (activeId === id) {
      minimizeWindow(id)
    }
    else {
      activateWindow(id)
    }
  },

  setContainer: (container) => {
    set({ container })
  },

  setWindowContainer: (windowId, container) => {
    set(state => ({
      windowContainers: { ...state.windowContainers, [windowId]: container },
    }))
  },
}))

// Selectors
export const useWindowList = (): WindowRecord[] => useWindowManager(useShallow(s => Object.values(s.windows)))

export function useWindow(id: string): { record: WindowRecord, isActive: boolean, zIndex: number } | null {
  return useWindowManager(useShallow((s) => {
    const record = s.windows[id]
    return record
      ? {
          record,
          isActive: s.activeId === id,
          zIndex: s.zStack.indexOf(id) + 1,
        }
      : null
  }))
}

export function useWindowActions(): WindowManagerActions {
  return useWindowManager(useShallow(s => ({
    openWindow: s.openWindow,
    closeWindow: s.closeWindow,
    activateWindow: s.activateWindow,
    minimizeWindow: s.minimizeWindow,
    toggleMaximize: s.toggleMaximize,
    restoreWindow: s.restoreWindow,
    deactivateAll: s.deactivateAll,
    handleTaskbarClick: s.handleTaskbarClick,
    setContainer: s.setContainer,
    setWindowContainer: s.setWindowContainer,
  })))
}

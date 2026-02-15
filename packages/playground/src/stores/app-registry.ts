export interface AppWindowProps {
  windowId: string
  container: HTMLElement | null
}

export interface AppDefinition {
  appId: string
  component: React.ComponentType<AppWindowProps>
  defaultTitle: string
  defaultIcon: string
}

// Lazy registry — components are imported where used to avoid circular deps.
// This file only defines the static metadata; component references are assigned
// at runtime via registerApp().
const registry = new Map<string, AppDefinition>()

export function registerApp(def: AppDefinition): void {
  registry.set(def.appId, def)
}

export function getAppDefinition(appId: string): AppDefinition | undefined {
  return registry.get(appId)
}

export function getAllApps(): AppDefinition[] {
  return Array.from(registry.values())
}

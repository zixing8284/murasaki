export const contextMenuBasicSource = String.raw`import { ContextMenu, ContextMenuContent, ContextMenuTrigger, Menu, MenuItem, MenuSeparator } from 'murasaki-react98'

export function ContextMenuBasicExample(): React.ReactElement {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="flex h-28 w-72 items-center justify-center bg-(--window) text-(--window-text) shadow-(--shadow-border-field)">
          Right click this field
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <Menu className="w-44">
          <MenuItem>Open</MenuItem>
          <MenuItem selected>Rename</MenuItem>
          <MenuSeparator />
          <MenuItem disabled>Paste</MenuItem>
          <MenuItem>Properties</MenuItem>
        </Menu>
      </ContextMenuContent>
    </ContextMenu>
  )
}`

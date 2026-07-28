# Win98 Component Patterns Reference

Component catalog for `@murasaki-io/react98`. All components live under `packages/ui/src/components/`.

## Styling Conventions

- **CVA** (class-variance-authority) defines variant styles
- **`cn()`** merges classes and injects `text-[11px]` base
- **`cnPure()`** skips the base font injection (for layer roots, context menus)
- **CSS variable-backed utilities** for all colors: `bg-(--button-face)`, `text-(--window-text)`
- **Data attributes** expose state: `data-active`, `data-checked`, `data-disabled`, `data-open`, `data-selected`, `data-expanded`
- **Controlled/uncontrolled**: `value`/`defaultValue`/`onValueChange` pattern

## Component Catalog

### Button

**Purpose:** Push button with raised/sunken bevel states.

```tsx
import { Button } from '@murasaki-io/react98'

<Button>Click me</Button>
<Button primary>OK</Button>
<Button active>Pressed</Button>
<Button disabled>Disabled</Button>
```

**Variants:** `primary` (raisedPrimary bevel), `active` (sunken bevel)
**Styling:** `shadow-(--shadow-raised)` resting, `shadow-(--shadow-sunken)` when active, `shadow-(--shadow-raised-primary)` when primary

---

### Checkbox

**Purpose:** Checkbox input with hidden native + custom visual.

```tsx
import { Checkbox } from '@murasaki-io/react98'

<Checkbox onCheckedChange={(checked) => ...}>Enable feature</Checkbox>
<Checkbox checked={true}>Controlled</Checkbox>
<Checkbox disabled>Disabled</Checkbox>
```

**Props:** `checked`, `defaultChecked`, `onCheckedChange`, `disabled`, `children` (label)
**Styling:** Hidden native `<input>` with custom SVG checkmark in a sunken box. Focus ring on the label via sibling selector.

---

### OptionButton (Radio)

**Purpose:** Radio button group.

```tsx
import { OptionGroup, OptionButton } from '@murasaki-io/react98'

<OptionGroup value={selected} onValueChange={setSelected}>
  <OptionButton value="a">Option A</OptionButton>
  <OptionButton value="b">Option B</OptionButton>
</OptionGroup>
```

**Props (OptionGroup):** `value`, `defaultValue`, `onValueChange`, `name`, `disabled`
**Props (OptionButton):** `value`, `disabled`, `children`

---

### TextBox

**Purpose:** Single-line input or multiline textarea.

```tsx
import { TextBox } from '@murasaki-io/react98'

<TextBox placeholder="Enter text" />
<TextBox multiline rows={4} />
```

**Variants:** `multiline` (renders `<textarea>` instead of `<input>`)
**Styling:** `shadow-(--shadow-border-field)` for the sunken border, `bg-(--window)`, `pl-2` for breathing room

---

### NumberBox

**Purpose:** Numeric input with up/down spinner buttons.

```tsx
import { NumberBox } from '@murasaki-io/react98'

<NumberBox min={0} max={100} step={1} value={count} onValueChange={setCount} />
```

---

### Select

**Purpose:** Custom select dropdown with listbox, or native fallback.

```tsx
import { Select, SelectTrigger, SelectContent, SelectItem } from '@murasaki-io/react98'

<Select value={val} onValueChange={setVal}>
  <SelectTrigger />
  <SelectContent>
    <SelectItem value="a">Option A</SelectItem>
    <SelectItem value="b">Option B</SelectItem>
  </SelectContent>
</Select>
```

Also: `SelectNative` for a plain `<select>` element with Win98 styling.

---

### Slider

**Purpose:** Range input with custom track/thumb rendering.

```tsx
import { Slider } from '@murasaki-io/react98'

<Slider min={0} max={100} value={val} onValueChange={setVal} />
<Slider vertical className="h-20" />
```

**Variants:** `vertical`, `boxIndicator` (square thumb), `tickMarks`

---

### Window

**Purpose:** Full windowing system — frame, title bar, buttons, menu bar, status bar, resize grip, overlay, portal.

```tsx
import {
  WindowFrame, WindowTitleBar, WindowTitleBarText,
  WindowButtons, WindowMenuBar, WindowMenuBarTrigger, WindowMenuBarContent,
  WindowContent, WindowStatusBar, WindowStatusBarField,
  WindowResizeGrip, WindowOverlay, WindowPortal,
} from '@murasaki-io/react98'
```

**Key behaviors:**
- `WindowFrame`: positioned absolutely or fixed, `invisible` when minimized
- `WindowTitleBar`: gradient background, double-click toggles maximize
- `WindowButtons`: Close, Minimize, Maximize/Restore, Help
- `WindowMenuBar`: horizontal triggers with dropdown content, ArrowLeft/Right nav
- `WindowPortal`: portals content to layer target

**Hooks:** `useDraggable` (CSS transform), `useResizable` (inline width/height), both with 3px threshold

---

### ContextMenu

**Purpose:** Right-click popup menu with pointer-anchored positioning.

```tsx
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, MenuItem, MenuSeparator } from '@murasaki-io/react98'

<ContextMenu>
  <ContextMenuTrigger asChild>
    <div>Right-click area</div>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <MenuItem onSelect={...}>Action</MenuItem>
    <MenuSeparator />
    <MenuItem onSelect={...} disabled>Disabled</MenuItem>
  </ContextMenuContent>
</ContextMenu>
```

Uses `useFocusScope` for Tab trapping and `useDismissable` for Escape/outside-click.

---

### Menu

**Purpose:** Menu bar and dropdown menus with submenus.

```tsx
import { Menu, MenuTrigger, MenuContent, MenuItem, MenuSub, MenuSubTrigger, MenuSubContent, MenuSeparator } from '@murasaki-io/react98'

<Menu>
  <MenuTrigger>File</MenuTrigger>
  <MenuContent>
    <MenuItem>New</MenuItem>
    <MenuSub>
      <MenuSubTrigger>Recent</MenuSubTrigger>
      <MenuSubContent>
        <MenuItem>file1.txt</MenuItem>
      </MenuSubContent>
    </MenuSub>
    <MenuSeparator />
    <MenuItem>Exit</MenuItem>
  </MenuContent>
</Menu>
```

**Navigation:** Arrow keys via `useRovingFocus`, typeahead via `useTypeahead`, submenu hover delay coordination.

---

### FieldPanel

**Purpose:** Sunken container for text areas, list boxes, and scrollable content.

```tsx
import { FieldPanel } from '@murasaki-io/react98'

<FieldPanel variant="sunken" className="h-32">
  <p>Scrollable content</p>
</FieldPanel>
```

**Variants:** `sunken` (default), `flat`
**Styling:** `shadow-(--shadow-border-field)`, built-in `ScrollArea`

---

### GroupBox

**Purpose:** Fieldset with etched border and legend label.

```tsx
import { GroupBox } from '@murasaki-io/react98'

<GroupBox label="Options">
  <Checkbox>Option 1</Checkbox>
  <Checkbox>Option 2</Checkbox>
</GroupBox>
```

---

### Divider

**Purpose:** Horizontal or vertical etched separator.

```tsx
import { Divider } from '@murasaki-io/react98'

<Divider />          {/* horizontal */}
<Divider vertical /> {/* vertical */}
```

Two `<div>` elements: one with `border-(--button-shadow)`, one with `border-(--button-hilight)`.

---

### ProgressIndicator

**Purpose:** Progress bar (smooth fill or segmented tile).

```tsx
import { ProgressIndicator } from '@murasaki-io/react98'

<ProgressIndicator value={65} />
<ProgressIndicator value={65} variant="tile" />
```

---

### ScrollArea

**Purpose:** Win98-style scrollbar overlay.

```tsx
import { ScrollArea } from '@murasaki-io/react98'

<ScrollArea className="h-40">
  <div>Tall content</div>
</ScrollArea>
```

Compound component pattern with `ScrollAreaViewport`, `ScrollAreaScrollbar`, `ScrollAreaThumb`, `ScrollAreaButton`.

---

### Table

**Purpose:** Table inside a sunken FieldPanel with highlighted rows.

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@murasaki-io/react98'

<Table>
  <TableHeader>
    <TableRow><TableHead>Name</TableHead></TableRow>
  </TableHeader>
  <TableBody>
    <TableRow selected><TableCell>item.txt</TableCell></TableRow>
  </TableBody>
</Table>
```

**Styling:** `TableHead` has raised bevel, `TableRow` has hover highlight with `--hot-tracking-color`.

---

### Tabs

**Purpose:** Tab strip with TabList/Tab/TabPanel.

```tsx
import { Tabs, TabList, Tab, TabPanel } from '@murasaki-io/react98'

<Tabs defaultValue="tab1">
  <TabList>
    <Tab value="tab1">General</Tab>
    <Tab value="tab2">Advanced</Tab>
  </TabList>
  <TabPanel value="tab1">Content 1</TabPanel>
  <TabPanel value="tab2">Content 2</TabPanel>
</Tabs>
```

---

### TreeView

**Purpose:** Collapsible tree using native `<details>`/`<summary>`.

```tsx
import { TreeView, TreeViewItem } from '@murasaki-io/react98'

<TreeView>
  <TreeViewItem label="Folder" defaultExpanded>
    <TreeViewItem label="File A" />
    <TreeViewItem label="File B" />
  </TreeViewItem>
</TreeView>
```

**Navigation:** ArrowRight expands / moves to child, ArrowLeft collapses / moves to parent. Uses `useRovingFocus` with `filterItem` to skip collapsed branches.

---

### Tooltip

**Purpose:** Delayed hover/focus tooltip with layer positioning.

```tsx
import { Tooltip, TooltipTrigger, TooltipContent } from '@murasaki-io/react98'

<Tooltip>
  <TooltipTrigger asChild>
    <Button>Hover me</Button>
  </TooltipTrigger>
  <TooltipContent>Tooltip text</TooltipContent>
</Tooltip>
```

---

### ThemeProvider

**Purpose:** React context for switching between 19 named themes.

```tsx
import { ThemeProvider } from '@murasaki-io/react98'

<ThemeProvider defaultTheme="windows-98">
  {children}
</ThemeProvider>
```

Manages `data-theme` attribute on target element with localStorage persistence.

---

### Layer

**Purpose:** Scoping portal target for layered popups.

```tsx
import { LayerProvider } from '@murasaki-io/react98'

<LayerProvider>
  {/* Popups inside here portal to this layer's target */}
</LayerProvider>
```

## Shared Primitives

Located in `packages/ui/src/primitives/`.

| Primitive | Purpose | Used by |
|-----------|---------|---------|
| `useRovingFocus` | Container-delegated arrow-key navigation, one tabIndex=0 item | Menu, Select, Tabs, TreeView, WindowMenuBar |
| `useFocusScope` | Tab/Shift-Tab trap, auto-focus first element, restore on deactivation | ContextMenu |
| `useDismissable` | Stack-based Escape/outside-click/blur dismissal | Select, Menu, ContextMenu, Tooltip, WindowMenuBar |
| `useTypeahead` | Character accumulation + match callback (500ms timeout) | Menu, Select |
| `useLayer` | Anchor-relative positioning with viewport collision detection | Select, Menu, ContextMenu, Tooltip, WindowMenuBar |
| `useCollection` | DOM-order item registry via ref callbacks | Select |

## Hooks

Located in `packages/ui/src/hooks/`.

| Hook | Purpose |
|------|---------|
| `useDraggable` | Move element via CSS `transform: translate()`, constrain to container, 3px threshold, `will-change: transform` during drag |
| `useResizable` | Resize via inline `width`/`height`, constrain to min/max + container, 3px threshold, sets body cursor during resize |

Both use a "latest-callback ref" pattern to keep callbacks current without recreating document-level event listeners mid-interaction.

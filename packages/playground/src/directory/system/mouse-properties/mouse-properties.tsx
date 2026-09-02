import type { ProcessComponentProps } from '../../../contexts/process/types'
import type { CursorSchemeId } from '../../../lib/cursor-scheme'
import { Button, GroupBox, ScrollArea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tab, TabList, TabPanel, Tabs } from '@murasaki-io/react98'
import { useState } from 'react'
import { useCursorScheme } from '../../../contexts/cursor-scheme'
import { useProcessActions } from '../../../contexts/process/hooks'
import { assetPath } from '../../../lib/asset-path'
import {
  CURSOR_SCHEME_IDS,
  CURSOR_SCHEMES,
  cursorPointerPath,
  DEFAULT_CURSOR_SCHEME_ID,
} from '../../../lib/cursor-scheme'

function PointerImage({ src, className }: { src: string, className?: string }): React.ReactElement {
  return (
    <img
      src={assetPath(src)}
      alt=""
      draggable={false}
      className={`pixelated ${className ?? ''}`}
    />
  )
}

export function MouseProperties({ windowId }: ProcessComponentProps): React.ReactElement {
  const { close } = useProcessActions()
  const { schemeId, setSchemeId } = useCursorScheme()

  const [draftId, setDraftId] = useState<CursorSchemeId>(schemeId)
  const [appliedId, setAppliedId] = useState<CursorSchemeId>(schemeId)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const scheme = CURSOR_SCHEMES[draftId]
  const hasPendingChanges = draftId !== appliedId

  const chooseScheme = (id: CursorSchemeId): void => {
    setDraftId(id)
    setSelectedIndex(0)
  }

  const handleApply = (): void => {
    setSchemeId(draftId)
    setAppliedId(draftId)
  }

  const handleOk = (): void => {
    if (hasPendingChanges)
      handleApply()
    close(windowId)
  }

  const handleCancel = (): void => {
    close(windowId)
  }

  const previewPointer = scheme.pointers[selectedIndex] ?? scheme.pointers[0]

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <Tabs defaultValue="pointers" className="flex min-h-0 w-full flex-1 flex-col">
        <TabList>
          <Tab value="buttons">Buttons</Tab>
          <Tab value="pointers">Pointers</Tab>
          <Tab value="motion">Motion</Tab>
        </TabList>

        <TabPanel value="buttons" className="flex min-h-0 flex-1 flex-col gap-3 p-3">
          <GroupBox label="Button configuration" className="px-3 pb-3 pt-2">
            <p className="text-(--button-text) leading-snug">
              Button configuration is not adjustable in this demo.
            </p>
          </GroupBox>
        </TabPanel>

        <TabPanel value="pointers" className="flex min-h-0 flex-1 flex-col gap-2 p-3">
          <GroupBox label="Scheme" className="px-3 pb-3 pt-2">
            <div className="flex items-start gap-3">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Select
                  name="cursor-scheme"
                  value={draftId}
                  onValueChange={value => chooseScheme(value as CursorSchemeId)}
                >
                  <SelectTrigger aria-label="Cursor scheme" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURSOR_SCHEME_IDS.map(id => (
                      <SelectItem key={id} value={id}>{CURSOR_SCHEMES[id].name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-(--grouped-button-spacing)">
                  <Button disabled className="flex-1">Save As...</Button>
                  <Button disabled className="flex-1">Delete</Button>
                </div>
              </div>
              <div className="flex size-12 shrink-0 items-center justify-center bg-(--window) shadow-(--shadow-border-field)">
                <PointerImage src={cursorPointerPath(scheme, previewPointer)} />
              </div>
            </div>
          </GroupBox>

          <div className="min-h-0 flex-1 bg-(--window) p-0.5 shadow-(--shadow-border-field)">
            <ScrollArea className="h-full w-full">
              <ul className="m-0 list-none p-0">
                {scheme.pointers.map((pointer, index) => {
                  const selected = index === selectedIndex
                  return (
                    <li key={pointer.label}>
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setSelectedIndex(index)}
                        className={`flex w-full min-h-11 items-center gap-4 px-3 py-2 text-left ${
                          selected ? 'bg-(--hilight) text-(--hilight-text)' : 'text-(--window-text)'
                        }`}
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center">
                          <PointerImage src={cursorPointerPath(scheme, pointer)} />
                        </span>
                        <span className="whitespace-nowrap">{pointer.label}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </ScrollArea>
          </div>

          <div className="flex justify-end gap-(--grouped-button-spacing)">
            <Button
              onClick={() => chooseScheme(DEFAULT_CURSOR_SCHEME_ID)}
              disabled={draftId === DEFAULT_CURSOR_SCHEME_ID}
              className="min-w-20"
            >
              Use Default
            </Button>
            <Button disabled className="min-w-20">Browse...</Button>
          </div>
        </TabPanel>

        <TabPanel value="motion" className="flex min-h-0 flex-1 flex-col gap-3 p-3">
          <GroupBox label="Pointer speed" className="px-3 pb-3 pt-2">
            <p className="text-(--button-text) leading-snug">
              Pointer speed and trails are not adjustable in this demo.
            </p>
          </GroupBox>
        </TabPanel>
      </Tabs>

      <div className="flex justify-end gap-(--grouped-button-spacing)">
        <Button onClick={handleOk} className="min-w-18.75">OK</Button>
        <Button onClick={handleCancel} className="min-w-18.75">Cancel</Button>
        <Button onClick={handleApply} disabled={!hasPendingChanges} className="min-w-18.75">Apply</Button>
      </div>
    </div>
  )
}

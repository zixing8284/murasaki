import type { CrtTuningSettings } from '../../../hooks/use-crt-tuning'
import { Button, Checkbox, Slider, TabPanel } from '@murasaki-io/react98'
import { areCrtTuningSettingsEqual } from '../../../hooks/use-crt-tuning'

const CRT_PRESETS = {
  soft: {
    label: 'Soft CRT',
    settings: {
      scanlineOpacity: 0.18,
      jitterAmount: 0.08,
      rollDuration: 24,
      rollOpacity: 0.04,
    },
  },
  arcade: {
    label: 'Arcade CRT',
    settings: {
      scanlineOpacity: 0.24,
      jitterAmount: 0.28,
      rollDuration: 18,
      rollOpacity: 0.08,
    },
  },
  heavy: {
    label: 'Heavy CRT',
    settings: {
      scanlineOpacity: 0.4,
      jitterAmount: 1.1,
      rollDuration: 12,
      rollOpacity: 0.16,
    },
  },
} as const

interface AppearanceTabProps {
  currentMonitorFrame: boolean
  onMonitorFrameChange: (value: boolean) => void
  currentCrtEnabled: boolean
  onCrtEnabledChange: (value: boolean) => void
  currentCrtTuning: CrtTuningSettings
  onCrtTuningChange: (value: CrtTuningSettings) => void
  currentGradientEnabled: boolean
  onGradientEnabledChange: (value: boolean) => void
}

export function AppearanceTab({
  currentMonitorFrame,
  onMonitorFrameChange,
  currentCrtEnabled,
  onCrtEnabledChange,
  currentCrtTuning,
  onCrtTuningChange,
  currentGradientEnabled,
  onGradientEnabledChange,
}: AppearanceTabProps): React.ReactElement {
  const crtTuningDisabled = !currentCrtEnabled
  const disabledTextClass = crtTuningDisabled
    ? 'text-(--gray-text) [text-shadow:1px_1px_0_var(--button-hilight)]'
    : 'text-(--button-text)'

  return (
    <TabPanel value="appearance" className="flex flex-col gap-3 p-3">
      <Checkbox
        checked={currentMonitorFrame}
        onCheckedChange={onMonitorFrameChange}
      >
        Show CRT monitor frame
      </Checkbox>

      <Checkbox
        checked={currentCrtEnabled}
        onCheckedChange={onCrtEnabledChange}
      >
        Enable CRT monitor effect
      </Checkbox>

      <div className="flex flex-col gap-2 p-2">
        <div className={disabledTextClass}>CRT tuning</div>

        <div className="flex flex-wrap items-center gap-1">
          <span className={`mr-1 ${disabledTextClass}`}>Presets:</span>
          {Object.values(CRT_PRESETS).map((preset) => {
            const active = areCrtTuningSettingsEqual(currentCrtTuning, preset.settings)
            return (
              <Button
                key={preset.label}
                className="min-w-20"
                disabled={crtTuningDisabled || active}
                onClick={() => onCrtTuningChange(preset.settings)}
              >
                {preset.label}
              </Button>
            )
          })}
        </div>

        <label className={`grid grid-cols-[7rem_1fr_auto] items-center gap-2 ${disabledTextClass}`}>
          <span>Scanlines</span>
          <Slider
            disabled={crtTuningDisabled}
            min={0}
            max={0.6}
            step={0.01}
            value={currentCrtTuning.scanlineOpacity}
            onValueChange={value => onCrtTuningChange({ ...currentCrtTuning, scanlineOpacity: value })}
          />
          <span className="w-8 text-right">{Math.round(currentCrtTuning.scanlineOpacity * 100)}</span>
        </label>

        <label className={`grid grid-cols-[7rem_1fr_auto] items-center gap-2 ${disabledTextClass}`}>
          <span>Jitter</span>
          <Slider
            disabled={crtTuningDisabled}
            min={0}
            max={2}
            step={0.02}
            value={currentCrtTuning.jitterAmount}
            onValueChange={value => onCrtTuningChange({ ...currentCrtTuning, jitterAmount: value })}
          />
          <span className="w-8 text-right">{currentCrtTuning.jitterAmount.toFixed(2)}</span>
        </label>

        <label className={`grid grid-cols-[7rem_1fr_auto] items-center gap-2 ${disabledTextClass}`}>
          <span>Roll (sec)</span>
          <Slider
            disabled={crtTuningDisabled}
            min={8}
            max={40}
            step={0.5}
            value={currentCrtTuning.rollDuration}
            onValueChange={value => onCrtTuningChange({ ...currentCrtTuning, rollDuration: value })}
          />
          <span className="w-8 text-right">{currentCrtTuning.rollDuration.toFixed(1)}</span>
        </label>

        <label className={`grid grid-cols-[7rem_1fr_auto] items-center gap-2 ${disabledTextClass}`}>
          <span>Roll fade</span>
          <Slider
            disabled={crtTuningDisabled}
            min={0}
            max={0.25}
            step={0.01}
            value={currentCrtTuning.rollOpacity}
            onValueChange={value => onCrtTuningChange({ ...currentCrtTuning, rollOpacity: value })}
          />
          <span className="w-8 text-right">{Math.round(currentCrtTuning.rollOpacity * 100)}</span>
        </label>
      </div>

      <Checkbox
        checked={currentGradientEnabled}
        onCheckedChange={onGradientEnabledChange}
      >
        Use gradient title bars
      </Checkbox>
    </TabPanel>
  )
}

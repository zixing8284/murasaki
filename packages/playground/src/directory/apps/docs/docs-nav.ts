import type { ComponentType } from 'react'
import { lazy } from 'react'

// Raw source imports for demo code display
import demoActiveButtonSource from '../../../content/button/demo-active.tsx?raw'
import demoBasicButtonSource from '../../../content/button/demo-basic.tsx?raw'
import demoBasicCheckboxSource from '../../../content/checkbox/demo-basic.tsx?raw'
import demoControlledCheckboxSource from '../../../content/checkbox/demo-controlled.tsx?raw'
import demoBasicDropdownSource from '../../../content/dropdown/demo-basic.tsx?raw'
import demoNativeDropdownSource from '../../../content/dropdown/demo-native.tsx?raw'
import demoBasicOptionButtonSource from '../../../content/option-button/demo-basic.tsx?raw'
import demoDisabledOptionButtonSource from '../../../content/option-button/demo-disabled.tsx?raw'
import demoBasicSliderSource from '../../../content/slider/demo-basic.tsx?raw'
import demoControlledSliderSource from '../../../content/slider/demo-controlled.tsx?raw'
import demoVerticalSliderSource from '../../../content/slider/demo-vertical.tsx?raw'
import demoBasicStatusBarSource from '../../../content/status-bar/demo-basic.tsx?raw'
import demoBasicTabsSource from '../../../content/tabs/demo-basic.tsx?raw'

export interface NavNode {
  id: string
  label: string
  type: 'component' | 'demo'
  component?: ComponentType
  source?: string
  children?: NavNode[]
}

// Lazy-loaded MDX docs
const ButtonDoc = lazy(() => import('../../../content/button/button.mdx'))
const CheckboxDoc = lazy(() => import('../../../content/checkbox/checkbox.mdx'))
const DropdownDoc = lazy(() => import('../../../content/dropdown/dropdown.mdx'))
const OptionButtonDoc = lazy(() => import('../../../content/option-button/option-button.mdx'))
const SliderDoc = lazy(() => import('../../../content/slider/slider.mdx'))
const StatusBarDoc = lazy(() => import('../../../content/status-bar/status-bar.mdx'))
const TabsDoc = lazy(() => import('../../../content/tabs/tabs.mdx'))

// Lazy-loaded demo components
const DemoBasicButton = lazy(() => import('../../../content/button/demo-basic'))
const DemoActiveButton = lazy(() => import('../../../content/button/demo-active'))
const DemoBasicCheckbox = lazy(() => import('../../../content/checkbox/demo-basic'))
const DemoControlledCheckbox = lazy(() => import('../../../content/checkbox/demo-controlled'))
const DemoBasicDropdown = lazy(() => import('../../../content/dropdown/demo-basic'))
const DemoNativeDropdown = lazy(() => import('../../../content/dropdown/demo-native'))
const DemoBasicOptionButton = lazy(() => import('../../../content/option-button/demo-basic'))
const DemoDisabledOptionButton = lazy(() => import('../../../content/option-button/demo-disabled'))
const DemoBasicSlider = lazy(() => import('../../../content/slider/demo-basic'))
const DemoControlledSlider = lazy(() => import('../../../content/slider/demo-controlled'))
const DemoVerticalSlider = lazy(() => import('../../../content/slider/demo-vertical'))
const DemoBasicStatusBar = lazy(() => import('../../../content/status-bar/demo-basic'))
const DemoBasicTabs = lazy(() => import('../../../content/tabs/demo-basic'))

export const docsNavTree: NavNode[] = [
  {
    id: 'button',
    label: 'Button',
    type: 'component',
    component: ButtonDoc,
    children: [
      {
        id: 'button-demo-basic',
        label: 'Basic',
        type: 'demo',
        component: DemoBasicButton,
        source: demoBasicButtonSource,
      },
      {
        id: 'button-demo-active',
        label: 'Active State',
        type: 'demo',
        component: DemoActiveButton,
        source: demoActiveButtonSource,
      },
    ],
  },
  {
    id: 'checkbox',
    label: 'Checkbox',
    type: 'component',
    component: CheckboxDoc,
    children: [
      {
        id: 'checkbox-demo-basic',
        label: 'Basic',
        type: 'demo',
        component: DemoBasicCheckbox,
        source: demoBasicCheckboxSource,
      },
      {
        id: 'checkbox-demo-controlled',
        label: 'Controlled',
        type: 'demo',
        component: DemoControlledCheckbox,
        source: demoControlledCheckboxSource,
      },
    ],
  },
  {
    id: 'dropdown',
    label: 'Dropdown',
    type: 'component',
    component: DropdownDoc,
    children: [
      {
        id: 'dropdown-demo-basic',
        label: 'Basic',
        type: 'demo',
        component: DemoBasicDropdown,
        source: demoBasicDropdownSource,
      },
      {
        id: 'dropdown-demo-native',
        label: 'Native',
        type: 'demo',
        component: DemoNativeDropdown,
        source: demoNativeDropdownSource,
      },
    ],
  },
  {
    id: 'option-button',
    label: 'Option Button',
    type: 'component',
    component: OptionButtonDoc,
    children: [
      {
        id: 'option-button-demo-basic',
        label: 'Basic',
        type: 'demo',
        component: DemoBasicOptionButton,
        source: demoBasicOptionButtonSource,
      },
      {
        id: 'option-button-demo-disabled',
        label: 'Disabled',
        type: 'demo',
        component: DemoDisabledOptionButton,
        source: demoDisabledOptionButtonSource,
      },
    ],
  },
  {
    id: 'slider',
    label: 'Slider',
    type: 'component',
    component: SliderDoc,
    children: [
      {
        id: 'slider-demo-basic',
        label: 'Basic',
        type: 'demo',
        component: DemoBasicSlider,
        source: demoBasicSliderSource,
      },
      {
        id: 'slider-demo-controlled',
        label: 'Controlled',
        type: 'demo',
        component: DemoControlledSlider,
        source: demoControlledSliderSource,
      },
      {
        id: 'slider-demo-vertical',
        label: 'Vertical',
        type: 'demo',
        component: DemoVerticalSlider,
        source: demoVerticalSliderSource,
      },
    ],
  },
  {
    id: 'status-bar',
    label: 'Status Bar',
    type: 'component',
    component: StatusBarDoc,
    children: [
      {
        id: 'status-bar-demo-basic',
        label: 'Basic',
        type: 'demo',
        component: DemoBasicStatusBar,
        source: demoBasicStatusBarSource,
      },
    ],
  },
  {
    id: 'tabs',
    label: 'Tabs',
    type: 'component',
    component: TabsDoc,
    children: [
      {
        id: 'tabs-demo-basic',
        label: 'Basic',
        type: 'demo',
        component: DemoBasicTabs,
        source: demoBasicTabsSource,
      },
    ],
  },
]

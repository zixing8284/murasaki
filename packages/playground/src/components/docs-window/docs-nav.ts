import type { ComponentType } from 'react'
import { lazy } from 'react'

// Raw source imports for demo code display
import demoActiveButtonSource from '../../docs/button/demo-active.tsx?raw'
import demoBasicButtonSource from '../../docs/button/demo-basic.tsx?raw'
import demoBasicSliderSource from '../../docs/slider/demo-basic.tsx?raw'
import demoControlledSliderSource from '../../docs/slider/demo-controlled.tsx?raw'
import demoVerticalSliderSource from '../../docs/slider/demo-vertical.tsx?raw'
import demoBasicTabsSource from '../../docs/tabs/demo-basic.tsx?raw'

export interface NavNode {
  id: string
  label: string
  type: 'component' | 'demo'
  component?: ComponentType
  source?: string
  children?: NavNode[]
}

// Lazy-loaded MDX docs
const ButtonDoc = lazy(() => import('../../docs/button/button.mdx'))
const SliderDoc = lazy(() => import('../../docs/slider/slider.mdx'))
const TabsDoc = lazy(() => import('../../docs/tabs/tabs.mdx'))

// Lazy-loaded demo components
const DemoBasicButton = lazy(() => import('../../docs/button/demo-basic'))
const DemoActiveButton = lazy(() => import('../../docs/button/demo-active'))
const DemoBasicSlider = lazy(() => import('../../docs/slider/demo-basic'))
const DemoControlledSlider = lazy(() => import('../../docs/slider/demo-controlled'))
const DemoVerticalSlider = lazy(() => import('../../docs/slider/demo-vertical'))
const DemoBasicTabs = lazy(() => import('../../docs/tabs/demo-basic'))

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

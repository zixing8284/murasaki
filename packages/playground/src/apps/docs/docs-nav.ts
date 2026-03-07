import type { ComponentType } from 'react'
import { lazy } from 'react'

// Raw source imports for demo code display
import demoActiveButtonSource from '../../content/button/demo-active.tsx?raw'
import demoBasicButtonSource from '../../content/button/demo-basic.tsx?raw'
import demoBasicSliderSource from '../../content/slider/demo-basic.tsx?raw'
import demoControlledSliderSource from '../../content/slider/demo-controlled.tsx?raw'
import demoVerticalSliderSource from '../../content/slider/demo-vertical.tsx?raw'
import demoBasicTabsSource from '../../content/tabs/demo-basic.tsx?raw'

export interface NavNode {
  id: string
  label: string
  type: 'component' | 'demo'
  component?: ComponentType
  source?: string
  children?: NavNode[]
}

// Lazy-loaded MDX docs
const ButtonDoc = lazy(() => import('../../content/button/button.mdx'))
const SliderDoc = lazy(() => import('../../content/slider/slider.mdx'))
const TabsDoc = lazy(() => import('../../content/tabs/tabs.mdx'))

// Lazy-loaded demo components
const DemoBasicButton = lazy(() => import('../../content/button/demo-basic'))
const DemoActiveButton = lazy(() => import('../../content/button/demo-active'))
const DemoBasicSlider = lazy(() => import('../../content/slider/demo-basic'))
const DemoControlledSlider = lazy(() => import('../../content/slider/demo-controlled'))
const DemoVerticalSlider = lazy(() => import('../../content/slider/demo-vertical'))
const DemoBasicTabs = lazy(() => import('../../content/tabs/demo-basic'))

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

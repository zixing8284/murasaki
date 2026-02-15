import { Tabs } from 'murasaki-react98'

export default function DemoBasicTabs(): React.ReactElement {
  return (
    <Tabs defaultValue="tab1" className="w-100">
      <Tabs.List>
        <Tabs.Tab value="tab1">General</Tabs.Tab>
        <Tabs.Tab value="tab2">Advanced</Tabs.Tab>
        <Tabs.Tab value="tab3">About</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="tab1">
        <p>General settings panel content.</p>
        <p>This is the first tab.</p>
      </Tabs.Panel>
      <Tabs.Panel value="tab2">
        <p>Advanced settings panel content.</p>
        <p>Configure advanced options here.</p>
      </Tabs.Panel>
      <Tabs.Panel value="tab3">
        <p>About this application.</p>
        <p>Version 1.0.0</p>
      </Tabs.Panel>
    </Tabs>
  )
}

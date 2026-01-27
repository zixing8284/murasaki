import { Tabs } from '../tabs'

export function BasicTabs(): React.ReactElement {
  return (
    <Tabs defaultValue="desktop" className="w-100">
      <Tabs.List>
        <Tabs.Tab value="desktop">Desktop</Tabs.Tab>
        <Tabs.Tab value="computer">My computer</Tabs.Tab>
        <Tabs.Tab value="panel">Control panel</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="desktop">
        <p>Desktop settings and wallpaper options.</p>
      </Tabs.Panel>
      <Tabs.Panel value="computer">
        <p>View drives and system resources.</p>
      </Tabs.Panel>
      <Tabs.Panel value="panel">
        <p>System configuration and preferences.</p>
      </Tabs.Panel>
    </Tabs>
  )
}

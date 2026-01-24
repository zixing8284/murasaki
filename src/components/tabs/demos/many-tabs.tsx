import { Tabs } from "../tabs";

export function ManyTabs() {
  return (
    <Tabs defaultValue="desktop" className="w-150">
      <Tabs.List>
        <Tabs.Tab value="desktop">Desktop</Tabs.Tab>
        <Tabs.Tab value="computer">My computer</Tabs.Tab>
        <Tabs.Tab value="panel">Control panel</Tabs.Tab>
        <Tabs.Tab value="devices">Devices manager</Tabs.Tab>
        <Tabs.Tab value="hardware">Hardware profiles</Tabs.Tab>
        <Tabs.Tab value="performance">Performance</Tabs.Tab>
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
      <Tabs.Panel value="devices">
        <p>Manage hardware devices and drivers.</p>
      </Tabs.Panel>
      <Tabs.Panel value="hardware">
        <p>Configure hardware profiles for different setups.</p>
      </Tabs.Panel>
      <Tabs.Panel value="performance">
        <p>System performance metrics and optimization.</p>
      </Tabs.Panel>
    </Tabs>
  );
}

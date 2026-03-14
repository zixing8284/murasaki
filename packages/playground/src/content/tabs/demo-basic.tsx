import { Tab, TabList, TabPanel, Tabs } from 'murasaki-react98'

export default function DemoBasicTabs(): React.ReactElement {
  return (
    <Tabs defaultValue="tab1" className="w-100">
      <TabList>
        <Tab value="tab1">General</Tab>
        <Tab value="tab2">Advanced</Tab>
        <Tab value="tab3">About</Tab>
      </TabList>
      <TabPanel value="tab1">
        <p>General settings panel content.</p>
        <p>This is the first tab.</p>
      </TabPanel>
      <TabPanel value="tab2">
        <p>Advanced settings panel content.</p>
        <p>Configure advanced options here.</p>
      </TabPanel>
      <TabPanel value="tab3">
        <p>About this application.</p>
        <p>Version 1.0.0</p>
      </TabPanel>
    </Tabs>
  )
}

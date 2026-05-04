'use client'

import { Tab, TabList, TabPanel, Tabs } from '@murasaki/react98'

export function TabsBasicDemo(): React.ReactElement {
  return (
    <Tabs defaultValue="general" keepMounted className="w-80">
      <TabList>
        <Tab value="general">General</Tab>
        <Tab value="advanced">Advanced</Tab>
        <Tab value="disabled" disabled>Disabled</Tab>
      </TabList>
      <TabPanel value="general" className="min-h-24">
        General settings appear in this panel.
      </TabPanel>
      <TabPanel value="advanced" className="min-h-24">
        Advanced settings stay mounted because `keepMounted` is enabled.
      </TabPanel>
      <TabPanel value="disabled" className="min-h-24">
        Disabled panel
      </TabPanel>
    </Tabs>
  )
}

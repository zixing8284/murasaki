import { useState } from "react";

import { Tabs } from "../tabs";

export function ControlledTabs() {
  const [activeTab, setActiveTab] = useState("tab1");

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm">
        Current tab: <strong>{activeTab}</strong>
      </p>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-100">
        <Tabs.List>
          <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
          <Tabs.Tab value="tab2">Tab 2</Tabs.Tab>
          <Tabs.Tab value="tab3">Tab 3</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="tab1">
          <p>Content for Tab 1</p>
        </Tabs.Panel>
        <Tabs.Panel value="tab2">
          <p>Content for Tab 2</p>
        </Tabs.Panel>
        <Tabs.Panel value="tab3">
          <p>Content for Tab 3</p>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}

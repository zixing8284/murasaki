import { Checkbox } from "@/components/checkbox/checkbox";

import { GroupBox } from "../group-box";

export function WithoutLabel(): React.ReactElement {
  return (
    <GroupBox>
      <div className="flex flex-col gap-2">
        <Checkbox name="option-a">Option A</Checkbox>
        <Checkbox name="option-b">Option B</Checkbox>
      </div>
    </GroupBox>
  );
}

import { Checkbox } from "../checkbox";

export function Group(): React.ReactElement {
  return (
    <div className="flex flex-col gap-2">
      <Checkbox name="demo-status">Show status bar</Checkbox>
      <Checkbox defaultChecked name="demo-toolbar">
        Show toolbar
      </Checkbox>
      <Checkbox name="demo-autosave">Enable auto-save</Checkbox>
    </div>
  );
}

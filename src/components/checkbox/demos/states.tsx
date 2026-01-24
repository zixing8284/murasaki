import { Checkbox } from "../checkbox";

export function States(): React.ReactElement {
  return (
    <div className="flex flex-col gap-2">
      <Checkbox name="demo-unchecked">Unchecked</Checkbox>
      <Checkbox defaultChecked name="demo-checked">
        Checked
      </Checkbox>
      <Checkbox disabled name="demo-disabled">
        Disabled
      </Checkbox>
      <Checkbox defaultChecked disabled name="demo-disabled-checked">
        Disabled + Checked
      </Checkbox>
    </div>
  );
}

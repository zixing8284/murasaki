import { TextBox } from "../text-box";

export function States() {
  return (
    <div className="bg-btn-face flex flex-col gap-3 p-4">
      <TextBox defaultValue="Editable text" label="Normal" />
      <TextBox defaultValue="Cannot edit" disabled label="Disabled" />
      <TextBox defaultValue="Read only text" label="Read Only" readOnly />
    </div>
  );
}

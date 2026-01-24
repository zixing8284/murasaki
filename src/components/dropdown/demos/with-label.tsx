import { Dropdown, type DropdownOption } from "../dropdown";

const fileTypeOptions: DropdownOption[] = [
  { label: "Text Document (*.txt)", value: "txt" },
  { label: "Word Document (*.doc)", value: "doc" },
  { label: "Rich Text Format (*.rtf)", value: "rtf" },
  { label: "All Files (*.*)", value: "all" },
];

export function WithLabel(): React.ReactElement {
  return (
    <Dropdown
      label="File type:"
      name="demo-labeled"
      options={fileTypeOptions}
      width={200}
    />
  );
}

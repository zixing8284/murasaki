import { DropdownNative } from "../dropdown";

export function Native(): React.ReactElement {
  return (
    <DropdownNative label="File type:" name="demo-native">
      <option value="txt">Text Document (*.txt)</option>
      <option value="doc">Word Document (*.doc)</option>
      <option value="rtf">Rich Text Format (*.rtf)</option>
      <option value="all">All Files (*.*)</option>
    </DropdownNative>
  );
}

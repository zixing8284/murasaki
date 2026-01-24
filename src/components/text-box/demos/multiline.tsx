import { TextBox } from "../text-box";

export function Multiline() {
  return (
    <div className="bg-btn-face flex flex-col gap-4 p-4">
      <TextBox multiline placeholder="Enter multiple lines of text..." />
      <TextBox
        label="Description"
        labelPosition="top"
        multiline
        placeholder="Type your description here..."
        rows={4}
      />
      <TextBox
        defaultValue="This textarea is disabled"
        disabled
        label="Notes"
        labelPosition="top"
        multiline
        rows={3}
      />
      <TextBox
        defaultValue="This content cannot be edited"
        label="Read Only"
        labelPosition="top"
        multiline
        readOnly
        rows={3}
      />
    </div>
  );
}

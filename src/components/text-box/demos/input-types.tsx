import { TextBox } from "../text-box";

export function InputTypes() {
  return (
    <div className="bg-btn-face flex flex-col gap-3 p-4">
      <TextBox label="Text" placeholder="Plain text" type="text" />
      <TextBox label="Email" placeholder="user@example.com" type="email" />
      <TextBox label="Password" placeholder="••••••••" type="password" />
      <TextBox label="Number" placeholder="123" type="number" />
      <TextBox label="Phone" placeholder="+1 (555) 123-4567" type="tel" />
      <TextBox label="URL" placeholder="https://example.com" type="url" />
      <TextBox label="Search" placeholder="Search..." type="search" />
    </div>
  );
}

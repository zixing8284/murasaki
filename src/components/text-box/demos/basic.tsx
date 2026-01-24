import { TextBox } from '../text-box'

export function Basic(): React.ReactElement {
  return (
    <div className="bg-btn-face flex flex-col gap-4 p-4">
      <TextBox placeholder="Enter text here..." />
      <TextBox label="Username" placeholder="Type your username" />
      <TextBox label="Password" placeholder="••••••••" type="password" />
    </div>
  )
}

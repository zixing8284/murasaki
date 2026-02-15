import { Button } from 'murasaki-react98'

export default function DemoBasicButton(): React.ReactElement {
  return (
    <div className="flex gap-2 flex-wrap items-center">
      <Button>Click Me</Button>
      <Button disabled>Disabled</Button>
    </div>
  )
}

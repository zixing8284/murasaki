import { Button } from "../button";

export function ButtonGroup(): React.ReactElement {
  return (
    <div className="flex gap-2">
      <Button>OK</Button>
      <Button>Cancel</Button>
      <Button>Apply</Button>
    </div>
  );
}

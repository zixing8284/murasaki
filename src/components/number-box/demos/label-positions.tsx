import { NumberBox } from "../number-box";

export function LabelPositions() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <NumberBox defaultValue={10} label="Left Label:" labelPosition="left" />

      <NumberBox defaultValue={20} label="Top Label:" labelPosition="top" />

      <NumberBox defaultValue={30} />
    </div>
  );
}

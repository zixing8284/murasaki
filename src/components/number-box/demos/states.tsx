import { NumberBox } from "../number-box";

export function States() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <NumberBox defaultValue={10} label="Normal:" />

      <NumberBox defaultValue={20} disabled label="Disabled:" />

      <NumberBox defaultValue={30} label="Read-only:" readOnly />

      <NumberBox defaultValue={100} disabled label="Disabled (max reached):" max={100} />
    </div>
  );
}

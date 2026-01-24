import { useState } from "react";

import { NumberBox } from "../number-box";

export function Basic() {
  const [value, setValue] = useState<number>(0);

  return (
    <div className="flex flex-col gap-4 p-4">
      <NumberBox label="Quantity:" onChange={setValue} value={value} />

      <div className="text-sm text-btn-text">Current value: {value}</div>

      <NumberBox defaultValue={5} label="Age:" />

      <NumberBox label="Price:" step={0.01} defaultValue={9.99} />
    </div>
  );
}

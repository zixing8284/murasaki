import { useState } from "react";

import { OptionButton } from "../option-button";
import OptionGroup from "../option-group";

export function Horizontal(): React.ReactElement {
  const [selected, setSelected] = useState("red");

  return (
    <OptionGroup name="colors" onChange={setSelected} selectedValue={selected}>
      <div className="flex gap-4">
        <OptionButton value="red">Red</OptionButton>
        <OptionButton value="green">Green</OptionButton>
        <OptionButton value="blue">Blue</OptionButton>
      </div>
    </OptionGroup>
  );
}

import { useState } from "react";

import { OptionButton } from "../option-button";
import OptionGroup from "../option-group";

export function Basic(): React.ReactElement {
  const [selected, setSelected] = useState("option1");

  return (
    <OptionGroup name="demo" onChange={setSelected} selectedValue={selected}>
      <div className="flex flex-col gap-2">
        <OptionButton value="option1">Option 1</OptionButton>
        <OptionButton value="option2">Option 2</OptionButton>
        <OptionButton value="option3">Option 3</OptionButton>
      </div>
    </OptionGroup>
  );
}

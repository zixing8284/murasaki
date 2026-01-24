import { useState } from "react";

import { OptionButton } from "@/components/option-button/option-button";
import OptionGroup from "@/components/option-button/option-group";

import { GroupBox } from "../group-box";

export function WithOptionButtons(): React.ReactElement {
  const [selected, setSelected] = useState("option1");

  return (
    <GroupBox label="Choose an option">
      <OptionGroup name="demo" onChange={setSelected} selectedValue={selected}>
        <div className="flex flex-col gap-2">
          <OptionButton value="option1">Option 1</OptionButton>
          <OptionButton value="option2">Option 2</OptionButton>
          <OptionButton value="option3">Option 3</OptionButton>
        </div>
      </OptionGroup>
    </GroupBox>
  );
}

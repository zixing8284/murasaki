import { Dropdown, type DropdownOption } from "../dropdown";

const options: DropdownOption[] = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" },
];

export function Basic(): React.ReactElement {
  return <Dropdown name="demo-basic" options={options} width={200} />;
}

import { OptionButton } from "./option-button";
import {
  OptionButtonGroupContext,
  type OptionGroupProps,
} from "./option-context";

export default function OptionGroup(
  props: React.PropsWithChildren<OptionGroupProps>,
) {
  const { children, name, onChange, selectedValue } = props;

  return (
    <OptionButtonGroupContext value={{ name, onChange, selectedValue }}>
      {children}
    </OptionButtonGroupContext>
  );
}
OptionGroup.Option = OptionButton;

import type { DropdownOption } from '../dropdown'

import { useState } from 'react'
import { Dropdown } from '../dropdown'

const pokemonOptions: DropdownOption<number>[] = [
  { label: 'Bulbasaur', value: 1 },
  { label: 'Charmander', value: 4 },
  { label: 'Squirtle', value: 7 },
  { label: 'Pikachu', value: 25 },
  { label: 'Jigglypuff', value: 39 },
]

export function Controlled(): React.ReactElement {
  const [selected, setSelected] = useState<number>(25)

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm">
        Selected:
        {' '}
        {pokemonOptions.find(p => p.value === selected)?.label}
      </p>
      <Dropdown
        name="demo-controlled"
        onChange={(opt) => {
          setSelected(opt.value)
        }}
        options={pokemonOptions}
        value={selected}
        width={180}
      />
    </div>
  )
}

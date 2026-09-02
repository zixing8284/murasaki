'use client'

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@murasaki-io/react98'

export function SelectGroupedDemo(): React.ReactElement {
  return (
    <Select name="animal" defaultValue="cat">
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select an animal" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Pets</SelectLabel>
          <SelectItem value="cat">Cat</SelectItem>
          <SelectItem value="dog">Dog</SelectItem>
          <SelectItem value="hamster">Hamster</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Wild</SelectLabel>
          <SelectItem value="lion">Lion</SelectItem>
          <SelectItem value="wolf">Wolf</SelectItem>
          <SelectItem value="fox" disabled>Fox (unavailable)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

import { useState } from "react";

import { Slider } from "../slider";

export function Basic() {
  const [volume, setVolume] = useState(50);
  const [brightness, setBrightness] = useState(128);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="volume">Volume: {volume}</label>
        <Slider
          id="volume"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => {
            setVolume(Number(e.target.value));
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="brightness">Brightness: {brightness}</label>
        <Slider
          id="brightness"
          min={0}
          max={255}
          value={brightness}
          onChange={(e) => {
            setBrightness(Number(e.target.value));
          }}
        />
      </div>
    </div>
  );
}

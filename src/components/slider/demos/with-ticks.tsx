import { useState } from "react";

import { type TickMark, Slider } from "../slider";

const volumeTicks: TickMark[] = [
  { value: 0, label: "0" },
  { value: 25, label: "25" },
  { value: 50, label: "50" },
  { value: 75, label: "75" },
  { value: 100, label: "100" },
];

const speedTicks: TickMark[] = [
  { value: 0, label: "Slow" },
  { value: 50, label: "Normal" },
  { value: 100, label: "Fast" },
];

export function WithTicks() {
  const [volume, setVolume] = useState(50);
  const [speed, setSpeed] = useState(50);

  return (
    <div className="flex flex-col gap-8 p-4 pb-8">
      <div className="flex flex-col gap-2">
        <label htmlFor="volume-ticks">Volume: {volume}</label>
        <Slider
          id="volume-ticks"
          min={0}
          max={100}
          step={25}
          value={volume}
          onChange={(e) => {
            setVolume(Number(e.target.value));
          }}
          ticks={volumeTicks}
        />
      </div>
      <div className="flex flex-col gap-2 mt-4">
        <label htmlFor="speed-ticks">Speed: {speed}</label>
        <Slider
          id="speed-ticks"
          min={0}
          max={100}
          step={50}
          value={speed}
          onChange={(e) => {
            setSpeed(Number(e.target.value));
          }}
          ticks={speedTicks}
        />
      </div>
    </div>
  );
}

import { useState } from "react";

import { Button } from "@/components/button/button";

import { Window } from "../window";

export function Basic(): React.ReactElement {
  const [showWindow, setShowWindow] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm">
        Default behavior: fixed positioning, draggable within viewport
      </p>
      <Button
        onClick={() => {
          setShowWindow((v) => !v);
        }}
      >
        {showWindow ? "Close Window" : "Open Window"}
      </Button>
      {showWindow && (
        <Window
          draggable
          onClose={() => {
            setShowWindow(false);
          }}
          title="Default Window"
        >
          <p>I&apos;m fixed positioned by default!</p>
          <p className="text-btn-shadow mt-2 text-xs">
            Draggable within viewport bounds
          </p>
        </Window>
      )}
    </div>
  );
}

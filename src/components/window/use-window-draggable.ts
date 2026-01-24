import { useCallback, useEffect, useRef, useState } from "react";

interface Transform {
  offsetX: number;
  offsetY: number;
}

interface UseWindowDraggableOptions {
  /**
   * Container element to constrain dragging boundaries.
   * - If null/undefined: constrain to viewport
   * - If an element: constrain to that element's bounds
   */
  container?: HTMLElement | null;
  /** Enable/disable dragging */
  draggable?: boolean;
}

/**
 * Hook to enable draggable behavior for a window component.
 * Constrains movement within the specified container boundaries or viewport.
 *
 * Returns refs that should be attached to the target (window) and drag handle (title bar) elements.
 *
 * @param options - Configuration options
 * @returns Object containing refs to attach and drag state
 *
 * @example
 * ```tsx
 * const { targetRef, dragRef, dragging } = useWindowDraggable<HTMLDivElement, HTMLDivElement>({ draggable: true });
 * return (
 *   <div ref={targetRef}>
 *     <div ref={dragRef}>Title Bar</div>
 *   </div>
 * );
 * ```
 */
export function useWindowDraggable<
  TTarget extends HTMLElement = HTMLElement,
  TDrag extends HTMLElement = HTMLElement,
>(options: UseWindowDraggableOptions = {}) {
  const { container = null, draggable = true } = options;

  const targetRef = useRef<null | TTarget>(null);
  const dragRef = useRef<null | TDrag>(null);
  const [dragging, setDragging] = useState(false);
  const transformRef = useRef<Transform>({ offsetX: 0, offsetY: 0 });

  const resetPosition = useCallback(() => {
    transformRef.current = { offsetX: 0, offsetY: 0 };
    if (targetRef.current) {
      targetRef.current.style.transform = "";
    }
  }, []);

  const onMousedown = useCallback(
    (e: MouseEvent) => {
      const target = targetRef.current;
      if (!target) return;

      // Prevent text selection during drag
      e.preventDefault();

      const downX = e.clientX;
      const downY = e.clientY;
      const { offsetX, offsetY } = transformRef.current;

      const targetRect = target.getBoundingClientRect();
      const {
        height: targetHeight,
        left: targetLeft,
        top: targetTop,
        width: targetWidth,
      } = targetRect;

      // Calculate boundary constraints
      let maxLeft: number, maxTop: number, minLeft: number, minTop: number;

      if (container) {
        // Constrain to container element bounds
        const containerRect = container.getBoundingClientRect();
        minLeft = containerRect.left - targetLeft + offsetX;
        maxLeft = containerRect.right - targetLeft - targetWidth + offsetX;
        minTop = containerRect.top - targetTop + offsetY;
        maxTop = containerRect.bottom - targetTop - targetHeight + offsetY;
      } else {
        // Constrain to viewport (for fixed positioned windows)
        const { clientHeight, clientWidth } = document.documentElement;
        minLeft = -targetLeft + offsetX;
        minTop = -targetTop + offsetY;
        maxLeft = clientWidth - targetLeft - targetWidth + offsetX;
        maxTop = clientHeight - targetTop - targetHeight + offsetY;
      }

      const onMousemove = (e: MouseEvent) => {
        // Clamp to boundaries
        const moveX = Math.min(
          Math.max(offsetX + e.clientX - downX, minLeft),
          maxLeft,
        );
        const moveY = Math.min(
          Math.max(offsetY + e.clientY - downY, minTop),
          maxTop,
        );

        transformRef.current = { offsetX: moveX, offsetY: moveY };
        target.style.transform = `translate(${moveX.toString()}px, ${moveY.toString()}px)`;
      };

      const onMouseup = () => {
        setDragging(false);
        document.removeEventListener("mousemove", onMousemove);
        document.removeEventListener("mouseup", onMouseup);
      };

      setDragging(true);
      document.addEventListener("mousemove", onMousemove);
      document.addEventListener("mouseup", onMouseup);
    },
    [container],
  );

  useEffect(() => {
    const dragDom = dragRef.current;

    if (draggable && dragDom) {
      dragDom.addEventListener("mousedown", onMousedown);
      return () => {
        dragDom.removeEventListener("mousedown", onMousedown);
      };
    }
  }, [draggable, onMousedown]);

  return {
    /** Whether the element is currently being dragged */
    dragging,
    /** Ref to attach to the drag handle element (title bar) */
    dragRef,
    /** Reset position to initial state */
    resetPosition,
    /** Ref to attach to the draggable target element (the window) */
    targetRef,
    /** Internal transform state ref */
    transformRef,
  };
}

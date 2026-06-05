# Self-owned primitives by default

@murasaki-io/react98 will design interaction behavior and accessibility foundations inside the library by default, rather than making Radix UI, Base UI, or another headless primitive library the foundation. External headless primitives may still be used as explicit exceptions or internal implementation details when the complexity or accessibility risk justifies it, but the public component model should remain coherent with the library's Windows 98 design language and package-owned ownership model.

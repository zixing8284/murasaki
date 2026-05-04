# Explicit global CSS import

@murasaki/react98 consumers should import the library's global stylesheet from the application entry point or root layout, rather than receiving global CSS through the component package entry as a side effect. This makes usage in server-rendered frameworks clearer, keeps global styling setup under the consuming application's control, and avoids coupling component imports to framework-specific global CSS rules.

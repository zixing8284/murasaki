# Explicit global CSS import

@murasaki/react98 consumers should import the library's global stylesheet from the application entry point or root layout, rather than receiving global CSS through the component package entry as a side effect. This makes usage in server-rendered frameworks clearer, keeps global styling setup under the consuming application's control, and avoids coupling component imports to framework-specific global CSS rules.

## Theme source stylesheet exception

`@murasaki/react98/theme.css` intentionally resolves to `./src/theme.css` instead of a built `dist` artifact. This is a narrow exception to the dist-only package export rule: Tailwind CSS v4 consumers need to import the library-owned theme source stylesheet so theme variables can participate in their application stylesheet pipeline.

`@murasaki/react98/globals.css` remains the built CSS entry for consumers that want compiled global styles without processing the source theme stylesheet.

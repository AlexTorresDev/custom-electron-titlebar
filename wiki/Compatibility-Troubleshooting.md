# 💻 Compatibility & Troubleshooting

## Supported platforms
- Windows
- Linux
- MacOS

## Requirements
- Electron >= 14 recommended
- Node.js >= 16
- Build and scripts work on Windows, Linux, and Mac (uses `cpx` to copy styles)

## Common issues

### Styles are not applied
- Make sure `.css` files are in `static/theme/` and get copied to `dist/theme/` when building.
- If you see "Could not load theme CSS" errors, check paths and permissions.

### Example window does not appear
- Use the `pnpm run launch` script or the "Launch Example (build & run)" config in VS Code.
- Make sure Electron is installed as a devDependency.

### Sandbox error
- `webPreferences.sandbox` must be set to `false` for integration to work.

### Cross-platform issues
- The style copy script uses `cpx`, which works on all systems.
- If you have path issues, always use relative paths and check file permissions.

## Tips
- If you modify styles, run `pnpm run build` to see changes reflected.
- For fast development, use `pnpm run dev`.

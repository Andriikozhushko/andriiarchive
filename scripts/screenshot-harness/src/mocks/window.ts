/** Mock of @tauri-apps/api/window — a no-op webview window for screenshot
 *  capture. TitleBar calls isMaximized/onResized/startDragging/minimize/etc. */

const win = {
  async isMaximized(): Promise<boolean> {
    return false;
  },
  async onResized(): Promise<() => void> {
    return () => {};
  },
  async onResizedChange(): Promise<() => void> {
    return () => {};
  },
  startDragging(): void {},
  minimize(): void {},
  toggleMaximize(): void {},
  close(): void {},
  async setTitle(): Promise<void> {},
  async setMaximizable(): Promise<void> {},
  label: "main",
};

export function getCurrentWindow() {
  return win;
}

export const getCurrent = getCurrentWindow;
export default win;

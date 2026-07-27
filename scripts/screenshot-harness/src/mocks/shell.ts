/** Mock of @tauri-apps/plugin-shell. SecurityReport calls open() ("show in
 *  folder"); the harness never clicks it, so this is a no-op. */
export async function open(_path: string): Promise<void> {}
export async function openUrl(_url: string): Promise<void> {}
export async function openPath(_path: string): Promise<void> {}

/** Mock of @tauri-apps/plugin-dialog. The harness never drives file/save
 *  pickers (scenes mount components directly in their target state), so these
 *  resolve to null. */
export async function open(_options?: unknown): Promise<string | string[] | null> {
  return null;
}

export async function save(_options?: unknown): Promise<string | null> {
  return null;
}

export async function message(_message: unknown, _options?: unknown): Promise<void> {}

export async function ask(_message: unknown, _options?: unknown): Promise<boolean> {
  return false;
}

export async function confirm(_message: unknown, _options?: unknown): Promise<boolean> {
  return false;
}

/** Mock of @tauri-apps/api/event. The harness never emits drag events, so
 *  listen() simply returns a no-op unlistener. */
export async function listen<T = unknown>(
  _event: string,
  _handler: (event: { payload: T }) => void,
): Promise<() => void> {
  return () => {};
}

export async function once<T = unknown>(
  _event: string,
  _handler: (event: { payload: T }) => void,
): Promise<() => void> {
  return () => {};
}

export async function emit(_event: string, _payload?: unknown): Promise<void> {}

interface Window {
  ethereum?: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    send: (method: string, params?: unknown[]) => Promise<unknown>;
    on: (event: string, handler: (...args: unknown[]) => void) => void;
    removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    removeAllListeners?: () => void;
    isMetaMask?: boolean;
  };
}

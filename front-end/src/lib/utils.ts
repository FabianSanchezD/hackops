// Minimal utility used by shadcn-style components without external deps
export function cn(...inputs: Array<string | undefined | null | false>) {
  return inputs.filter(Boolean).join(" ");
}


export function isReadOnly(): boolean {
  return process.env.READ_ONLY === 'true';
}

export function assertWritable(): void {
  if (isReadOnly()) {
    throw new Error('READ_ONLY_MODE: writes are disabled in this deployment.');
  }
}

export const maybeMap = <I, O>(
  value: I | I[],
  modifier: (item: I) => O,
): O | O[] => (Array.isArray(value) ? value.map(modifier) : modifier(value))

export const omit = <T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> => {
  const ret = { ...obj }
  keys.forEach((key) => delete ret[key])
  return ret
}

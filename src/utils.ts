export const maybeMap = <I, O>(
  value: I | I[],
  modifier: (item: I) => O,
): O | O[] => (Array.isArray(value) ? value.map(modifier) : modifier(value))

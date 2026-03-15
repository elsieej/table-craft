import type { FilterSerializer } from '../types/table'

/**
 * Creates a delimiter-based serializer (e.g. dot, comma, pipe).
 * Note: Filter option values must not contain the separator character.
 */
export function createDelimited(separator: string): FilterSerializer {
  return {
    parse: (raw) => (raw ? raw.split(separator).filter(Boolean) : []),
    serialize: (values) => ({
      type: 'single',
      value: values.join(separator),
    }),
  }
}

/** Dot-separated format: ?key=a.b.c (default, backward compatible). */
export const dotSeparated = createDelimited('.')

/** Comma-separated format: ?key=a,b,c */
export const commaSeparated = createDelimited(',')

/** Pipe-separated format: ?key=a|b|c */
export const pipeSeparated = createDelimited('|')

/** Multi-key format: ?key=a&key=b&key=c (browser-native, no separator collision). */
export const multiKey: FilterSerializer = {
  parse: (_raw, allValues) => allValues.filter(Boolean),
  serialize: (values) => ({
    type: 'multi',
    values,
  }),
}

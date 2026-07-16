import { describe, it, expect } from 'vitest'
import {
  createDelimited,
  dotSeparated,
  commaSeparated,
  pipeSeparated,
  multiKey,
} from '../serializers/filter-serializers'

describe('createDelimited', () => {
  it('builds independent serializers per separator', () => {
    const semicolonSeparated = createDelimited(';')

    expect(semicolonSeparated.parse('a;b;c', [])).toEqual(['a', 'b', 'c'])
    expect(semicolonSeparated.serialize(['a', 'b'])).toEqual({
      type: 'single',
      value: 'a;b',
    })
    // Confirm it did not affect the pre-existing dotSeparated instance
    expect(dotSeparated.parse('a;b;c', [])).toEqual(['a;b;c'])
  })
})

describe.each([
  { name: 'dotSeparated', serializer: dotSeparated, sep: '.' },
  { name: 'commaSeparated', serializer: commaSeparated, sep: ',' },
  { name: 'pipeSeparated', serializer: pipeSeparated, sep: '|' },
])('$name', ({ serializer, sep }) => {
  it('parse(null) returns []', () => {
    expect(serializer.parse(null, [])).toEqual([])
  })

  it("parse('') returns []", () => {
    expect(serializer.parse('', [])).toEqual([])
  })

  it('parses a single value', () => {
    expect(serializer.parse(`a`, [])).toEqual(['a'])
  })

  it('parses multiple values', () => {
    expect(serializer.parse(`a${sep}b${sep}c`, [])).toEqual(['a', 'b', 'c'])
  })

  it('drops empty segments from consecutive separators', () => {
    expect(serializer.parse(`a${sep}${sep}b`, [])).toEqual(['a', 'b'])
  })

  it('drops the empty segment from a trailing separator', () => {
    expect(serializer.parse(`a${sep}`, [])).toEqual(['a'])
  })

  it('preserves truthy numeric-looking segments', () => {
    expect(serializer.parse(`0${sep}1`, [])).toEqual(['0', '1'])
  })

  it('ignores the allValues argument', () => {
    expect(serializer.parse(`a${sep}b`, ['x', 'y'])).toEqual(['a', 'b'])
  })

  it('serializes values by joining with the separator, as type "single"', () => {
    expect(serializer.serialize(['a', 'b', 'c'])).toEqual({
      type: 'single',
      value: `a${sep}b${sep}c`,
    })
  })

  it('serializes an empty array to an empty string value', () => {
    expect(serializer.serialize([])).toEqual({ type: 'single', value: '' })
  })

  it('serialize does not filter falsy entries (asymmetric with parse)', () => {
    expect(serializer.serialize(['a', '', 'b'])).toEqual({
      type: 'single',
      value: `a${sep}${sep}b`,
    })
  })

  it('round trips values with no empty entries', () => {
    const values = ['a', 'b', 'c']
    const { value } = serializer.serialize(values) as { type: 'single'; value: string }
    expect(serializer.parse(value, [])).toEqual(values)
  })
})

describe('multiKey', () => {
  it('parse ignores rawValue and returns allValues filtered by Boolean', () => {
    expect(multiKey.parse('ignored-raw', ['a', '', 'b'])).toEqual(['a', 'b'])
  })

  it('parse with empty allValues returns []', () => {
    expect(multiKey.parse(null, [])).toEqual([])
  })

  it('serialize returns type "multi" with the values array unchanged', () => {
    expect(multiKey.serialize(['a', 'b'])).toEqual({ type: 'multi', values: ['a', 'b'] })
  })

  it('serialize does not filter or join falsy entries', () => {
    expect(multiKey.serialize(['a', '', ''])).toEqual({
      type: 'multi',
      values: ['a', '', ''],
    })
  })
})

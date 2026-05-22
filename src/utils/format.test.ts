import { formatDuration, formatSecondsShort, formatNumber, formatTokens } from './format.js'

describe('formatDuration', () => {
  describe('edge cases', () => {
    test('returns "0s" for 0', () => {
      expect(formatDuration(0)).toBe('0s')
    })

    test('returns "0s" for negative values (clock drift guard)', () => {
      expect(formatDuration(-1)).toBe('0s')
      expect(formatDuration(-500)).toBe('0s')
      expect(formatDuration(-999999)).toBe('0s')
    })

    test('shows decimal for sub-10s durations', () => {
      expect(formatDuration(500)).toBe('0.5s')
      expect(formatDuration(1234)).toBe('1.2s')
      expect(formatDuration(9999)).toBe('10.0s') // 9.999 rounds to 10.0
    })

    test('shows integer for 10-59s', () => {
      expect(formatDuration(10000)).toBe('10s')
      expect(formatDuration(30000)).toBe('30s')
      expect(formatDuration(59999)).toBe('59s')
    })
  })

  describe('sub-minute', () => {
    test('formats seconds correctly', () => {
      expect(formatDuration(1000)).toBe('1.0s')
      expect(formatDuration(5000)).toBe('5.0s')
      expect(formatDuration(9000)).toBe('9.0s')
      expect(formatDuration(15000)).toBe('15s')
      expect(formatDuration(45000)).toBe('45s')
    })
  })

  describe('minutes and seconds', () => {
    test('formats 1m+', () => {
      expect(formatDuration(60000)).toBe('1m 0s')
      expect(formatDuration(61000)).toBe('1m 1s')
      expect(formatDuration(90000)).toBe('1m 30s')
      expect(formatDuration(185000)).toBe('3m 5s')
    })

    test('formats exactly N minutes', () => {
      expect(formatDuration(120000)).toBe('2m 0s')
      expect(formatDuration(300000)).toBe('5m 0s')
    })
  })

  describe('hours', () => {
    test('formats 1h+', () => {
      expect(formatDuration(3600000)).toBe('1h 0m 0s')
      expect(formatDuration(3661000)).toBe('1h 1m 1s')
      expect(formatDuration(7200000)).toBe('2h 0m 0s')
      expect(formatDuration(5400000)).toBe('1h 30m 0s')
    })
  })

  describe('days', () => {
    test('formats 1d+', () => {
      expect(formatDuration(86400000)).toBe('1d 0h 0m')
      expect(formatDuration(90000000)).toBe('1d 1h 0m')
      expect(formatDuration(172800000)).toBe('2d 0h 0m')
    })
  })

  describe('hideTrailingZeros option', () => {
    test('hides trailing zeros in hours', () => {
      expect(formatDuration(3600000, { hideTrailingZeros: true })).toBe('1h')
      expect(formatDuration(3661000, { hideTrailingZeros: true })).toBe('1h 1m 1s')
    })

    test('hides trailing zeros in minutes', () => {
      expect(formatDuration(60000, { hideTrailingZeros: true })).toBe('1m')
      expect(formatDuration(90000, { hideTrailingZeros: true })).toBe('1m 30s')
    })

    test('hides trailing zeros in days', () => {
      expect(formatDuration(86400000, { hideTrailingZeros: true })).toBe('1d')
    })
  })

  describe('mostSignificantOnly option', () => {
    test('shows only the largest unit', () => {
      expect(formatDuration(86400000, { mostSignificantOnly: true })).toBe('1d')
      expect(formatDuration(3600000, { mostSignificantOnly: true })).toBe('1h')
      expect(formatDuration(60000, { mostSignificantOnly: true })).toBe('1m')
      expect(formatDuration(30000, { mostSignificantOnly: true })).toBe('30s')
    })
  })

  describe('regression: the "313 seconds" bug', () => {
    test('185000ms = 3m 5s, NOT 185s', () => {
      expect(formatDuration(185000)).toBe('3m 5s')
    })

    test('313000ms = 5m 13s, NOT 313s', () => {
      expect(formatDuration(313000)).toBe('5m 13s')
    })

    test('43000ms = 43s (sub-minute stays as seconds)', () => {
      expect(formatDuration(43000)).toBe('43s')
    })

    test('123456ms = 2m 3s (not 123s)', () => {
      expect(formatDuration(123456)).toBe('2m 3s')
    })
  })
})

describe('formatSecondsShort', () => {
  test('formats with 1 decimal place', () => {
    expect(formatSecondsShort(0)).toBe('0.0s')
    expect(formatSecondsShort(500)).toBe('0.5s')
    expect(formatSecondsShort(1234)).toBe('1.2s')
    expect(formatSecondsShort(10000)).toBe('10.0s')
  })
})

describe('formatNumber', () => {
  test('formats compact notation', () => {
    expect(formatNumber(900)).toBe('900')
    expect(formatNumber(1000)).toBe('1.0k')
    expect(formatNumber(1400)).toBe('1.4k')
    expect(formatNumber(1300000)).toBe('1.3m')
  })

  test('handles zero', () => {
    expect(formatNumber(0)).toBe('0')
  })
})

describe('formatTokens', () => {
  test('removes .0 from compact notation', () => {
    expect(formatTokens(1000)).toBe('1k')
    expect(formatTokens(1400)).toBe('1.4k')
    expect(formatTokens(900)).toBe('900')
  })
})

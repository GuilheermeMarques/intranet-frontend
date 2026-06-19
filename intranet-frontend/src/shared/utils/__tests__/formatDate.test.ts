import { formatDate, formatDateTime } from '../formatDate'

describe('formatDate', () => {
  it('formats a valid ISO string as dd/mm/yyyy', () => {
    expect(formatDate('2026-06-19T12:00:00.000Z')).toBe('19/06/2026')
  })

  it('accepts a Date instance', () => {
    // Construct with local-time parts to avoid UTC/offset day-rollover in CI/local runs.
    expect(formatDate(new Date(2026, 0, 5))).toBe('05/01/2026')
  })

  it.each([null, undefined, '', 'not-a-date'])('returns the placeholder for %p', (value) => {
    expect(formatDate(value as never)).toBe('-')
  })

  it('does NOT render the 1969 epoch fallback for null', () => {
    expect(formatDate(null)).not.toContain('1969')
  })

  it('honors a custom placeholder', () => {
    expect(formatDate(null, '—')).toBe('—')
  })
})

describe('formatDateTime', () => {
  it('formats a valid ISO string with time', () => {
    const result = formatDateTime('2026-06-19T15:30:00.000Z')
    expect(result).toContain('19/06/2026')
    expect(result).toMatch(/\d{2}:\d{2}/)
  })

  it.each([null, undefined, '', 'nope'])('returns the placeholder for %p', (value) => {
    expect(formatDateTime(value as never)).toBe('-')
  })
})

/**
 * Shared date-formatting helpers.
 *
 * All callers should use these instead of inlining `new Date(x).toLocaleDateString()`,
 * which renders `null`/`undefined`/invalid input as "31/12/1969" or "Invalid Date".
 * These return a placeholder ("-" by default) for any non-renderable value.
 */

export type DateInput = string | number | Date | null | undefined

const PLACEHOLDER = '-'

function toValidDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === '') return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Date only, pt-BR (dd/mm/yyyy). Returns the placeholder for null/invalid input. */
export function formatDate(value: DateInput, placeholder = PLACEHOLDER): string {
  const date = toValidDate(value)
  return date ? date.toLocaleDateString('pt-BR') : placeholder
}

/** Date + time, pt-BR (dd/mm/yyyy hh:mm). Returns the placeholder for null/invalid input. */
export function formatDateTime(value: DateInput, placeholder = PLACEHOLDER): string {
  const date = toValidDate(value)
  return date
    ? date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : placeholder
}

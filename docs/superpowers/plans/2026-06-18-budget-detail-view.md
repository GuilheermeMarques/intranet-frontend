# Budget Detail View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Clicking a budget row opens a read-only detail modal showing the budget header (number, status, dates, responsible, total), the **full client info** (fetched by `clientId`), and the **items** (products) of that budget. The list already wires `onRowClick={handleRowClick}` (currently just `console.log`); the clicked `Budget` already carries `items[]` + snapshots — only the full client needs fetching.

**Architecture:** Detail MODAL (consistent with the budgets page's modal-driven UI). Reuse the page's existing `formatCurrency`/`formatDate`/`getStatusColor`/`getStatusLabel`. Full client via a new `clientsApi.getById` + `useClientByIdQuery` (backend `GET /clients/:id` exists). The generic `Modal` component (`@/components/Modal`) is used read-only with a "Fechar" action.

**Working dir:** `intranet-frontend/`. Branch `feat/budget-detail-view`. npm. Backend running; dev STOPPED while building. Gate: `npm test` + `npm run build`.

---

## Task 1: clientsApi.getById + useClientByIdQuery
- [ ] In `src/features/clients/api/clientsApi.ts`, add (mirror `getByCode`):
```ts
  async getById(id: string): Promise<Client | null> {
    try {
      const { client } = await httpClient.get<{ client: Client }>(`/clients/${id}`)
      return client
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null
      throw error
    }
  },
```
- [ ] Create `src/features/clients/hooks/useClientByIdQuery.ts`:
```ts
import { useQuery } from '@tanstack/react-query'
import { clientsApi } from '../api/clientsApi'

export function useClientByIdQuery(id: string) {
  return useQuery({
    queryKey: ['client-by-id', id],
    queryFn: () => clientsApi.getById(id),
    enabled: !!id,
  })
}
```
- [ ] Extend `clientsApi.test.ts`: assert `getById` GETs `/clients/:id`, unwraps `.client`, returns null on 404.
- [ ] Commit `feat(frontend): add clientsApi.getById + useClientByIdQuery`.

## Task 2: Budget detail modal on the budgets page
READ `src/app/budgets/page.tsx`. Reuse `formatCurrency`, `formatDate`, `getStatusColor`, `getStatusLabel` (already defined). It already imports `Modal`? — it imports `{ FormModal }`; ADD `Modal` to that import from `@/components/Modal`.
- [ ] Add state: `const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)`.
- [ ] Import + use `useClientByIdQuery`: `const { data: detailClient, isLoading: clientLoading } = useClientByIdQuery(selectedBudget?.clientId ?? '')`.
- [ ] Replace `handleRowClick` body (drop `console.log`): `const handleRowClick = (budget: Budget) => setSelectedBudget(budget)`.
- [ ] Render a detail `<Modal>` (after the existing `FormModal`), open when `selectedBudget` is set:
```tsx
<Modal
  open={!!selectedBudget}
  onClose={() => setSelectedBudget(null)}
  title={selectedBudget ? `Orçamento ${selectedBudget.number}` : ''}
  maxWidth="md"
  actions={[{ label: 'Fechar', onClick: () => setSelectedBudget(null) }]}
>
  {selectedBudget && (
    <Box>
      {/* Header: status chip, datas, responsável, total */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <Chip label={getStatusLabel(selectedBudget.status)} color={getStatusColor(selectedBudget.status)} />
        <Typography variant="body2">Criado em {formatDate(selectedBudget.createdAt)}</Typography>
        {selectedBudget.validityDate && (
          <Typography variant="body2">Validade {formatDate(selectedBudget.validityDate)}</Typography>
        )}
        <Typography variant="body2">Responsável: {selectedBudget.responsibleName}</Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, ml: 'auto' }}>
          Total: {formatCurrency(selectedBudget.total)}
        </Typography>
      </Box>

      {/* Cliente completo */}
      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Cliente</Typography>
      {clientLoading ? (
        <CircularProgress size={20} />
      ) : detailClient ? (
        <Grid container spacing={1}>
          <Grid item xs={12} sm={6}><Typography variant="body2"><strong>Nome:</strong> {detailClient.name}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography variant="body2"><strong>Documento:</strong> {detailClient.document}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography variant="body2"><strong>Email:</strong> {detailClient.email}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography variant="body2"><strong>Telefone:</strong> {detailClient.phone}</Typography></Grid>
          <Grid item xs={12}><Typography variant="body2"><strong>Endereço:</strong> {detailClient.street}, {detailClient.number}{detailClient.complement ? ` - ${detailClient.complement}` : ''} — {detailClient.neighborhood}, {detailClient.city}/{detailClient.state} — {detailClient.zipCode}</Typography></Grid>
        </Grid>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Cliente: {selectedBudget.clientName} (detalhes indisponíveis)
        </Typography>
      )}

      {/* Itens / produtos */}
      <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>Itens</Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Produto</TableCell>
              <TableCell align="right">Qtd.</TableCell>
              <TableCell align="right">Preço unit.</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedBudget.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.productCode ?? '-'}</TableCell>
                <TableCell>{item.productName}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                <TableCell align="right">{formatCurrency(item.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )}
</Modal>
```
  Ensure the MUI imports used (`Box, Chip, Typography, Grid, CircularProgress, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper`) are present in the file's `@mui/material` import (most already are — add any missing).
- [ ] Verify `npx tsc --noEmit 2>&1 | grep "budgets/page.tsx"` → zero; `grep -n "console.log('Orc" src/app/budgets/page.tsx` → empty.
- [ ] Commit `feat(frontend): add budget detail modal (client info + items)`.

## Task 3: Gate
- [ ] `npm run type-check` (pre-existing test noise only); `npm test -- --watchAll=false` (green); `npm run lint` (no new errors); `npm run build` (SUCCESS). Commit any straggler.

---

## Done Criteria
- Clicking a budget row opens a read-only modal with status/dates/responsible/total, full client info (fetched by clientId), and the items table.
- `npm test` + `npm run build` green.
- (Controller validates in the browser / via BFF that GET /clients/:id returns the client.)

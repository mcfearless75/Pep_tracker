// A tiny in-memory stand-in for the Supabase client, covering only the query
// shapes the server components use. Reads work; writes are accepted and
// ignored. Enabled only when TRACKED_DEMO=1.
import { buildDemo, DEMO_USER_ID } from './seed'

type Row = Record<string, unknown>
type Result<T> = { data: T; error: null }

class Query implements PromiseLike<Result<Row[]>> {
  private rows: Row[]
  constructor(rows: Row[]) { this.rows = rows }
  select() { return this }
  eq(col: string, val: unknown) { this.rows = this.rows.filter(r => r[col] === val); return this }
  gte(col: string, val: unknown) { this.rows = this.rows.filter(r => String(r[col]) >= String(val)); return this }
  lte(col: string, val: unknown) { this.rows = this.rows.filter(r => String(r[col]) <= String(val)); return this }
  order(col: string, opts?: { ascending?: boolean }) {
    const asc = opts?.ascending !== false
    this.rows = [...this.rows].sort((a, b) => (String(a[col]) < String(b[col]) ? -1 : String(a[col]) > String(b[col]) ? 1 : 0) * (asc ? 1 : -1))
    return this
  }
  limit(n: number) { this.rows = this.rows.slice(0, n); return this }
  returns() { return this }
  maybeSingle(): Promise<Result<Row | null>> { return Promise.resolve({ data: this.rows[0] ?? null, error: null }) }
  single(): Promise<Result<Row | null>> { return this.maybeSingle() }
  insert() { return Promise.resolve({ data: null, error: null }) }
  update() { return { eq: () => Promise.resolve({ data: null, error: null }) } }
  upsert() { return Promise.resolve({ data: null, error: null }) }
  delete() { return { eq: () => Promise.resolve({ data: null, error: null }) } }
  then<R1 = Result<Row[]>, R2 = never>(onfulfilled?: ((v: Result<Row[]>) => R1 | PromiseLike<R1>) | null, onrejected?: ((e: unknown) => R2 | PromiseLike<R2>) | null) {
    return Promise.resolve({ data: this.rows, error: null } as Result<Row[]>).then(onfulfilled, onrejected)
  }
}

export function createDemoClient() {
  const data = buildDemo(process.env.TRACKED_DEMO_NIGHT === '1')
  const user = { id: DEMO_USER_ID, email: 'demo@tracked.app' }
  return {
    auth: {
      getUser: async () => ({ data: { user }, error: null }),
      signOut: async () => ({ error: null }),
      exchangeCodeForSession: async () => ({ error: null }),
    },
    from: (table: string) => new Query(data[table] ?? []),
  }
}

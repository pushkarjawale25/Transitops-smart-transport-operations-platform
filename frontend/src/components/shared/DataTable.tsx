import { useState, useMemo, type ReactNode } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';

// Each column describes how to display one table column.
// `key` matches a field on the row object (used for sorting).
// `sortValue` converts a row into a sortable number or string.
export interface Column {
  key: string;
  header: string;
  render: (row: any) => ReactNode;
  sortable?: boolean;
  sortValue?: (row: any) => string | number;
  className?: string;
}

export interface FilterConfig {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}

interface Props {
  data: any[];
  columns: Column[];
  searchKeys: string[];
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  pageSize?: number;
  toolbar?: ReactNode;
  getRowId: (row: any) => string;
}

export function DataTable({
  data, columns, searchKeys, searchPlaceholder = 'Search...',
  filters = [], pageSize = 8, toolbar, getRowId,
}: Props) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  // Step 1: filter by search text
  // Step 2: sort by selected column
  const result = useMemo(() => {
    let rows = data;

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((row) =>
        searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(q))
      );
    }

    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col?.sortValue) {
        rows = [...rows].sort((a, b) => {
          const av = col.sortValue!(a);
          const bv = col.sortValue!(b);
          if (av < bv) return sortDir === 'asc' ? -1 : 1;
          if (av > bv) return sortDir === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }

    return rows;
  }, [data, search, searchKeys, sortKey, sortDir, columns]);

  // Pagination math
  const totalPages = Math.max(1, Math.ceil(result.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageRows = result.slice(start, start + pageSize);

  // Click a sortable header: first click sorts ascending, second descending
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search + Filters toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <Select key={f.label} value={f.value} onValueChange={(v) => { f.onChange(v); setPage(1); }}>
              <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder={f.label} /></SelectTrigger>
              <SelectContent>
                {f.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          ))}
          {toolbar}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.sortable ? (
                    <button onClick={() => handleSort(col.key)} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                      {col.header}
                      {sortKey === col.key && (sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </button>
                  ) : col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row) => (
                <TableRow key={getRowId(row)} className="animate-fade-in">
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>{col.render(row)}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {result.length === 0 ? '0' : `${start + 1}-${Math.min(start + pageSize, result.length)}`} of {result.length}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-2">{currentPage} / {totalPages}</span>
          <Button variant="outline" size="icon" disabled={currentPage >= totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

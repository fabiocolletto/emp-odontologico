(function registerBaseDataTable(global) {
  const namespace = global.OdontoFlowTableComponents = global.OdontoFlowTableComponents || {};

  const getResponsiveTableRowsPerPage = ({ compact = false } = {}) => {
    if (typeof window === 'undefined') return 5;
    const width = window.innerWidth;
    if (compact) {
      if (width >= 768) return 4;
      return 3;
    }
    if (width >= 1536) return 8;
    if (width >= 1280) return 7;
    if (width >= 1024) return 6;
    if (width >= 768) return 5;
    return 4;
  };

  const normalizeSortValue = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number') return value;
    if (value instanceof Date) return value.getTime();
    const stringValue = String(value).trim();
    if (!stringValue) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
      const date = new Date(`${stringValue}T00:00:00`);
      const time = date.getTime();
      if (!Number.isNaN(time)) return time;
    }
    return stringValue.toLocaleLowerCase('pt-BR');
  };

  namespace.createEmptyState = () => ({ message = 'Nenhum registro encontrado.' }) => (
    <div className="py-6 text-center text-sm text-slate-500">{message}</div>
  );

  namespace.createDataTable = ({ EmptyState, AppIcon }) => ({
    columns,
    rows,
    emptyMessage = 'Sem dados para exibir.',
    paginated = false,
    compact = false,
    keepEmptyRows = false,
    footerTotals = []
  }) => {
    const { useEffect, useMemo, useState } = React;
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [rowsPerPage, setRowsPerPage] = useState(() => (paginated ? getResponsiveTableRowsPerPage({ compact }) : Math.max(rows.length, 1)));
    const [viewportWidth, setViewportWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1280));

    useEffect(() => {
      const syncViewportWidth = () => setViewportWidth(window.innerWidth);
      syncViewportWidth();
      window.addEventListener('resize', syncViewportWidth);
      return () => window.removeEventListener('resize', syncViewportWidth);
    }, []);

    const visibleColumns = useMemo(() => columns.filter((column) => (
      typeof column.hideBelow !== 'number' || viewportWidth >= column.hideBelow
    )), [columns, viewportWidth]);

    useEffect(() => {
      if (!sortConfig.key) return;
      if (visibleColumns.some((column) => column.key === sortConfig.key)) return;
      setSortConfig({ key: null, direction: 'asc' });
    }, [sortConfig.key, visibleColumns]);

    useEffect(() => {
      if (!paginated) return undefined;

      const syncRowsPerPage = () => {
        setRowsPerPage(getResponsiveTableRowsPerPage({ compact }));
      };

      syncRowsPerPage();
      window.addEventListener('resize', syncRowsPerPage);
      return () => window.removeEventListener('resize', syncRowsPerPage);
    }, [compact, paginated]);

    const sortedRows = useMemo(() => {
      if (!sortConfig.key) return rows;
      const activeColumn = visibleColumns.find((column) => column.key === sortConfig.key);
      if (!activeColumn || activeColumn.sortable === false) return rows;

      return [...rows].sort((leftRow, rightRow) => {
        const leftValue = normalizeSortValue(activeColumn.sortValue ? activeColumn.sortValue(leftRow) : leftRow[activeColumn.key]);
        const rightValue = normalizeSortValue(activeColumn.sortValue ? activeColumn.sortValue(rightRow) : rightRow[activeColumn.key]);

        if (typeof leftValue === 'number' && typeof rightValue === 'number') {
          return sortConfig.direction === 'asc' ? leftValue - rightValue : rightValue - leftValue;
        }

        const result = String(leftValue).localeCompare(String(rightValue), 'pt-BR', { numeric: true, sensitivity: 'base' });
        return sortConfig.direction === 'asc' ? result : -result;
      });
    }, [rows, sortConfig.direction, sortConfig.key, visibleColumns]);

    const totalPages = paginated ? Math.max(1, Math.ceil(sortedRows.length / rowsPerPage)) : 1;

    useEffect(() => {
      if (!paginated) return;
      setCurrentPage((current) => Math.min(current, totalPages));
    }, [paginated, totalPages, sortedRows.length]);

    const toggleSort = (column) => {
      if (column.sortable === false) return;
      setSortConfig((current) => {
        if (current.key !== column.key) return { key: column.key, direction: 'asc' };
        return { key: column.key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      });
      setCurrentPage(1);
    };

    const visibleRows = paginated
      ? sortedRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
      : sortedRows;
    const placeholderRowsCount = keepEmptyRows && paginated ? Math.max(rowsPerPage - visibleRows.length, 0) : 0;

    return (
      <div className="data-table-shell">
        <div className="data-table__scroller">
          <table className={`data-table min-w-full text-sm ${compact ? 'data-table--compact' : ''}`.trim()}>
            <thead>
              <tr className="text-slate-400">
                {visibleColumns.map((column) => (
                  <th key={column.key} className="data-table__head-cell text-left py-2 pr-3">
                    <button
                      type="button"
                      className={`data-table__head-button ${column.sortable === false ? 'data-table__head-button--disabled' : ''}`.trim()}
                      onClick={() => toggleSort(column)}
                      disabled={column.sortable === false}
                      aria-label={column.sortable === false ? `${column.label} sem ordenação` : `Ordenar por ${column.label}`}
                    >
                      <span>{column.label}</span>
                      {column.sortable === false ? null : (
                        <span className="data-table__sort-indicator" aria-hidden="true">
                          {sortConfig.key === column.key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                        </span>
                      )}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length}><EmptyState message={emptyMessage} /></td>
                </tr>
              ) : visibleRows.map((row) => (
                <tr key={row.key} className="data-table__row">
                  {visibleColumns.map((column) => (
                    <td key={`${row.key}-${column.key}`} className="data-table__cell py-2 pr-3">{column.render(row)}</td>
                  ))}
                </tr>
              ))}
              {Array.from({ length: placeholderRowsCount }).map((_, index) => (
                <tr key={`placeholder-${index}`} className="data-table__row data-table__row--placeholder" aria-hidden="true">
                  {visibleColumns.map((column) => (
                    <td key={`placeholder-${index}-${column.key}`} className="data-table__cell py-2 pr-3">&nbsp;</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(footerTotals.length > 0 || (paginated && totalPages > 1)) ? (
          <div className="data-table__footer">
            {footerTotals.length > 0 ? (
              <div className="data-table__totals" aria-label="Totalizadores da tabela">
                {footerTotals.map((item) => (
                  <p key={item.label} className={`data-table__total-item ${item.toneClassName || ''}`.trim()}>
                    <span>{item.label}:</span>
                    <strong>{item.value}</strong>
                  </p>
                ))}
              </div>
            ) : <span />}
            {paginated && totalPages > 1 ? (
              <div className="data-table__pagination">
                <p className="data-table__pagination-label">Pág. {currentPage} de {totalPages}</p>
                <div className="data-table__pagination-actions">
                  <button
                    type="button"
                    className="data-table__page-button"
                    onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                    disabled={currentPage <= 1}
                    aria-label="Página anterior"
                  >
                    <AppIcon name="chevron-left" size={13} />
                    <span>Anterior</span>
                  </button>
                  <button
                    type="button"
                    className="data-table__page-button"
                    onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                    disabled={currentPage >= totalPages}
                    aria-label="Próxima página"
                  >
                    <span>Próxima</span>
                    <AppIcon name="chevron-right" size={13} />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  };
}(globalThis));

(function registerFinancialTableSectionCard(global) {
  const namespace = global.OdontoFlowFinancialComponents = global.OdontoFlowFinancialComponents || {};
  const { useState } = React;

  namespace.createFinancialTableSectionCard = ({ SectionCard, DataTable, FinancialEditAction, FinancialWidgetFooter }) => (
    {
      title,
      columns,
      rows,
      emptyMessage,
      onAdd,
      addAriaLabel,
      onToggleFilter,
      isFilterOpen = false,
      filterDropdown = null,
      filterAriaLabel,
      footerTotals = [],
      hideActionColumnOnMain = true
    }
  ) => {
    const [isFocusOpen, setIsFocusOpen] = useState(false);
    const isActionColumn = (column) => /(a[cç][aã]o|a[cç][oõ]es)/i.test(String(column?.key || '')) || /(a[cç][aã]o|a[cç][oõ]es)/i.test(String(column?.label || ''));
    const mainColumns = hideActionColumnOnMain ? columns.filter((column) => !isActionColumn(column)) : columns;
    const totalColumn = columns.find((column) => /valor|saldo/i.test(column.key || ''));
    const hasNumericValues = totalColumn
      ? rows.some((row) => {
        const raw = row[totalColumn.key];
        return raw !== '' && raw !== null && raw !== undefined && !Number.isNaN(Number(raw));
      })
      : false;
    const numericTotal = totalColumn
      ? rows.reduce((acc, row) => acc + Number(row[totalColumn.key] || 0), 0)
      : 0;
    const focusFooterTotals = [
      { label: 'Registros', value: rows.length },
      ...(hasNumericValues
        ? [{ label: 'Total', value: numericTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }]
        : [])
    ];

    return (
      <>
        <SectionCard
          className="financial-section-card financial-section-card--operation"
          title={title}
          actions={(
            <div className="financial-widget-actions">
              <FinancialEditAction
                ariaLabel={`Abrir ${title.toLowerCase()} em tela focada`}
                onClick={() => setIsFocusOpen(true)}
                icon="expand"
              />
              <FinancialEditAction
                ariaLabel={addAriaLabel}
                onClick={onAdd}
                icon="plus"
              />
              <div className="financial-widget-actions__filter">
                <FinancialEditAction
                  ariaLabel={filterAriaLabel}
                  onClick={onToggleFilter}
                  icon="filter"
                  className={isFilterOpen ? 'is-active' : ''}
                />
                {isFilterOpen ? <div className="financial-widget-actions__dropdown">{filterDropdown}</div> : null}
              </div>
            </div>
          )}
        >
          <DataTable
            columns={mainColumns}
            rows={rows}
            emptyMessage={emptyMessage}
            paginated
            compact
            keepEmptyRows
          />
          <FinancialWidgetFooter totals={footerTotals} />
        </SectionCard>

        {isFocusOpen ? (
          <div className="finance-overlay" onClick={() => setIsFocusOpen(false)}>
            <div className="finance-overlay__panel financial-focus-overlay__panel" onClick={(event) => event.stopPropagation()}>
              <SectionCard
                className="financial-modal-card financial-focus-card"
                title={title}
                actions={(
                  <div className="financial-widget-actions">
                    <FinancialEditAction
                      ariaLabel={addAriaLabel}
                      onClick={onAdd}
                      icon="plus"
                    />
                    <FinancialEditAction
                      ariaLabel="Fechar visão focada"
                      onClick={() => setIsFocusOpen(false)}
                      icon="close"
                    />
                  </div>
                )}
              >
                <DataTable
                  columns={columns}
                  rows={rows}
                  emptyMessage={emptyMessage}
                  footerTotals={focusFooterTotals}
                />
              </SectionCard>
            </div>
          </div>
        ) : null}
      </>
    );
  };
}(globalThis));

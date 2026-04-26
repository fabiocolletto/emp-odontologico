(function registerFinancialTablePanelCard(global) {
  const namespace = global.OdontoFlowFinancialComponents = global.OdontoFlowFinancialComponents || {};
  const { useState } = React;

  namespace.createFinancialTablePanelCard = ({ PanelCard, DataTable, FinancialEditAction }) => (
    {
      title,
      columns,
      rows,
      onAdd,
      addAriaLabel,
      onToggleFilter,
      isFilterOpen = false,
      filterDropdown = null,
      filterAriaLabel,
      footerClassName = '',
      footerValue = '',
      layout = 'double',
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
    const resolvedFooterValue = footerValue || (hasNumericValues ? numericTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '');

    return (
      <>
        <PanelCard
          className={`financial-panel-card financial-widget-container financial-widget-container--${layout}`.trim()}
          title={title}
          extra={(
            <div className="financial-widget-actions">
              <FinancialEditAction
                ariaLabel={`Abrir ${title.toLowerCase()} em tela focada`}
                onClick={() => setIsFocusOpen(true)}
                icon="expand"
              />
              <div className="financial-widget-actions__filter">
                <FinancialEditAction
                  ariaLabel={filterAriaLabel || `Filtrar ${title.toLowerCase()}`}
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
            paginated
            compact
            keepEmptyRows
            footerTotals={[
              { label: 'Registros', value: rows.length },
              ...(footerValue ? [{ label: 'Total', value: footerValue, toneClassName: footerClassName }] : [])
            ]}
          />
        </PanelCard>

        {isFocusOpen ? (
          <div className="finance-overlay" onClick={() => setIsFocusOpen(false)}>
            <div className="finance-overlay__panel financial-focus-overlay__panel" onClick={(event) => event.stopPropagation()}>
              <PanelCard
                className="financial-modal-card financial-focus-card financial-widget-container financial-widget-container--single"
                title={title}
                extra={(
                  <div className="financial-widget-actions">
                    <FinancialEditAction
                      ariaLabel={addAriaLabel || `Adicionar em ${title.toLowerCase()}`}
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
                  footerTotals={[
                    { label: 'Registros', value: rows.length },
                    ...(resolvedFooterValue ? [{ label: 'Total', value: resolvedFooterValue, toneClassName: footerClassName }] : [])
                  ]}
                />
              </PanelCard>
            </div>
          </div>
        ) : null}
      </>
    );
  };
}(globalThis));

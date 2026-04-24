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
      footerValue = ''
    }
  ) => {
    const [isFocusOpen, setIsFocusOpen] = useState(false);

    return (
      <>
        <PanelCard
          className="financial-panel-card"
          title={title}
          extra={(
            <div className="financial-widget-actions">
              <FinancialEditAction
                ariaLabel={`Abrir ${title.toLowerCase()} em tela focada`}
                onClick={() => setIsFocusOpen(true)}
                icon="expand"
              />
              <FinancialEditAction
                ariaLabel={addAriaLabel || `Adicionar em ${title.toLowerCase()}`}
                onClick={onAdd}
                icon="plus"
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
            columns={columns}
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
                className="financial-modal-card financial-focus-card"
                title={`${title} · visão focada`}
                extra={(
                  <FinancialEditAction
                    ariaLabel="Fechar visão focada"
                    onClick={() => setIsFocusOpen(false)}
                    icon="close"
                  />
                )}
              >
                <DataTable
                  columns={columns}
                  rows={rows}
                  footerTotals={[
                    { label: 'Registros', value: rows.length },
                    ...(footerValue ? [{ label: 'Total', value: footerValue, toneClassName: footerClassName }] : [])
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

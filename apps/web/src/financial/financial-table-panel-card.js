(function registerFinancialTablePanelCard(global) {
  const namespace = global.OdontoFlowFinancialComponents = global.OdontoFlowFinancialComponents || {};

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
  ) => (
    <PanelCard
      className="financial-panel-card"
      title={title}
      extra={(
        <div className="financial-widget-actions">
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
  );
}(globalThis));

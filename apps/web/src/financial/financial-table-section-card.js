(function registerFinancialTableSectionCard(global) {
  const namespace = global.OdontoFlowFinancialComponents = global.OdontoFlowFinancialComponents || {};

  namespace.createFinancialTableSectionCard = ({ SectionCard, DataTable, FinancialEditAction }) => (
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
      footer = null
    }
  ) => (
    <SectionCard
      className="financial-section-card"
      title={title}
      actions={(
        <div className="financial-widget-actions">
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
        columns={columns}
        rows={rows}
        emptyMessage={emptyMessage}
        paginated
        compact
        keepEmptyRows
      />
      {footer}
    </SectionCard>
  );
}(globalThis));

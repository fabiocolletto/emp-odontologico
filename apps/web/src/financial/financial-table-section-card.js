(function registerFinancialTableSectionCard(global) {
  const namespace = global.OdontoFlowFinancialComponents = global.OdontoFlowFinancialComponents || {};
  const { useState } = React;

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
  ) => {
    const [isFocusOpen, setIsFocusOpen] = useState(false);

    return (
      <>
        <SectionCard
          className="financial-section-card"
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
            columns={columns}
            rows={rows}
            emptyMessage={emptyMessage}
            paginated
            compact
            keepEmptyRows
          />
          {footer}
        </SectionCard>

        {isFocusOpen ? (
          <div className="finance-overlay" onClick={() => setIsFocusOpen(false)}>
            <div className="finance-overlay__panel financial-focus-overlay__panel" onClick={(event) => event.stopPropagation()}>
              <SectionCard
                className="financial-modal-card financial-focus-card"
                title={`${title} · visão focada`}
                actions={(
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
                  emptyMessage={emptyMessage}
                />
              </SectionCard>
            </div>
          </div>
        ) : null}
      </>
    );
  };
}(globalThis));

(function registerFinancialTableSectionCard(global) {
  const namespace = global.OdontoFlowFinancialComponents = global.OdontoFlowFinancialComponents || {};

  namespace.createFinancialTableSectionCard = ({ SectionCard, DataTable, FinancialEditAction }) => (
    {
      title,
      columns,
      rows,
      emptyMessage,
      onEdit,
      editAriaLabel,
      footer = null
    }
  ) => (
    <SectionCard
      className="financial-section-card"
      title={title}
      actions={(
        <FinancialEditAction
          ariaLabel={editAriaLabel}
          onClick={onEdit}
        />
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

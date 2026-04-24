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
      />
      {footer}
    </SectionCard>
  );
}(globalThis));

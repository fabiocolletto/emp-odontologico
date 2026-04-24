(function registerFinancialTablePanelCard(global) {
  const namespace = global.OdontoFlowFinancialComponents = global.OdontoFlowFinancialComponents || {};

  namespace.createFinancialTablePanelCard = ({ PanelCard, DataTable, FinancialEditAction }) => (
    {
      title,
      columns,
      rows,
      onEdit,
      footerClassName = '',
      footerValue = ''
    }
  ) => (
    <PanelCard
      className="financial-panel-card"
      title={title}
      extra={<FinancialEditAction ariaLabel={`Editar ${title.toLowerCase()}`} onClick={onEdit} />}
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

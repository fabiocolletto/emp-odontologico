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
      title={title}
      extra={<FinancialEditAction ariaLabel={`Editar ${title.toLowerCase()}`} onClick={onEdit} />}
    >
      <DataTable
        columns={columns}
        rows={rows}
        paginated
        compact
      />
      {footerValue ? <div className={`mt-3 text-right text-sm font-black ${footerClassName}`.trim()}>{footerValue}</div> : null}
    </PanelCard>
  );
}(globalThis));

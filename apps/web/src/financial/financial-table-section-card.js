(function registerFinancialTableSectionCard(global) {
  const namespace = global.OdontoFlowFinancialComponents = global.OdontoFlowFinancialComponents || {};
  const { useState } = React;

  namespace.createFinancialTableSectionCard = ({ FinancialWidgetFrame, DataTable, FinancialEditAction }) => (
    {
      title,
      titleIcon = null,
      titleToneClass = '',
      columns,
      rows,
      emptyMessage,
      onAdd,
      addAriaLabel,
      footerTotals = [],
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
    const focusFooterTotals = [
      { label: 'Registros', value: rows.length },
      ...(hasNumericValues
        ? [{ label: 'Total', value: numericTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }]
        : [])
    ];
    return (
      <>
        <FinancialWidgetFrame
          variant="table"
          size={layout}
          className="financial-section-card financial-section-card--operation"
          title={title}
          titleIcon={titleIcon}
          titleToneClass={titleToneClass}
          actions={(
            <>
              <FinancialEditAction
                ariaLabel={`Abrir ${title.toLowerCase()} em tela focada`}
                onClick={() => setIsFocusOpen(true)}
                icon="expand"
              />
            </>
          )}
        >
          <DataTable
            columns={mainColumns}
            rows={rows}
            emptyMessage={emptyMessage}
            paginated
            compact
            keepEmptyRows={false}
            footerClassName="financial-widget__footer"
            footerTotals={footerTotals}
          />
        </FinancialWidgetFrame>

        {isFocusOpen ? (
          <div className="finance-overlay" onClick={() => setIsFocusOpen(false)}>
            <div className="finance-overlay__panel financial-focus-overlay__panel" onClick={(event) => event.stopPropagation()}>
              <FinancialWidgetFrame
                variant="table"
                size="single"
                className="financial-modal-card financial-focus-card"
                title={title}
                titleIcon={titleIcon}
                titleToneClass={titleToneClass}
                actions={(
                  <>
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
                  </>
                )}
              >
                <DataTable
                  columns={columns}
                  rows={rows}
                  emptyMessage={emptyMessage}
                  footerClassName="financial-widget__footer"
                  footerTotals={focusFooterTotals}
                />
              </FinancialWidgetFrame>
            </div>
          </div>
        ) : null}
      </>
    );
  };
}(globalThis));

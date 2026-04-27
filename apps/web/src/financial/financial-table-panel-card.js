(function registerFinancialTablePanelCard(global) {
  const namespace = global.OdontoFlowFinancialComponents = global.OdontoFlowFinancialComponents || {};
  const { useState } = React;

  namespace.createFinancialTablePanelCard = ({ FinancialWidgetFrame, DataTable, FinancialEditAction }) => (
    {
      title,
      titleIcon = null,
      titleToneClass = '',
      columns,
      rows,
      onAdd,
      addAriaLabel,
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
        <FinancialWidgetFrame
          variant="table"
          size={layout}
          className="financial-panel-card"
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
            paginated
            compact
            keepEmptyRows
            footerClassName="financial-widget__footer"
            footerTotals={[
              { label: 'Registros', value: rows.length },
              ...(footerValue ? [{ label: 'Total', value: footerValue, toneClassName: footerClassName }] : [])
            ]}
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
                      ariaLabel={addAriaLabel || `Adicionar em ${title.toLowerCase()}`}
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
                  footerClassName="financial-widget__footer"
                  footerTotals={[
                    { label: 'Registros', value: rows.length },
                    ...(resolvedFooterValue ? [{ label: 'Total', value: resolvedFooterValue, toneClassName: footerClassName }] : [])
                  ]}
                />
              </FinancialWidgetFrame>
            </div>
          </div>
        ) : null}
      </>
    );
  };
}(globalThis));

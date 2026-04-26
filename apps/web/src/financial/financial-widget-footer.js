(function registerFinancialWidgetFooter(global) {
  const namespace = global.OdontoFlowFinancialComponents = global.OdontoFlowFinancialComponents || {};

  namespace.createFinancialWidgetFooter = () => (
    {
      totals = []
    }
  ) => {
    if (!Array.isArray(totals) || totals.length === 0) return null;

    return (
      <div className="financial-widget-totalizer">
        {totals.map((item) => (
          <p key={item.label}>
            <span>{item.label}</span>
            <strong className={item.toneClassName || ''}>{item.value}</strong>
          </p>
        ))}
      </div>
    );
  };
}(globalThis));

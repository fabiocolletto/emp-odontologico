(function registerFinancialEditAction(global) {
  const namespace = global.OdontoFlowFinancialComponents = global.OdontoFlowFinancialComponents || {};

  namespace.createFinancialEditAction = ({ AppIcon }) => (
    { ariaLabel, onClick, icon = 'edit', className = '' }
  ) => (
    <button type="button" className={`financial-row-actions__icon text-sky-600 ${className}`.trim()} aria-label={ariaLabel || 'Ação'} onClick={onClick}>
      <AppIcon name={icon} size={16} />
    </button>
  );
}(globalThis));

(function registerFinancialEditAction(global) {
  const namespace = global.OdontoFlowFinancialComponents = global.OdontoFlowFinancialComponents || {};

  namespace.createFinancialEditAction = ({ AppIcon }) => (
    { ariaLabel, onClick }
  ) => (
    <button type="button" className="financial-row-actions__icon text-sky-600" aria-label={ariaLabel || 'Editar'} onClick={onClick}>
      <AppIcon name="edit" size={16} />
    </button>
  );
}(globalThis));

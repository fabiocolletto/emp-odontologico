(function registerFinancialEditAction(global) {
  const namespace = global.OdontoFlowFinancialComponents = global.OdontoFlowFinancialComponents || {};

  namespace.createFinancialEditAction = ({ ActionButton, AppIcon }) => (
    { label = 'Editar', ariaLabel, onClick }
  ) => (
    <ActionButton
      label={label}
      ariaLabel={ariaLabel}
      className="btn--header btn--header-muted btn--icon-compact"
      icon={<AppIcon name="edit" size={14} />}
      onClick={onClick}
    />
  );
}(globalThis));

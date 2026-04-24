(function registerProfileActionRow(global) {
  const namespace = global.OdontoFlowProfileBlocks = global.OdontoFlowProfileBlocks || {};

  namespace.createProfileActionRow = ({ ActionButton, AppIcon }) => ({ actions = [] }) => (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <ActionButton
          key={action.key}
          label={action.label}
          ariaLabel={action.ariaLabel || action.label}
          className={action.className || 'btn--ghost modal-header__btn modal-action-btn modal-action-btn--info modal-action-btn--icon-first modal-action-btn--uniform'}
          icon={<AppIcon name={action.icon || 'edit'} size={action.iconSize || 20} className="modal-action-btn__icon" />}
          onClick={action.onClick}
          disabled={action.disabled}
        />
      ))}
    </div>
  );
}(globalThis));

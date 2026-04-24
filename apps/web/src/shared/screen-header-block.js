(function registerScreenHeaderBlock(global) {
  const namespace = global.OdontoFlowScreenBlocks = global.OdontoFlowScreenBlocks || {};

  namespace.createScreenHeaderBlock = ({ Toolbar, ActionButton, AppIcon }) => (
    {
      header,
      showToolbar = false,
      toolbarActions = []
    }
  ) => (
    <>
      {header}
      {showToolbar ? (
        <div className="flex justify-end">
          <Toolbar>
            {toolbarActions.map((action) => (
              <ActionButton
                key={action.key}
                label={action.label}
                className={action.className || 'btn--header btn--header-muted'}
                icon={action.icon ? <AppIcon name={action.icon} size={14} /> : null}
                onClick={action.onClick}
              />
            ))}
          </Toolbar>
        </div>
      ) : null}
    </>
  );
}(globalThis));

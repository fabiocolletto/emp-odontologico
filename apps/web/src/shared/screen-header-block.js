(function registerScreenHeaderBlock(global) {
  const namespace = global.OdontoFlowScreenBlocks = global.OdontoFlowScreenBlocks || {};

  namespace.createScreenHeaderBlock = ({ Toolbar, ActionButton, AppIcon }) => (
    {
      header,
      showToolbar = false,
      toolbarActions = []
    }
  ) => (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
      <div className="min-w-0 flex-1">
        {header}
      </div>
      {showToolbar ? (
        <div className="flex justify-start md:justify-end md:pt-1">
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
    </div>
  );
}(globalThis));

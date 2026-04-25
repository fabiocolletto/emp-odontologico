(function registerSidebarScreenHeader(global) {
  const namespace = global.OdontoFlowScreenBlocks = global.OdontoFlowScreenBlocks || {};

  namespace.createSidebarScreenHeader = ({ AppHeader, PageHeader }) => (
    {
      icon,
      title,
      subtitle,
      actions = [],
      breadcrumb = []
    }
  ) => (
    <AppHeader>
      {breadcrumb.length ? (
        <nav className="sidebar-screen-header__breadcrumb" aria-label="Breadcrumb">
          {breadcrumb.map((item, index) => (
            <span key={`${item.label}-${index}`} className="sidebar-screen-header__crumb">
              {item.onClick ? (
                <button type="button" onClick={item.onClick}>{item.label}</button>
              ) : (
                <strong>{item.label}</strong>
              )}
              {index < breadcrumb.length - 1 ? <span>/</span> : null}
            </span>
          ))}
        </nav>
      ) : null}
      <PageHeader icon={icon} title={title} subtitle={subtitle} actions={actions} />
    </AppHeader>
  );
}(globalThis));

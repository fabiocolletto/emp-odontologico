(function registerSidebarScreenHeader(global) {
  const namespace = global.OdontoFlowScreenBlocks = global.OdontoFlowScreenBlocks || {};

  namespace.createSidebarScreenHeader = ({ AppHeader, PageHeader }) => (
    {
      icon,
      title,
      subtitle,
      actions = [],
      navigation = null
    }
  ) => (
    <AppHeader>
      <PageHeader icon={icon} title={title} subtitle={subtitle} actions={actions} />
      {navigation}
    </AppHeader>
  );
}(globalThis));

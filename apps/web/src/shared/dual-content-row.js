(function registerDualContentRow(global) {
  const namespace = global.OdontoFlowScreenBlocks = global.OdontoFlowScreenBlocks || {};

  namespace.createDualContentRow = ({ ContentGrid }) => (
    {
      left,
      right
    }
  ) => (
    <ContentGrid columns="2">
      {left}
      {right}
    </ContentGrid>
  );
}(globalThis));

(function registerKpiGridRow(global) {
  const namespace = global.OdontoFlowScreenBlocks = global.OdontoFlowScreenBlocks || {};

  namespace.createKpiGridRow = ({ ContentGrid, StatCard }) => (
    {
      columns = '4',
      kpis = []
    }
  ) => (
    <ContentGrid columns={columns}>
      {kpis.map((kpi) => (
        <StatCard
          key={kpi.label}
          label={kpi.label}
          value={kpi.value}
          trend={`${kpi.trend} vs mês anterior`}
          trendTone={kpi.tone}
          sparkPoints={kpi.sparkPoints}
          sparkColor={kpi.sparkColor}
          sparkVariant={kpi.sparkVariant}
        />
      ))}
    </ContentGrid>
  );
}(globalThis));

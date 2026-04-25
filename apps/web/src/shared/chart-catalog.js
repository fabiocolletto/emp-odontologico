(function registerOdontoFlowChartCatalog(global) {
  const namespace = global.OdontoFlowChartCatalog = global.OdontoFlowChartCatalog || {};

  const normalizePoints = (points = []) => {
    if (!Array.isArray(points) || !points.length) return [0];
    return points.map((value) => Number(value || 0));
  };

  const toPolylinePath = (points = [], width = 140, height = 56, padding = 6) => {
    const safePoints = normalizePoints(points);
    const max = Math.max(...safePoints, 1);
    const min = Math.min(...safePoints, 0);
    const range = Math.max(max - min, 1);
    const availableWidth = width - (padding * 2);
    const availableHeight = height - (padding * 2);

    return safePoints.map((point, index) => {
      const x = padding + ((safePoints.length <= 1 ? 0 : index / (safePoints.length - 1)) * availableWidth);
      const ratio = (point - min) / range;
      const y = padding + ((1 - ratio) * availableHeight);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');
  };

  namespace.createChartDonut = () => ({ value = 0, label = '', tone = '#3b82f6', size = 84 }) => {
    const boundedValue = Math.min(Math.max(Number(value || 0), 0), 1);
    const degrees = Math.round(boundedValue * 360);
    return (
      <div
        className="chart-donut"
        style={{ '--chart-donut-progress': `${degrees}deg`, '--chart-donut-tone': tone, width: `${size}px`, height: `${size}px` }}
      >
        <span>{label}</span>
      </div>
    );
  };

  namespace.createChartSparkLine = () => ({ points = [], tone = '#3b82f6', height = 56, strokeWidth = 2 }) => {
    const safePoints = normalizePoints(points);
    const path = toPolylinePath(safePoints, 140, height, 6);

    return (
      <svg className="chart-sparkline" viewBox={`0 0 140 ${height}`} preserveAspectRatio="none" role="img" aria-label="Linha de tendência">
        <polyline points={path} fill="none" stroke={tone} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  namespace.createChartSparkArea = () => ({ points = [], tone = '#0ea5e9', height = 56 }) => {
    const safePoints = normalizePoints(points);
    const linePath = toPolylinePath(safePoints, 140, height, 6);
    const firstX = linePath.split(' ')[0]?.split(',')[0] || '6';
    const lastX = linePath.split(' ').at(-1)?.split(',')[0] || '134';
    const areaPath = `${linePath} ${lastX},${height - 2} ${firstX},${height - 2}`;

    return (
      <svg className="chart-sparkline" viewBox={`0 0 140 ${height}`} preserveAspectRatio="none" role="img" aria-label="Área de tendência">
        <polygon points={areaPath} fill={tone} opacity="0.2" />
        <polyline points={linePath} fill="none" stroke={tone} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };
}(globalThis));

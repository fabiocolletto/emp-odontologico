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

  namespace.createChartTrendLine = ({ formatValue = (value) => value } = {}) => ({
    points = [],
    tone = '#3b82f6',
    width = 280,
    height = 92,
    leftPad = 32,
    rightPad = 8,
    topPad = 10,
    bottomPad = 20,
    ariaLabel = 'Tendência'
  }) => {
    const safePoints = normalizePoints(points).map((value, index) => ({ value, label: `M${index + 1}` }));
    const max = Math.max(...safePoints.map((item) => item.value), 1);
    const min = Math.min(...safePoints.map((item) => item.value), 0);
    const range = Math.max(max - min, 1);
    const usableWidth = Math.max(width - leftPad - rightPad, 1);
    const usableHeight = Math.max(height - topPad - bottomPad, 1);
    const xStep = safePoints.length > 1 ? usableWidth / (safePoints.length - 1) : 0;
    const yFor = (value) => topPad + ((max - value) / range) * usableHeight;
    const chartPoints = safePoints.map((item, index) => ({ ...item, x: leftPad + (xStep * index), y: yFor(item.value) }));
    const polyline = chartPoints.map((item) => `${item.x},${item.y}`).join(' ');
    const yTicks = [max, max - (range / 3), max - ((range * 2) / 3), min];

    return (
      <div className="financial-hero-widget__trend-linechart">
        <svg viewBox={`0 0 ${width} ${height}`} aria-label={ariaLabel}>
          {yTicks.map((tick, index) => (
            <g key={`grid-${index}`}>
              <line x1={leftPad} x2={width - rightPad} y1={yFor(tick)} y2={yFor(tick)} className="financial-hero-widget__trend-grid" />
              <text x={leftPad - 4} y={yFor(tick) + 3} textAnchor="end" className="financial-hero-widget__trend-y-label">
                {formatValue(tick)}
              </text>
            </g>
          ))}
          <polyline points={polyline} className="financial-hero-widget__trend-line" style={{ stroke: tone }} />
          {chartPoints.map((point) => (
            <g key={`point-${point.label}`}>
              <circle cx={point.x} cy={point.y} r="3.2" className="financial-hero-widget__trend-point" style={{ fill: tone }} />
              <text x={point.x} y={point.y - 7} textAnchor="middle" className="financial-hero-widget__trend-point-label">
                {formatValue(point.value)}
              </text>
              <text x={point.x} y={height - 4} textAnchor="middle" className="financial-hero-widget__trend-x-label">
                {point.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };
}(globalThis));

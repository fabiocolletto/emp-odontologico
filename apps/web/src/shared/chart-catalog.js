(function registerOdontoFlowChartCatalog(global) {
  const ReactRef = global.React;
  const namespace = global.OdontoFlowChartComponents = global.OdontoFlowChartComponents || {};
  const legacyNamespace = global.OdontoFlowChartCatalog = global.OdontoFlowChartCatalog || {};

  const normalizePoints = (points = []) => {
    if (!Array.isArray(points) || !points.length) return [0];
    return points.map((value) => Number(value || 0));
  };

  const createChartInstance = ({ canvas, type, data, options }) => {
    const ChartCtor = global.Chart;
    if (!ChartCtor || !canvas) return null;
    const context = canvas.getContext('2d');
    if (!context) return null;
    return new ChartCtor(context, { type, data, options });
  };

  const destroyChartInstance = (chartRef) => {
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
  };

  const readFallbackTone = (tone) => ({ borderColor: tone, backgroundColor: 'transparent' });

  const buildCompactBarOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 180 },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        border: { display: false },
        ticks: { color: '#94a3b8', font: { size: 10, weight: '600' } }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(148, 163, 184, 0.16)', drawTicks: false, drawBorder: false },
        border: { display: false },
        ticks: { color: '#94a3b8', font: { size: 9 }, maxTicksLimit: 3 }
      }
    },
    layout: {
      padding: { top: 4, right: 8, bottom: 0, left: 4 }
    }
  });

  namespace.createChartDonut = () => ({ value = 0, label = '', tone = '#3b82f6', size = 84 }) => {
    const { useEffect, useMemo, useRef } = ReactRef;
    const canvasRef = useRef(null);
    const chartRef = useRef(null);
    const boundedValue = Math.min(Math.max(Number(value || 0), 0), 1);
    const chartData = useMemo(() => ({
      datasets: [
        {
          data: [boundedValue * 100, Math.max((1 - boundedValue) * 100, 0)],
          backgroundColor: [tone, 'rgba(148, 163, 184, 0.22)'],
          borderWidth: 0,
          hoverOffset: 0
        }
      ]
    }), [boundedValue, tone]);

    useEffect(() => {
      if (!canvasRef.current || !global.Chart) return undefined;

      if (!chartRef.current) {
        chartRef.current = createChartInstance({
          canvas: canvasRef.current,
          type: 'doughnut',
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            animation: { duration: 180 },
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false }
            }
          }
        });
      } else {
        chartRef.current.data = chartData;
        chartRef.current.update('none');
      }

      return () => {
        destroyChartInstance(chartRef);
      };
    }, [chartData]);

    const fallbackTone = readFallbackTone(tone);

    return (
      <div className="of-chart of-chart--donut chart-donut" style={{ width: `${size}px`, height: `${size}px`, ...fallbackTone }}>
        <canvas ref={canvasRef} className="of-chart__canvas" aria-label="Indicador percentual" role="img" />
        <span>{label}</span>
      </div>
    );
  };

  namespace.createChartCompactBar = () => ({ points = [], labels = [], tone = '#3b82f6', maxTicks = 3 }) => {
    const { useEffect, useMemo, useRef } = ReactRef;
    const canvasRef = useRef(null);
    const chartRef = useRef(null);
    const safePoints = normalizePoints(points);
    const safeLabels = labels.length ? labels : safePoints.map((_, index) => `M${index + 1}`);

    const chartData = useMemo(() => ({
      labels: safeLabels,
      datasets: [
        {
          data: safePoints,
          backgroundColor: tone,
          borderRadius: 4,
          borderSkipped: false,
          maxBarThickness: 20,
          categoryPercentage: 0.76,
          barPercentage: 0.88
        }
      ]
    }), [safeLabels.join('|'), safePoints.join('|'), tone]);

    const chartOptions = useMemo(() => {
      const base = buildCompactBarOptions();
      return {
        ...base,
        scales: {
          ...base.scales,
          y: {
            ...base.scales.y,
            ticks: {
              ...base.scales.y.ticks,
              maxTicksLimit: maxTicks
            }
          }
        }
      };
    }, [maxTicks]);

    useEffect(() => {
      if (!canvasRef.current || !global.Chart) return undefined;

      if (!chartRef.current) {
        chartRef.current = createChartInstance({
          canvas: canvasRef.current,
          type: 'bar',
          data: chartData,
          options: chartOptions
        });
      } else {
        chartRef.current.data = chartData;
        chartRef.current.options = chartOptions;
        chartRef.current.update('none');
      }

      return () => {
        destroyChartInstance(chartRef);
      };
    }, [chartData, chartOptions]);

    return (
      <div className="of-chart of-chart--compact-bar">
        <canvas ref={canvasRef} className="of-chart__canvas" aria-label="Gráfico temporal" role="img" />
        {!global.Chart ? <span className="of-chart__fallback">Gráfico indisponível</span> : null}
      </div>
    );
  };

  namespace.createChartSparkLine = () => ({ points = [], tone = '#3b82f6' }) => {
    const { useEffect, useMemo, useRef } = ReactRef;
    const canvasRef = useRef(null);
    const chartRef = useRef(null);
    const safePoints = normalizePoints(points);
    const safeLabels = safePoints.map((_, index) => `M${index + 1}`);

    const chartData = useMemo(() => ({
      labels: safeLabels,
      datasets: [
        {
          data: safePoints,
          borderColor: tone,
          backgroundColor: `${tone}33`,
          fill: true,
          tension: 0.32,
          borderWidth: 2,
          pointRadius: 0
        }
      ]
    }), [safePoints.join('|'), tone]);

    useEffect(() => {
      if (!canvasRef.current || !global.Chart) return undefined;

      if (!chartRef.current) {
        chartRef.current = createChartInstance({
          canvas: canvasRef.current,
          type: 'line',
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 180 },
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: { x: { display: false }, y: { display: false } }
          }
        });
      } else {
        chartRef.current.data = chartData;
        chartRef.current.update('none');
      }

      return () => {
        destroyChartInstance(chartRef);
      };
    }, [chartData]);

    return (
      <div className="of-chart of-chart--compact-line">
        <canvas ref={canvasRef} className="of-chart__canvas" aria-label="Linha de tendência" role="img" />
      </div>
    );
  };

  namespace.createChartSparkArea = namespace.createChartSparkLine;

  Object.assign(legacyNamespace, namespace);
}(globalThis));

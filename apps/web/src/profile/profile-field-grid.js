(function registerProfileFieldGrid(global) {
  const namespace = global.OdontoFlowProfileBlocks = global.OdontoFlowProfileBlocks || {};

  namespace.createProfileFieldGrid = () => ({ items = [] }) => (
    <div className="grid md:grid-cols-2 gap-3 text-sm">
      {items.map((item) => (
        <div key={item.key}>
          <strong>{item.label}:</strong>{' '}
          {item.breakAll ? <span className="break-all">{item.value}</span> : item.value}
        </div>
      ))}
    </div>
  );
}(globalThis));

(function registerOdontoFlowDataSectionLayout(global) {
  const namespace = global.OdontoFlowLayoutPrimitives = global.OdontoFlowLayoutPrimitives || {};

  namespace.createDataSection = () => (
    {
      title,
      description = '',
      actions = null,
      children,
      className = ''
    }
  ) => (
    <section className={`data-section ${className}`.trim()}>
      {(title || description || actions) ? (
        <header className="data-section__header">
          <div className="data-section__meta">
            {title ? <h3 className="data-section__title">{title}</h3> : null}
            {description ? <p className="data-section__description">{description}</p> : null}
          </div>
          {actions ? <div className="data-section__actions">{actions}</div> : null}
        </header>
      ) : null}
      <div className="data-section__body">{children}</div>
    </section>
  );

  namespace.createDataColumns = () => (
    {
      columns = 2,
      children,
      className = ''
    }
  ) => {
    const safeColumns = Math.min(Math.max(Number(columns || 1), 1), 3);
    return (
      <div className={`data-columns data-columns--${safeColumns} ${className}`.trim()}>
        {children}
      </div>
    );
  };
}(globalThis));

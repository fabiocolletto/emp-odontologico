(function registerFinancialPageSections(global) {
  const namespace = global.OdontoFlowFinancialComponents = global.OdontoFlowFinancialComponents || {};

  namespace.createFinancialPageSection = () => (
    {
      title,
      description = '',
      eyebrow = '',
      actions = null,
      children,
      className = ''
    }
  ) => (
    <section className={`financial-page-section ${className}`.trim()}>
      {(title || description || actions || eyebrow) ? (
        <header className="financial-page-section__header">
          <div className="financial-page-section__meta">
            {eyebrow ? <p className="financial-page-section__eyebrow">{eyebrow}</p> : null}
            {title ? <h3 className="financial-page-section__title">{title}</h3> : null}
            {description ? <p className="financial-page-section__description">{description}</p> : null}
          </div>
          {actions ? <div className="financial-page-section__actions">{actions}</div> : null}
        </header>
      ) : null}
      <div className="financial-page-section__body">
        {children}
      </div>
    </section>
  );

  namespace.createFinancialSectionColumns = () => (
    {
      children,
      className = '',
      variant = 'default'
    }
  ) => (
    <div className={`financial-section-columns financial-section-columns--${variant} ${className}`.trim()}>
      {children}
    </div>
  );
}(globalThis));

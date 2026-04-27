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

  namespace.createFinancialWidgetFrame = () => (
    {
      title,
      titleIcon = null,
      titleToneClass = '',
      actions = null,
      children,
      footer = null,
      className = '',
      variant = 'table',
      size = 'double'
    }
  ) => (
    <article className={`financial-widget financial-widget--${variant} financial-widget--${size} ${className}`.trim()}>
      <header className="financial-widget__header">
        <h3 className="financial-widget__title">
          {titleIcon ? <span className={`financial-widget__title-icon ${titleToneClass}`.trim()} aria-hidden="true">{titleIcon}</span> : null}
          <span>{title}</span>
        </h3>
        {actions ? <div className="financial-widget__actions">{actions}</div> : null}
      </header>
      <div className="financial-widget__body">{children}</div>
      {footer ? <footer className="financial-widget__footer">{footer}</footer> : null}
    </article>
  );
}(globalThis));

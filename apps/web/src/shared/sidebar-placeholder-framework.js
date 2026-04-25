import React from 'react';

const SidebarPlaceholderFramework = ({
  title,
  description,
  frameworkLabel,
  layers = [],
  exampleText = []
}) => (
  <article className="sidebar-placeholder-framework">
    <header className="sidebar-placeholder-framework__header">
      <p className="sidebar-placeholder-framework__badge">{frameworkLabel}</p>
      <h3>{title}</h3>
      <p>{description}</p>
    </header>

    <div className="sidebar-placeholder-framework__columns">
      <div className="sidebar-placeholder-framework__column">
        <h4>Camadas do framework</h4>
        <ul>
          {layers.map((layer) => (
            <li key={layer.title}>
              <strong>{layer.title}</strong>
              <span>{layer.description}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-placeholder-framework__column">
        <h4>Textos de exemplo (produção)</h4>
        <ul>
          {exampleText.map((item) => (
            <li key={item.label}>
              <strong>{item.label}</strong>
              <span>{item.content}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </article>
);

export default SidebarPlaceholderFramework;

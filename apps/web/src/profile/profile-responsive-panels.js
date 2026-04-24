(function registerProfileResponsivePanels(global) {
  const namespace = global.OdontoFlowProfileBlocks = global.OdontoFlowProfileBlocks || {};

  namespace.createProfileResponsivePanels = ({ AppIcon }) => (
    {
      isMobileViewport = false,
      panels = [],
      expandedPanel = '',
      onTogglePanel,
      renderPanelContent
    }
  ) => {
    if (isMobileViewport) {
      return (
        <div className="ui-card data-card data-card--g space-y-2">
          {panels.map((panel) => {
            const isOpen = expandedPanel === panel.id;
            return (
              <div key={panel.id} className="border-b border-slate-200 last:border-b-0">
                <button
                  type="button"
                  className="w-full min-h-[64px] flex items-center gap-3 text-left px-1 py-2"
                  onClick={() => onTogglePanel(panel.id)}
                >
                  <span className="inline-flex items-center justify-center text-slate-700">
                    <AppIcon name={panel.icon} size={18} />
                  </span>
                  <span className="flex-1 text-[16px] font-medium text-slate-900">{panel.mobileLabel || panel.title}</span>
                  <AppIcon name={isOpen ? 'chevron-up' : 'chevron-right'} size={16} className="text-slate-400" />
                </button>
                {isOpen ? <div className="pb-3 pl-8 pr-1 text-sm text-slate-600 space-y-3">{renderPanelContent(panel.id)}</div> : null}
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <>
        {panels.map((panel) => (
          <div key={panel.id} className="ui-card data-card data-card--g space-y-4">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">{panel.title}</p>
                {panel.subtitle ? <p className="text-sm text-slate-500">{panel.subtitle}</p> : null}
              </div>
            </div>
            {renderPanelContent(panel.id)}
          </div>
        ))}
      </>
    );
  };
}(globalThis));

(function registerAcessoFlow(global) {
  function renderStandalone() {
    const root = global.document.querySelector('[data-acesso-app]');
    if (!root) return;

    const stepButtons = Array.from(root.querySelectorAll('[data-step]'));
    const stepCards = Array.from(root.querySelectorAll('[data-step-card]'));

    const setActiveStep = (step) => {
      stepButtons.forEach((button) => {
        const isActive = button.dataset.step === step;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-selected', String(isActive));
      });

      stepCards.forEach((card) => {
        card.classList.toggle('is-active', card.dataset.stepCard === step);
      });
    };

    root.addEventListener('click', (event) => {
      const button = event.target.closest('[data-step]');
      if (!button) return;
      setActiveStep(button.dataset.step || '1');
    });

    setActiveStep('1');
  }

  const namespace = global.OdontoFlowAuthComponents = global.OdontoFlowAuthComponents || {};
  namespace.createAcessoLegacyFrame = function createAcessoLegacyFrame() {
    return function AcessoLegacyFrame(props) {
      const src = props?.src || './apps/web/src/auth/acesso.html';
      return global.React.createElement(
        'section',
        { className: 'acesso-page-section acesso-legacy-frame' },
        global.React.createElement('iframe', {
          className: 'acesso-legacy-frame__iframe',
          src,
          title: 'Fluxo de acesso',
          loading: 'lazy'
        })
      );
    };
  };

  if (global.document?.querySelector('[data-acesso-app]')) {
    renderStandalone();
  }
}(globalThis));

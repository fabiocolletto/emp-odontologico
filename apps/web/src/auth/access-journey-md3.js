function OdontoAccessJourneyMd3({
  accessStep = 'choice',
  tabs = [],
  onStepChange,
  onCancel,
  onChooseSignin,
  onChooseSignup,
  onSubmitCredentials,
  onGoogleLogin,
  email = '',
  password = '',
  onEmailChange,
  onPasswordChange,
  authMessage = '',
  authError = '',
  onDismissMessage,
  onDismissError,
  renderIcon
}) {
  const currentHelpText = React.useMemo(() => {
    if (accessStep === 'signup') return 'Preencha seus dados para criar uma nova conta.';
    if (accessStep === 'signin') return 'Informe suas credenciais para entrar no OdontoFlow.';
    return 'Escolha como deseja continuar.';
  }, [accessStep]);

  const icon = (name, label) => (typeof renderIcon === 'function' ? renderIcon(name, label) : null);

  return (
    <div className="confirm-overlay">
      <section className="md3-access-sheet" role="dialog" aria-modal="true" aria-label="Jornada de acesso e cadastro">
        <header className="md3-access-sheet__header">
          <h2 className="md3-access-sheet__title">Jornada de acesso e cadastro</h2>
          <span className="md3-access-sheet__badge">ETAPAS</span>
        </header>

        <div className="md3-access-sheet__body">
          <div className="md3-access-tabs" aria-label="Etapas da jornada">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`md3-access-tab ${accessStep === tab.id ? 'is-active' : ''}`}
                onClick={() => onStepChange?.(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <p className="md3-access-sheet__hint">{currentHelpText}</p>

          {accessStep === 'choice' ? (
            <div className="md3-access-actions md3-access-actions--split">
              <button type="button" className="md3-access-btn md3-access-btn--filled" onClick={onChooseSignin}>
                {icon('check', 'Acessar conta')}
                <span>Acessar conta</span>
              </button>
              <button type="button" className="md3-access-btn md3-access-btn--text" onClick={onChooseSignup}>
                {icon('plus', 'Criar conta')}
                <span>Criar conta</span>
              </button>
            </div>
          ) : null}

          {accessStep === 'signin' || accessStep === 'signup' ? (
            <form
              className="md3-access-form"
              onSubmit={(event) => {
                event.preventDefault();
                onSubmitCredentials?.();
              }}
            >
              <input
                type="email"
                className="ui-input w-full"
                placeholder="seuemail@clinica.com"
                value={email}
                onChange={(event) => onEmailChange?.(event.target.value)}
              />
              <input
                type="password"
                className="ui-input w-full"
                placeholder="Sua senha"
                value={password}
                onChange={(event) => onPasswordChange?.(event.target.value)}
              />
              <div className="md3-access-actions">
                <button type="submit" className="md3-access-btn md3-access-btn--filled">
                  {icon(accessStep === 'signup' ? 'plus' : 'check', accessStep === 'signup' ? 'Criar conta e acessar' : 'Entrar com e-mail')}
                  <span>{accessStep === 'signup' ? 'Criar conta e acessar' : 'Entrar com e-mail'}</span>
                </button>
                <button type="button" className="md3-access-btn md3-access-btn--tonal" onClick={onGoogleLogin}>
                  {icon('users', 'Continuar com Google')}
                  <span>Continuar com Google</span>
                </button>
              </div>
            </form>
          ) : null}

          {authMessage ? (
            <div className="transient-notice transient-notice--success">
              <div className="transient-notice__content">
                {icon('info', 'Mensagem')}
                <span>{authMessage}</span>
              </div>
              <button type="button" className="btn btn--ghost transient-notice__close" onClick={onDismissMessage}>OK</button>
            </div>
          ) : null}

          {authError ? (
            <div className="transient-notice transient-notice--error">
              <div className="transient-notice__content">
                {icon('info', 'Erro')}
                <span>{authError}</span>
              </div>
              <button type="button" className="btn btn--ghost transient-notice__close" onClick={onDismissError}>OK</button>
            </div>
          ) : null}
        </div>

        <footer className="md3-access-sheet__footer">
          <button type="button" className="md3-access-btn md3-access-btn--text" onClick={onCancel}>
            {icon('close', 'Cancelar')}
            <span>Cancelar</span>
          </button>
          {accessStep !== 'choice' ? (
            <button type="button" className="md3-access-btn md3-access-btn--tonal" onClick={() => onStepChange?.('choice')}>
              {icon('chevron-left', 'Voltar')}
              <span>Voltar</span>
            </button>
          ) : null}
        </footer>
      </section>
    </div>
  );
}

globalThis.OdontoAccessJourneyMd3 = OdontoAccessJourneyMd3;

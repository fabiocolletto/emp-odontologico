(function registerAuthEntryModal(global) {
  const namespace = global.OdontoFlowAuthEntry = global.OdontoFlowAuthEntry || {};

  const AuthEntryModal = ({
    mode,
    email,
    password,
    authMessage,
    authError,
    isAuthenticated,
    onSetMode,
    onSetEmail,
    onSetPassword,
    onSignIn,
    onSignUp,
    onGoogle,
    onSetAuthMessage,
    onSetAuthError,
    onCloseNotices,
    onContinueAuthenticated,
    onAuthSuccess
  }) => {
    const dialogRef = React.useRef(null);
    const renderBrandBlock = () => (
      <div className="auth-entry-brand" aria-hidden="true">
        <div className="auth-entry-brand__logo">🦷</div>
        <h2 className="auth-entry-brand__title">
          Odonto<span>Flow</span>
        </h2>
      </div>
    );

    React.useEffect(() => {
      const dialogNode = dialogRef.current;
      if (!dialogNode) return undefined;

      const focusableElements = dialogNode.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      firstFocusable?.focus();

      const trapFocus = (event) => {
        if (event.key !== 'Tab') return;
        if (!focusableElements.length) {
          event.preventDefault();
          return;
        }
        if (event.shiftKey && document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        } else if (!event.shiftKey && document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      };

      dialogNode.addEventListener('keydown', trapFocus);
      return () => dialogNode.removeEventListener('keydown', trapFocus);
    }, [isAuthenticated]);

    return (
      <div className="finance-overlay auth-entry-overlay">
        <div
          ref={dialogRef}
          className="finance-overlay__panel auth-entry-modal ui-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-entry-title"
          aria-describedby="auth-entry-subtitle"
        >
          {isAuthenticated ? (
            <>
              {renderBrandBlock()}
              <div className="auth-entry-header">
                <p className="auth-entry-eyebrow">Primeiro acesso</p>
                <h1 id="auth-entry-title" className="auth-entry-title">Bem-vindo ao OdontoFlow</h1>
                <p id="auth-entry-subtitle" className="auth-entry-subtitle">Seu acesso foi validado. Finalize para abrir o dashboard.</p>
              </div>
              <button type="button" className="auth-entry-action auth-entry-action--primary" onClick={onContinueAuthenticated}>
                Continuar para o dashboard
              </button>
            </>
          ) : (
            <>
              {renderBrandBlock()}
              <div className="auth-entry-header">
                <p className="auth-entry-eyebrow">Acesso seguro</p>
                <h1 id="auth-entry-title" className="auth-entry-title">Entrar no OdontoFlow</h1>
                <p id="auth-entry-subtitle" className="auth-entry-subtitle">Use e-mail e senha ou continue com Google para acessar sua conta.</p>
              </div>

              <namespace.AuthEntryForm
                mode={mode}
                email={email}
                password={password}
                authError={authError}
                onSetMode={onSetMode}
                onSetEmail={onSetEmail}
                onSetPassword={onSetPassword}
                onSignIn={onSignIn}
                onSignUp={onSignUp}
                onGoogle={onGoogle}
                onSetAuthMessage={onSetAuthMessage}
                onSetAuthError={onSetAuthError}
                onAuthSuccess={onAuthSuccess}
              />
            </>
          )}

          <namespace.AuthEntryNotices
            authMessage={authMessage}
            authError={authError}
            onCloseNotices={onCloseNotices}
          />
        </div>
      </div>
    );
  };

  namespace.AuthEntryModal = AuthEntryModal;
}(globalThis));

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
          className="finance-overlay__panel auth-entry-modal ui-card w-full max-w-md space-y-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-entry-title"
        >
          {isAuthenticated ? (
            <>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-sky-700 font-bold">Primeiro acesso</p>
                <h1 id="auth-entry-title" className="text-2xl font-black text-slate-900">Bem-vindo ao OdontoFlow</h1>
                <p className="text-sm text-slate-600 mt-1">Seu acesso foi validado. Finalize para abrir o dashboard.</p>
              </div>
              <button type="button" className="btn btn--primary w-full" onClick={onContinueAuthenticated}>
                Continuar para o dashboard
              </button>
            </>
          ) : (
            <>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-sky-700 font-bold">Acesso seguro</p>
                <h1 id="auth-entry-title" className="text-2xl font-black text-slate-900">Entrar no OdontoFlow</h1>
                <p className="text-sm text-slate-600 mt-1">Crie sua conta e acesse quando quiser, inclusive com Google.</p>
              </div>

              <namespace.AuthEntryForm
                mode={mode}
                email={email}
                password={password}
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

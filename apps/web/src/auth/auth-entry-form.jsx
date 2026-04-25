(function registerAuthEntryForm(global) {
  const namespace = global.OdontoFlowAuthEntry = global.OdontoFlowAuthEntry || {};

  namespace.AuthEntryForm = ({
    mode,
    email,
    password,
    authError,
    onSetMode,
    onSetEmail,
    onSetPassword,
    onSignIn,
    onSignUp,
    onGoogle,
    onSetAuthMessage,
    onSetAuthError,
    onAuthSuccess
  }) => {
    const [attemptedSubmit, setAttemptedSubmit] = React.useState(false);
    const emailError = attemptedSubmit && !email ? 'Informe um e-mail válido.' : '';
    const passwordError = attemptedSubmit && !password ? 'Informe sua senha para continuar.' : '';
    const hasFieldErrors = Boolean(emailError || passwordError);

    const submitCredentials = async (event) => {
      event.preventDefault();
      setAttemptedSubmit(true);
      onSetAuthError('');
      onSetAuthMessage('');

      if (!email || !password) {
        onSetAuthError('Informe e-mail e senha para continuar.');
        return;
      }

      if (mode === 'signup') {
        const { data, error } = await onSignUp({ email, password });
        if (error) {
          onSetAuthError(error.message || 'Não foi possível criar sua conta.');
          return;
        }
        if (data?.session?.user) {
          onAuthSuccess();
        }
        onSetAuthMessage('Conta criada. Verifique seu e-mail para confirmar o cadastro, se aplicável.');
        return;
      }

      const { error } = await onSignIn({ email, password });
      if (error) {
        onSetAuthError(error.message || 'Falha ao entrar com e-mail e senha.');
        return;
      }

      onAuthSuccess();
      onSetAuthMessage('Login realizado com sucesso.');
    };

    const loginWithGoogle = async () => {
      onSetAuthError('');
      onSetAuthMessage('');

      const { error } = await onGoogle();
      if (error) {
        onSetAuthError(error.message || 'Falha ao iniciar login com Google.');
      }
    };

    return (
      <div className="auth-entry-content">
        <form onSubmit={submitCredentials} className="auth-entry-form" noValidate>
          <div className="auth-entry-field">
            <label className="auth-entry-label" htmlFor="auth-entry-email">E-mail profissional</label>
            <input
              id="auth-entry-email"
              type="email"
              className={`ui-input auth-entry-input${emailError ? ' is-error' : ''}`}
              placeholder="seuemail@clinica.com"
              value={email}
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? 'auth-entry-email-error' : undefined}
              onChange={(event) => onSetEmail(event.target.value)}
            />
            {emailError ? (
              <p id="auth-entry-email-error" className="auth-entry-field-message" role="alert">{emailError}</p>
            ) : null}
          </div>
          <div className="auth-entry-field">
            <label className="auth-entry-label" htmlFor="auth-entry-password">Senha</label>
            <input
              id="auth-entry-password"
              type="password"
              className={`ui-input auth-entry-input${passwordError ? ' is-error' : ''}`}
              placeholder="Sua senha"
              value={password}
              aria-invalid={Boolean(passwordError)}
              aria-describedby={passwordError ? 'auth-entry-password-error' : undefined}
              onChange={(event) => onSetPassword(event.target.value)}
            />
            {passwordError ? (
              <p id="auth-entry-password-error" className="auth-entry-field-message" role="alert">{passwordError}</p>
            ) : null}
          </div>
          <button type="submit" className="auth-entry-action auth-entry-action--primary">
            {mode === 'signup' ? 'Criar conta' : 'Entrar'}
          </button>
        </form>

        <button type="button" onClick={loginWithGoogle} className="auth-entry-action auth-entry-action--secondary">
          Continuar com Google
        </button>

        <button type="button" className="auth-entry-action auth-entry-action--social" onClick={() => onSetMode((prev) => (prev === 'signup' ? 'signin' : 'signup'))}>
          {mode === 'signup' ? 'Já tenho conta, quero entrar' : 'Não tenho conta, quero me cadastrar'}
        </button>

        {hasFieldErrors && authError ? (
          <p className="auth-entry-helper" role="status">{authError}</p>
        ) : null}
      </div>
    );
  };
}(globalThis));

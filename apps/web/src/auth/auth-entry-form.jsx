(function registerAuthEntryForm(global) {
  const namespace = global.OdontoFlowAuthEntry = global.OdontoFlowAuthEntry || {};

  namespace.AuthEntryForm = ({
    mode,
    email,
    password,
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
    const submitCredentials = async (event) => {
      event.preventDefault();
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
      <>
        <form onSubmit={submitCredentials} className="space-y-3">
          <input
            type="email"
            className="ui-input w-full"
            placeholder="seuemail@clinica.com"
            value={email}
            onChange={(event) => onSetEmail(event.target.value)}
          />
          <input
            type="password"
            className="ui-input w-full"
            placeholder="Sua senha"
            value={password}
            onChange={(event) => onSetPassword(event.target.value)}
          />
          <button type="submit" className="btn btn--primary w-full">
            {mode === 'signup' ? 'Criar conta' : 'Entrar com e-mail'}
          </button>
        </form>

        <button type="button" onClick={loginWithGoogle} className="btn btn--ghost w-full">
          Continuar com Google
        </button>

        <button type="button" className="text-sm text-sky-700 font-semibold" onClick={() => onSetMode((prev) => (prev === 'signup' ? 'signin' : 'signup'))}>
          {mode === 'signup' ? 'Já tenho conta, quero entrar' : 'Não tenho conta, quero me cadastrar'}
        </button>
      </>
    );
  };
}(globalThis));

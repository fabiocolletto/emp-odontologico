(function bootstrapAuthAccountService(globalScope) {
  const toError = (fallbackMessage, error) => new Error(error?.message || fallbackMessage);

  const create = ({ supabaseClient } = {}) => {
    const ensureClient = () => {
      if (!supabaseClient) {
        throw new Error('Cliente Supabase indisponível para operações de conta.');
      }
      return supabaseClient;
    };

    const getAuthUser = async () => {
      const client = ensureClient();
      const { data, error } = await client.auth.getUser();
      if (error) throw toError('Falha ao consultar dados do usuário.', error);
      return data?.user || null;
    };

    const updateAuthUser = async (attributes) => {
      const client = ensureClient();
      const { data, error } = await client.auth.updateUser(attributes);
      if (error) throw toError('Falha ao atualizar dados da conta no Supabase Auth.', error);
      return data?.user || null;
    };

    const signOut = async () => {
      const client = ensureClient();
      const { error } = await client.auth.signOut();
      if (error) throw toError('Falha ao desconectar usuário.', error);
      return true;
    };

    const deleteAuthUser = async (userId) => {
      const client = ensureClient();
      if (!userId) throw new Error('ID do usuário é obrigatório para excluir conta.');
      const { error } = await client.auth.admin.deleteUser(userId);
      if (error) throw toError('Falha ao excluir conta no Supabase Auth.', error);
      return true;
    };

    const loadPublicProfile = async (userId) => {
      const client = ensureClient();
      if (!userId) return null;

      const { data, error } = await client
        .from('users')
        .select('id, full_name, phone, address, birth_date')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw toError('Falha ao carregar perfil público.', error);
      return data || null;
    };

    const savePublicProfile = async ({ userId, profile }) => {
      const client = ensureClient();
      if (!userId) throw new Error('ID do usuário é obrigatório para salvar o perfil público.');

      const payload = {
        id: userId,
        full_name: profile?.full_name || '',
        phone: profile?.phone || '',
        address: profile?.address || '',
        birth_date: profile?.birth_date || null
      };

      const { data, error } = await client
        .from('users')
        .upsert(payload, { onConflict: 'id' })
        .select('id, full_name, phone, address, birth_date')
        .maybeSingle();

      if (error) throw toError('Falha ao salvar perfil público.', error);
      return data || payload;
    };

    return {
      getAuthUser,
      updateAuthUser,
      signOut,
      deleteAuthUser,
      loadPublicProfile,
      savePublicProfile
    };
  };

  globalScope.OdontoAuthAccountService = { create };
})(globalThis);

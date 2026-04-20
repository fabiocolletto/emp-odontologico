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
        .from('odf_users')
        .select('user_id, full_name, email, phone, metadata')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw toError('Falha ao carregar perfil público.', error);
      if (!data) return null;

      return {
        user_id: data.user_id,
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data?.metadata?.address || '',
        birth_date: data?.metadata?.birth_date || ''
      };
    };

    const savePublicProfile = async ({ userId, profile }) => {
      const client = ensureClient();
      if (!userId) throw new Error('ID do usuário é obrigatório para salvar o perfil público.');

      const { data: existingProfile } = await client
        .from('odf_users')
        .select('metadata')
        .eq('user_id', userId)
        .maybeSingle();

      const nextMetadata = {
        ...(existingProfile?.metadata || {}),
        address: profile?.address || '',
        birth_date: profile?.birth_date || null
      };

      const payload = {
        user_id: userId,
        full_name: profile?.full_name || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        metadata: nextMetadata
      };

      const { data, error } = await client
        .from('odf_users')
        .upsert(payload, { onConflict: 'user_id' })
        .select('user_id, full_name, email, phone, metadata')
        .maybeSingle();

      if (error) throw toError('Falha ao salvar perfil público.', error);
      const source = data || payload;
      return {
        user_id: source.user_id,
        full_name: source.full_name || '',
        email: source.email || '',
        phone: source.phone || '',
        address: source?.metadata?.address || '',
        birth_date: source?.metadata?.birth_date || ''
      };
    };

    const loadClinics = async (userId) => {
      const client = ensureClient();
      if (!userId) return [];

      const { data, error } = await client
        .from('odf_clinics')
        .select('id, trade_name, legal_name, document_number, email, phone, city, state, timezone, status, owner_user_id')
        .eq('owner_user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw toError('Falha ao carregar clínicas do usuário.', error);
      if (data?.length) return data;

      const { data: created, error: createError } = await client
        .from('odf_clinics')
        .insert({
          trade_name: 'Minha Clínica',
          owner_user_id: userId,
          created_by: userId,
          updated_by: userId
        })
        .select('id, trade_name, legal_name, document_number, email, phone, city, state, timezone, status, owner_user_id')
        .single();

      if (createError) throw toError('Falha ao criar clínica padrão do usuário.', createError);
      return created ? [created] : [];
    };

    const saveClinic = async ({ userId, clinic }) => {
      const client = ensureClient();
      if (!userId) throw new Error('Usuário inválido para salvar clínica.');

      const payload = {
        id: clinic?.id || undefined,
        trade_name: clinic?.trade_name || 'Minha Clínica',
        legal_name: clinic?.legal_name || '',
        document_number: clinic?.document_number || '',
        email: clinic?.email || '',
        phone: clinic?.phone || '',
        city: clinic?.city || '',
        state: clinic?.state || '',
        timezone: clinic?.timezone || 'America/Sao_Paulo',
        status: clinic?.status || 'trial',
        owner_user_id: userId,
        created_by: clinic?.id ? undefined : userId,
        updated_by: userId
      };

      const { data, error } = await client
        .from('odf_clinics')
        .upsert(payload, { onConflict: 'id' })
        .select('id, trade_name, legal_name, document_number, email, phone, city, state, timezone, status, owner_user_id')
        .single();

      if (error) throw toError('Falha ao salvar clínica.', error);
      return data;
    };

    return {
      getAuthUser,
      updateAuthUser,
      signOut,
      deleteAuthUser,
      loadPublicProfile,
      savePublicProfile,
      loadClinics,
      saveClinic
    };
  };

  globalScope.OdontoAuthAccountService = { create };
})(globalThis);

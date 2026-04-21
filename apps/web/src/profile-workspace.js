import {
  BadgeDollarSign,
  Bell,
  Building2,
  CircleHelp,
  CreditCard,
  FileText,
  Info,
  LogOut,
  Shield,
  SlidersHorizontal,
  User,
  Users
} from 'lucide-react';

const PROFILE_USER_KEY = 'odontoflow:profile-workspace';

const resolveProfileUser = (clinicName) => {
  const fallback = {
    name: 'Dra. Mariana Costa',
    role: 'Gestora clínica',
    email: 'mariana@odontoflow.com'
  };

  const raw = window.localStorage.getItem(PROFILE_USER_KEY);
  if (!raw) {
    return {
      ...fallback,
      subtitle: clinicName ? `${fallback.role} · ${clinicName}` : fallback.role
    };
  }

  try {
    const parsed = JSON.parse(raw);
    const name = String(parsed?.name || fallback.name);
    const role = String(parsed?.role || fallback.role);
    const email = String(parsed?.email || fallback.email);
    return {
      name,
      role,
      email,
      subtitle: clinicName ? `${role} · ${clinicName}` : role
    };
  } catch {
    return {
      ...fallback,
      subtitle: clinicName ? `${fallback.role} · ${clinicName}` : fallback.role
    };
  }
};

const resolveProfileSections = (clinicName) => ([
  {
    id: 'account',
    title: 'Conta',
    order: 1,
    items: [
      { id: 'notifications', label: 'Notificações', icon: Bell, route: 'profile.notifications', badge: '5', description: 'Alertas do sistema', visibility: true, order: 1 },
      { id: 'account-data', label: 'Dados da conta', icon: User, route: 'profile.account-data', visibility: true, order: 2 },
      { id: 'security-access', label: 'Segurança e acesso', icon: Shield, route: 'profile.security-access', visibility: true, order: 3 }
    ]
  },
  {
    id: 'subscription',
    title: 'Assinatura e financeiro',
    order: 2,
    items: [
      { id: 'plan-subscription', label: 'Plano e assinatura', icon: BadgeDollarSign, route: 'profile.plan-subscription', visibility: true, order: 1 },
      { id: 'payments', label: 'Pagamentos', icon: CreditCard, route: 'profile.payments', visibility: true, order: 2 },
      { id: 'invoices', label: 'Faturas', icon: FileText, route: 'profile.invoices', visibility: true, order: 3 }
    ]
  },
  {
    id: 'professional',
    title: 'Ambiente profissional',
    order: 3,
    items: [
      { id: 'current-clinic', label: 'Clínica atual', icon: Building2, route: 'profile.current-clinic', description: clinicName || 'Não definida', visibility: true, order: 1 },
      { id: 'team-permissions', label: 'Equipe e permissões', icon: Users, route: 'profile.team-permissions', visibility: true, order: 2 },
      { id: 'system-preferences', label: 'Preferências do sistema', icon: SlidersHorizontal, route: 'profile.system-preferences', visibility: true, order: 3 }
    ]
  },
  {
    id: 'support',
    title: 'Suporte e sessão',
    order: 4,
    items: [
      { id: 'help', label: 'Ajuda', icon: CircleHelp, route: 'profile.help', visibility: true, order: 1 },
      { id: 'about', label: 'Sobre o app', icon: Info, route: 'profile.about', visibility: true, order: 2 },
      { id: 'logout', label: 'Sair', icon: LogOut, route: 'profile.logout', visibility: true, order: 3 }
    ]
  }
]);

export const loadProfileWorkspaceData = async ({ clinicName }) => ({
  userProfile: resolveProfileUser(clinicName),
  sections: resolveProfileSections(clinicName)
});

import React from 'react';
import { createRoot } from 'react-dom/client';
import { RefereeAssessmentPage, Resources } from './resources';
import '../css/app.css';

type AuthUser = {
  id: number;
  name: string;
  email: string;
};

type ValidationErrors = Record<string, string[]>;

const csrfToken = document
  .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
  ?.getAttribute('content');

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw data;
  }

  return data as T;
}

function App() {
  const refereeCode = window.location.pathname.match(/^\/referees\/([^/]+)$/)?.[1] ?? null;
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [remember, setRemember] = React.useState(false);
  const [errors, setErrors] = React.useState<ValidationErrors>({});
  const [isLoadingUser, setIsLoadingUser] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (refereeCode) {
      setIsLoadingUser(false);
      return;
    }

    request<{ user: AuthUser }>('/auth/user')
      .then(({ user }) => {
        setUser(user);

        if (window.location.pathname === '/') {
          window.history.replaceState({}, '', '/resources');
        }
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoadingUser(false));
  }, [refereeCode]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrors({});
    setStatus(null);
    setIsSubmitting(true);

    try {
      const data = await request<{ user: AuthUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, remember }),
      });

      setUser(data.user);
      setPassword('');
      window.history.pushState({}, '', '/resources');
    } catch (error) {
      const response = error as { errors?: ValidationErrors; message?: string };

      setErrors(response.errors ?? { email: [response.message ?? 'Nao foi possivel entrar.'] });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    setStatus(null);
    setIsSubmitting(true);

    try {
      await request('/auth/logout', { method: 'POST' });
      setUser(null);
      setEmail('');
      setPassword('');
      setRemember(false);
      window.history.pushState({}, '', '/');
      setStatus('Voce saiu da sua conta.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingUser) {
    return (
      <main className="grid min-h-screen place-items-center bg-neutral-950 px-6 text-white">
        <p className="text-sm text-neutral-300">Carregando sessao...</p>
      </main>
    );
  }

  if (refereeCode) {
    return <RefereeAssessmentPage request={request} code={refereeCode} />;
  }

  if (user) {
    return <Resources request={request} onLogout={handleLogout} isSubmitting={isSubmitting} />;
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-[1fr_420px]">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-300">Instant Resource</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            Acesse sua conta para gerenciar recursos em poucos cliques.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-neutral-300">
            O login usa a sessao nativa do Laravel, validacao no backend e chamadas seguras com CSRF pelo React.
          </p>
        </div>
          <form
            onSubmit={handleLogin}
            className="rounded-lg border border-neutral-800 bg-neutral-900 p-6 shadow-2xl shadow-black/30"
          >
            <div>
              <h2 className="text-2xl font-semibold">Entrar</h2>
              <p className="mt-2 text-sm text-neutral-400">Use seu e-mail e senha cadastrados.</p>
            </div>

            {status && (
              <p className="mt-5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                {status}
              </p>
            )}

            <label className="mt-6 block">
              <span className="text-sm font-medium text-neutral-200">E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                className="mt-2 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-emerald-400"
                placeholder="voce@email.com"
              />
              {errors.email && <span className="mt-2 block text-sm text-red-300">{errors.email[0]}</span>}
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-medium text-neutral-200">Senha</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="mt-2 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-emerald-400"
                placeholder="Sua senha"
              />
              {errors.password && <span className="mt-2 block text-sm text-red-300">{errors.password[0]}</span>}
            </label>

            <label className="mt-5 flex items-center gap-3 text-sm text-neutral-300">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-4 w-4 rounded border-neutral-700 bg-neutral-950 text-emerald-500"
              />
              Manter conectado
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-md bg-emerald-400 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
      </section>
    </main>
  );
}

createRoot(document.getElementById('app')!).render(<App />);

import React from 'react';

export type ValidationErrors = Record<string, string[]>;

export type ApiRequest = <T>(url: string, options?: RequestInit) => Promise<T>;

type ResourceItem = {
  id: number;
  requerente: string;
  categoria: string;
  peso: number;
  faixa: string;
  luta: string;
  area: string | null;
  arbitro: string | null;
  vencedor: string | null;
  status: string;
  observacao: string | null;
  referees: ResourceReferee[];
  created_at: string | null;
};

type ResourceReferee = {
  id: number;
  resource_id: number;
  code: string;
  referee_name: string;
  white_pontos: number;
  white_vantagens: number;
  white_punicao: number;
  color_pontos: number;
  color_vantagens: number;
  color_punicao: number;
  victory: 'white' | 'color' | null;
  observacao: string | null;
  link: string;
};

type PaginatedResources = {
  data: ResourceItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
};

type ResourceForm = {
  requerente: string;
  categoria: string;
  peso: string;
  faixa: string;
  luta: string;
  area: string;
  arbitro: string;
  vencedor: string;
  observacao: string;
  referees: string[];
};

type ResourcesProps = {
  request: ApiRequest;
  onLogout: () => void;
  isSubmitting: boolean;
};

type RefereeAssessment = {
  code: string;
  referee_name: string;
  white_pontos: number;
  white_vantagens: number;
  white_punicao: number;
  color_pontos: number;
  color_vantagens: number;
  color_punicao: number;
  victory: 'white' | 'color' | null;
  observacao: string | null;
  resource: {
    id: number;
    requerente: string;
    categoria: string;
    peso: number;
    faixa: string;
    luta: string;
    area: string | null;
  };
};

type RefereeAssessmentForm = {
  white_pontos: string;
  white_vantagens: string;
  white_punicao: string;
  color_pontos: string;
  color_vantagens: string;
  color_punicao: string;
  victory: string;
  observacao: string;
};

const category = {
  PRE_MIRIM: 'PRÉ - MIRIM',
  MIRIM: 'MIRIM',
  INFANTIL_1: 'INFANTIL 1',
  INFANTIL_2: 'INFANTIL 2',
  INFANTO_JUVENIL_1: 'INFANTO JUVENIL 1',
  INFANTO_JUVENIL_2: 'INFANTO JUVENIL 2',
  JUVENIL: 'JUVENIL',
  ADULTO: 'ADULTO',
  MASTER_1: 'MASTER 1',
  MASTER_2: 'MASTER 2',
  MASTER_3: 'MASTER 3',
  MASTER_4: 'MASTER 4',
  MASTER_5: 'MASTER 5',
} as const;

const categoryOptions = Object.values(category);

const beltOptions = ['branca', 'cinza', 'amarela', 'laranja', 'verde', 'azul', 'roxa', 'preta'];

const winnerOptions = [
  { value: 'white', label: 'Atleta branco' },
  { value: 'color', label: 'Colorido' },
];

const emptyForm: ResourceForm = {
  requerente: '',
  categoria: '',
  peso: '',
  faixa: '',
  luta: '',
  area: '',
  arbitro: '',
  vencedor: '',
  observacao: '',
  referees: ['', '', ''],
};

function resourceToForm(resource: ResourceItem): ResourceForm {
  return {
    requerente: resource.requerente,
    categoria: resource.categoria,
    peso: String(resource.peso),
    faixa: resource.faixa,
    luta: resource.luta,
    area: resource.area ?? '',
    arbitro: resource.arbitro ?? '',
    vencedor: resource.vencedor ?? '',
    observacao: resource.observacao ?? '',
    referees: [
      resource.referees[0]?.referee_name ?? '',
      resource.referees[1]?.referee_name ?? '',
      resource.referees[2]?.referee_name ?? '',
    ],
  };
}

function assessmentToForm(assessment: RefereeAssessment): RefereeAssessmentForm {
  return {
    white_pontos: String(assessment.white_pontos),
    white_vantagens: String(assessment.white_vantagens),
    white_punicao: String(assessment.white_punicao),
    color_pontos: String(assessment.color_pontos),
    color_vantagens: String(assessment.color_vantagens),
    color_punicao: String(assessment.color_punicao),
    victory: assessment.victory ?? '',
    observacao: assessment.observacao ?? '',
  };
}

function optionLabel(options: Array<string | { value: string; label: string }>, value: string | null) {
  if (!value) {
    return '-';
  }

  const option = options.find((item) => (typeof item === 'string' ? item === value : item.value === value));

  return typeof option === 'string' ? option : option?.label ?? value;
}

function victoryLabel(value: 'white' | 'color' | null) {
  return optionLabel(winnerOptions, value);
}

export function RefereeAssessmentPage({ request, code }: { request: ApiRequest; code: string }) {
  const [assessment, setAssessment] = React.useState<RefereeAssessment | null>(null);
  const [form, setForm] = React.useState<RefereeAssessmentForm | null>(null);
  const [errors, setErrors] = React.useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);

  React.useEffect(() => {
    request<{ assessment: RefereeAssessment }>(`/api/referees/${code}`)
      .then(({ assessment }) => {
        setAssessment(assessment);
        setForm(assessmentToForm(assessment));
      })
      .catch(() => {
        setAssessment(null);
        setForm(null);
      })
      .finally(() => setIsLoading(false));
  }, [code, request]);

  function updateField(field: keyof RefereeAssessmentForm, value: string) {
    setForm((current) => (current ? { ...current, [field]: value } : current));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form) {
      return;
    }

    setErrors({});
    setStatus(null);
    setIsSaving(true);

    try {
      const data = await request<{ assessment: RefereeAssessment }>(`/api/referees/${code}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });

      setAssessment(data.assessment);
      setForm(assessmentToForm(data.assessment));
      setStatus('Avaliacao enviada com sucesso.');
    } catch (error) {
      const response = error as { errors?: ValidationErrors; message?: string };
      setErrors(response.errors ?? { victory: [response.message ?? 'Nao foi possivel enviar a avaliacao.'] });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-neutral-950 px-6 text-white">
        <p className="text-sm text-neutral-300">Carregando avaliacao...</p>
      </main>
    );
  }

  if (!assessment || !form) {
    return (
      <main className="grid min-h-screen place-items-center bg-neutral-950 px-6 text-white">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">Link de avaliacao invalido.</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-8 text-white">
      <section className="mx-auto w-full max-w-4xl">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-300">Avaliacao de recurso</p>
          <h1 className="mt-2 text-2xl font-semibold">{assessment.referee_name}</h1>
          <p className="mt-2 text-sm text-neutral-400">
            {assessment.resource.requerente} - {assessment.resource.categoria} - {assessment.resource.faixa}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <ScorePanel
              title="Atleta branco"
              fields={[
                ['white_pontos', 'Pontos'],
                ['white_vantagens', 'Vantagens'],
                ['white_punicao', 'Punicoes'],
              ]}
              form={form}
              errors={errors}
              onChange={updateField}
            />
            <ScorePanel
              title="Atleta colorido"
              fields={[
                ['color_pontos', 'Pontos'],
                ['color_vantagens', 'Vantagens'],
                ['color_punicao', 'Punicoes'],
              ]}
              form={form}
              errors={errors}
              onChange={updateField}
            />
          </div>

          <label className="mt-5 block">
            <span className="text-sm font-medium text-neutral-200">Vencedor</span>
            <select
              value={form.victory}
              onChange={(event) => updateField('victory', event.target.value)}
              className="mt-2 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
            >
              <option value="">Selecione</option>
              {winnerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.victory && <span className="mt-2 block text-sm text-red-300">{errors.victory[0]}</span>}
          </label>

          <label className="mt-5 block">
            <span className="text-sm font-medium text-neutral-200">Observacao</span>
            <textarea
              value={form.observacao}
              onChange={(event) => updateField('observacao', event.target.value)}
              className="mt-2 min-h-24 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-emerald-400"
            />
            {errors.observacao && <span className="mt-2 block text-sm text-red-300">{errors.observacao[0]}</span>}
          </label>

          {status && (
            <p className="mt-5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{status}</p>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="mt-6 rounded-md bg-emerald-400 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? 'Enviando...' : 'Enviar avaliacao'}
          </button>
        </form>
      </section>
    </main>
  );
}

export function Resources({ request, onLogout, isSubmitting }: ResourcesProps) {
  const [path, setPath] = React.useState(window.location.pathname);
  const editMatch = path.match(/^\/resources\/(\d+)\/edit$/);
  const editResourceId = editMatch ? Number(editMatch[1]) : null;
  const isCreatePage = path === '/resources/create';
  const isFormPage = isCreatePage || editResourceId !== null;

  React.useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);

    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function navigate(to: string) {
    window.history.pushState({}, '', to);
    setPath(to);
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-neutral-800 bg-neutral-950/95">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-300">Instant Resource</p>
            <h1 className="mt-1 text-2xl font-semibold">Recursos</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/resources')}
              className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-900"
            >
              Lista
            </button>
            <button
              type="button"
              onClick={() => navigate('/resources/create')}
              className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-300"
            >
              Novo recurso
            </button>
            <button
              type="button"
              onClick={onLogout}
              disabled={isSubmitting}
              className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Saindo...' : 'Sair'}
            </button>
          </div>
        </div>
      </header>

      {isFormPage ? (
        <ResourceFormPage
          request={request}
          resourceId={editResourceId}
          onSaved={() => navigate('/resources')}
          onCancel={() => navigate('/resources')}
        />
      ) : (
        <ResourceListPage request={request} onCreate={() => navigate('/resources/create')} onEdit={(id) => navigate(`/resources/${id}/edit`)} />
      )}
    </main>
  );
}

function ResourceListPage({
  request,
  onCreate,
  onEdit,
}: {
  request: ApiRequest;
  onCreate: () => void;
  onEdit: (id: number) => void;
}) {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [resources, setResources] = React.useState<PaginatedResources | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = React.useState<number | null>(null);
  const [actionId, setActionId] = React.useState<number | null>(null);
  const [reloadToken, setReloadToken] = React.useState(0);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [search]);

  React.useEffect(() => {
    const params = new URLSearchParams({ page: String(page) });

    if (debouncedSearch !== '') {
      params.set('search', debouncedSearch);
    }

    setIsLoading(true);
    setError(null);

    request<PaginatedResources>(`/api/resources?${params.toString()}`)
      .then(setResources)
      .catch(() => setError('Nao foi possivel carregar os recursos.'))
      .finally(() => setIsLoading(false));
  }, [page, debouncedSearch, reloadToken, request]);

  React.useEffect(() => {
    function closeMenu(event: MouseEvent) {
      const target = event.target as HTMLElement;

      if (!target.closest('[data-resource-menu]')) {
        setOpenMenuId(null);
      }
    }

    window.addEventListener('click', closeMenu);

    return () => window.removeEventListener('click', closeMenu);
  }, []);

  async function finishResource(resource: ResourceItem) {
    setActionId(resource.id);
    setOpenMenuId(null);

    try {
      await request(`/api/resources/${resource.id}/finish`, { method: 'PATCH' });
      setReloadToken((current) => current + 1);
    } finally {
      setActionId(null);
    }
  }

  async function deleteResource(resource: ResourceItem) {
    if (!window.confirm(`Excluir o recurso de ${resource.requerente}?`)) {
      return;
    }

    setActionId(resource.id);
    setOpenMenuId(null);

    try {
      await request(`/api/resources/${resource.id}`, { method: 'DELETE' });
      setReloadToken((current) => current + 1);
    } finally {
      setActionId(null);
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Recursos cadastrados</h2>
          <p className="mt-1 text-sm text-neutral-400">Acompanhe os pedidos registrados no sistema.</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <label className="block w-full sm:w-80">
            <span className="sr-only">Pesquisar recursos</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar por requerente, categoria, faixa..."
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-emerald-400"
            />
          </label>
          <button
            type="button"
            onClick={onCreate}
            className="w-full rounded-md bg-emerald-400 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-300 sm:w-auto"
          >
            Criar novo recurso
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6 text-sm text-neutral-300">Carregando recursos...</div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">{error}</div>
      ) : resources && resources.data.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {resources.data.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                isMenuOpen={openMenuId === resource.id}
                isBusy={actionId === resource.id}
                onToggleMenu={() => setOpenMenuId((current) => (current === resource.id ? null : resource.id))}
                onEdit={() => onEdit(resource.id)}
                onFinish={() => finishResource(resource)}
                onDelete={() => deleteResource(resource)}
              />
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-4 text-sm text-neutral-300 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Mostrando {resources.from} a {resources.to} de {resources.total}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                disabled={resources.current_page === 1}
                className="rounded-md border border-neutral-700 px-3 py-2 transition hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <span>
                Pagina {resources.current_page} de {resources.last_page}
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(current + 1, resources.last_page))}
                disabled={resources.current_page === resources.last_page}
                className="rounded-md border border-neutral-700 px-3 py-2 transition hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Proxima
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
          <p className="text-sm text-neutral-300">
            {debouncedSearch ? 'Nenhum recurso encontrado para essa pesquisa.' : 'Nenhum recurso cadastrado ainda.'}
          </p>
          <button
            type="button"
            onClick={onCreate}
            className="mt-4 rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-300"
          >
            Criar primeiro recurso
          </button>
        </div>
      )}
    </section>
  );
}

function ResourceCard({
  resource,
  isMenuOpen,
  isBusy,
  onToggleMenu,
  onEdit,
  onFinish,
  onDelete,
}: {
  resource: ResourceItem;
  isMenuOpen: boolean;
  isBusy: boolean;
  onToggleMenu: () => void;
  onEdit: () => void;
  onFinish: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="relative rounded-lg border border-neutral-800 bg-neutral-900 p-5 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">#{resource.id}</p>
          <h3 className="mt-1 text-lg font-semibold text-white">{resource.requerente}</h3>
          <p className="mt-1 text-sm text-neutral-400">{resource.categoria}</p>
        </div>

        <div data-resource-menu className="relative">
          <button
            type="button"
            onClick={onToggleMenu}
            disabled={isBusy}
            aria-label="Abrir menu do recurso"
            className="grid h-9 w-9 place-items-center rounded-md border border-neutral-700 text-neutral-300 transition hover:border-neutral-500 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="text-xl leading-none">...</span>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-md border border-neutral-700 bg-neutral-950 py-1 shadow-2xl shadow-black/40">
              <button type="button" onClick={onEdit} className="block w-full px-4 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-800">
                Editar
              </button>
              <button type="button" onClick={onFinish} className="block w-full px-4 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-800">
                Finalizar
              </button>
              <button type="button" onClick={onDelete} className="block w-full px-4 py-2 text-left text-sm text-red-300 hover:bg-red-500/10">
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <CardMeta label="Peso" value={String(resource.peso)} />
        <CardMeta label="Faixa" value={optionLabel(beltOptions, resource.faixa)} />
        <CardMeta label="Luta" value={resource.luta} />
        <CardMeta label="Area" value={resource.area ?? '-'} />
        <CardMeta label="Arbitro" value={resource.arbitro ?? '-'} />
        <CardMeta label="Vencedor" value={optionLabel(winnerOptions, resource.vencedor)} />
        <CardMeta label="Status" value={resource.status ?? '-'} />
      </div>

      <div className="mt-4 border-t border-neutral-800 pt-4">
        <p className="text-xs uppercase tracking-wide text-neutral-500">Arbitros avaliadores</p>
        {resource.referees.length > 0 ? (
          <div className="mt-3 space-y-2">
            {resource.referees.map((referee) => (
              <div key={referee.id} className="rounded-md border border-neutral-800 bg-neutral-950 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-neutral-100">{referee.referee_name}</p>
                    <p className="mt-1 text-xs text-neutral-500">{referee.victory ? 'Avaliacao enviada' : 'Aguardando avaliacao'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(referee.link)}
                    className="rounded-md border border-neutral-700 px-2 py-1 text-xs text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-800"
                  >
                    Copiar link
                  </button>
                </div>
                <a href={referee.link} className="mt-2 block break-all text-xs text-emerald-300 hover:text-emerald-200">
                  {referee.link}
                </a>
                {referee.victory && (
                  <div className="mt-3 grid grid-cols-2 gap-3 border-t border-neutral-800 pt-3 text-xs">
                    <div className="rounded-md bg-neutral-900 p-2">
                      <p className="font-medium text-neutral-200">Atleta branco</p>
                      <p className="mt-1 text-neutral-400">Pontos: {referee.white_pontos}</p>
                      <p className="text-neutral-400">Vantagens: {referee.white_vantagens}</p>
                      <p className="text-neutral-400">Punicoes: {referee.white_punicao}</p>
                    </div>
                    <div className="rounded-md bg-neutral-900 p-2">
                      <p className="font-medium text-neutral-200">Colorido</p>
                      <p className="mt-1 text-neutral-400">Pontos: {referee.color_pontos}</p>
                      <p className="text-neutral-400">Vantagens: {referee.color_vantagens}</p>
                      <p className="text-neutral-400">Punicoes: {referee.color_punicao}</p>
                    </div>
                    <div className="col-span-2 rounded-md bg-neutral-900 p-2">
                      <p className="text-neutral-400">
                        Vencedor: <span className="text-neutral-100">{victoryLabel(referee.victory)}</span>
                      </p>
                      {referee.observacao && <p className="mt-1 text-neutral-400">Observacao: {referee.observacao}</p>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-neutral-400">Nenhum arbitro definido.</p>
        )}
      </div>

      {resource.observacao && (
        <p className="mt-4 rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-300">
          {resource.observacao}
        </p>
      )}
    </article>
  );
}

function CardMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 text-neutral-200">{value}</p>
    </div>
  );
}

function RefereeAssessmentSummary({ referee }: { referee: ResourceReferee }) {
  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-900 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-100">{referee.referee_name}</p>
          <p className="mt-1 text-xs text-neutral-500">{referee.victory ? 'Avaliacao enviada' : 'Aguardando avaliacao'}</p>
        </div>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(referee.link)}
          className="rounded-md border border-neutral-700 px-2 py-1 text-xs text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-800"
        >
          Copiar link publico
        </button>
      </div>

      {referee.victory ? (
        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-neutral-800 pt-3 text-xs">
          <div className="rounded-md bg-neutral-950 p-2">
            <p className="font-medium text-neutral-200">Atleta branco</p>
            <p className="mt-1 text-neutral-400">Pontos: {referee.white_pontos}</p>
            <p className="text-neutral-400">Vantagens: {referee.white_vantagens}</p>
            <p className="text-neutral-400">Punicoes: {referee.white_punicao}</p>
          </div>
          <div className="rounded-md bg-neutral-950 p-2">
            <p className="font-medium text-neutral-200">Colorido</p>
            <p className="mt-1 text-neutral-400">Pontos: {referee.color_pontos}</p>
            <p className="text-neutral-400">Vantagens: {referee.color_vantagens}</p>
            <p className="text-neutral-400">Punicoes: {referee.color_punicao}</p>
          </div>
          <div className="col-span-2 rounded-md bg-neutral-950 p-2">
            <p className="text-neutral-400">
              Vencedor: <span className="text-neutral-100">{victoryLabel(referee.victory)}</span>
            </p>
            {referee.observacao && <p className="mt-1 text-neutral-400">Observacao: {referee.observacao}</p>}
          </div>
        </div>
      ) : (
        <p className="mt-3 border-t border-neutral-800 pt-3 text-xs text-neutral-500">Ainda sem preenchimento do arbitro.</p>
      )}
    </div>
  );
}

function ResourceFormPage({
  request,
  resourceId,
  onSaved,
  onCancel,
}: {
  request: ApiRequest;
  resourceId: number | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = React.useState<ResourceForm>(emptyForm);
  const [resource, setResource] = React.useState<ResourceItem | null>(null);
  const [errors, setErrors] = React.useState<ValidationErrors>({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [isFinishing, setIsFinishing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(resourceId !== null);
  const [status, setStatus] = React.useState<string | null>(null);
  const isEditing = resourceId !== null;
  const hasThreeAssessments = resource?.referees.length === 3 && resource.referees.every((referee) => referee.victory !== null);
  const canFinish = isEditing && resource?.status !== 'finalizado' && hasThreeAssessments && form.vencedor !== '';

  React.useEffect(() => {
    if (resourceId === null) {
      setForm(emptyForm);
      setResource(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    request<{ resource: ResourceItem }>(`/api/resources/${resourceId}`)
      .then(({ resource }) => {
        setResource(resource);
        setForm(resourceToForm(resource));
      })
      .finally(() => setIsLoading(false));
  }, [resourceId, request]);

  function updateField(field: keyof ResourceForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateReferee(index: number, value: string) {
    setForm((current) => ({
      ...current,
      referees: current.referees.map((referee, currentIndex) => (currentIndex === index ? value : referee)),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrors({});
    setStatus(null);
    setIsSaving(true);

    try {
      const data = await request<{ resource: ResourceItem }>(isEditing ? `/api/resources/${resourceId}` : '/api/resources', {
        method: isEditing ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      });

      setResource(data.resource);
      onSaved();
    } catch (error) {
      const response = error as { errors?: ValidationErrors; message?: string };
      setErrors(response.errors ?? { requerente: [response.message ?? 'Nao foi possivel salvar o recurso.'] });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleFinish() {
    if (!resourceId || !canFinish) {
      return;
    }

    setErrors({});
    setStatus(null);
    setIsFinishing(true);

    try {
      await request<{ resource: ResourceItem }>(`/api/resources/${resourceId}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });

      const data = await request<{ resource: ResourceItem }>(`/api/resources/${resourceId}/finish`, {
        method: 'PATCH',
      });

      setResource(data.resource);
      setStatus('Recurso finalizado com sucesso.');
    } catch (error) {
      const response = error as { errors?: ValidationErrors; message?: string };
      setErrors(response.errors ?? { resource: [response.message ?? 'Nao foi possivel finalizar o recurso.'] });
    } finally {
      setIsFinishing(false);
    }
  }

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-4xl px-6 py-8">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6 text-sm text-neutral-300">Carregando recurso...</div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">{isEditing ? 'Editar recurso' : 'Novo recurso'}</h2>
        <p className="mt-1 text-sm text-neutral-400">Preencha os dados do pedido.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Requerente" value={form.requerente} error={errors.requerente?.[0]} onChange={(value) => updateField('requerente', value)} />
          <SelectField
            label="Categoria"
            value={form.categoria}
            options={categoryOptions}
            error={errors.categoria?.[0]}
            onChange={(value) => updateField('categoria', value)}
          />
          <Field label="Peso" type="number" value={form.peso} error={errors.peso?.[0]} onChange={(value) => updateField('peso', value)} />
          <SelectField
            label="Faixa"
            value={form.faixa}
            options={beltOptions}
            error={errors.faixa?.[0]}
            onChange={(value) => updateField('faixa', value)}
          />
          <Field label="Luta" value={form.luta} error={errors.luta?.[0]} onChange={(value) => updateField('luta', value)} />
          <Field label="Area" value={form.area} error={errors.area?.[0]} onChange={(value) => updateField('area', value)} />
          <SelectField
            label="Vencedor"
            value={form.vencedor}
            options={winnerOptions}
            error={errors.vencedor?.[0]}
            onChange={(value) => updateField('vencedor', value)}
          />
        </div>

        <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-100">Arbitros avaliadores</h3>
            <p className="mt-1 text-sm text-neutral-400">Informe ate 3 nomes. Os demais dados serao preenchidos pelos arbitros pelo link publico.</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {form.referees.map((referee, index) => (
              <Field
                key={index}
                label={`Arbitro ${index + 1}`}
                value={referee}
                error={errors[`referees.${index}`]?.[0]}
                onChange={(value) => updateReferee(index, value)}
              />
            ))}
          </div>
        </div>

        {isEditing && resource && (
          <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-neutral-100">Avaliacoes dos arbitros</h3>
                <p className="mt-1 text-sm text-neutral-400">
                  {resource.referees.filter((referee) => referee.victory !== null).length} de 3 avaliacoes preenchidas.
                </p>
              </div>
              <button
                type="button"
                onClick={handleFinish}
                disabled={!canFinish || isFinishing}
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isFinishing ? 'Finalizando...' : 'Finalizar recurso'}
              </button>
            </div>

            {errors.resource && <p className="mt-3 text-sm text-red-300">{errors.resource[0]}</p>}
            {!canFinish && (
              <p className="mt-3 text-sm text-neutral-500">
                Para finalizar, informe o vencedor do recurso e aguarde os 3 arbitros enviarem suas avaliacoes.
              </p>
            )}

            <div className="mt-4 space-y-3">
              {resource.referees.length > 0 ? (
                resource.referees.map((referee) => <RefereeAssessmentSummary key={referee.id} referee={referee} />)
              ) : (
                <p className="text-sm text-neutral-400">Nenhum arbitro definido.</p>
              )}
            </div>
          </div>
        )}

        <label className="mt-5 block">
          <span className="text-sm font-medium text-neutral-200">Observacao</span>
          <textarea
            value={form.observacao}
            onChange={(event) => updateField('observacao', event.target.value)}
            className="mt-2 min-h-24 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-emerald-400"
          />
          {errors.observacao && <span className="mt-2 block text-sm text-red-300">{errors.observacao[0]}</span>}
        </label>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-neutral-700 px-4 py-3 text-sm font-semibold text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-950"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving || isFinishing}
            className="rounded-md bg-emerald-400 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? 'Salvando...' : 'Salvar recurso'}
          </button>
        </div>

        {status && (
          <p className="mt-5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{status}</p>
        )}
      </form>
    </section>
  );
}

function SelectField({
  label,
  value,
  options,
  error,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<string | { value: string; label: string }>;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-neutral-200">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
      >
        <option value="">Selecione</option>
        {options.map((option) => (
          <option key={typeof option === 'string' ? option : option.value} value={typeof option === 'string' ? option : option.value}>
            {typeof option === 'string' ? option : option.label}
          </option>
        ))}
      </select>
      {error && <span className="mt-2 block text-sm text-red-300">{error}</span>}
    </label>
  );
}

function ScorePanel({
  title,
  fields,
  form,
  errors,
  onChange,
}: {
  title: string;
  fields: Array<[keyof RefereeAssessmentForm, string]>;
  form: RefereeAssessmentForm;
  errors: ValidationErrors;
  onChange: (field: keyof RefereeAssessmentForm, value: string) => void;
}) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
      <h2 className="text-sm font-semibold text-neutral-100">{title}</h2>
      <div className="mt-4 grid gap-4">
        {fields.map(([field, label]) => (
          <label key={field} className="block">
            <span className="text-sm font-medium text-neutral-200">{label}</span>
            <input
              type="number"
              min="0"
              value={form[field]}
              onChange={(event) => onChange(field, event.target.value)}
              className="mt-2 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-emerald-400"
            />
            {errors[field] && <span className="mt-2 block text-sm text-red-300">{errors[field][0]}</span>}
          </label>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  type = 'text',
  value,
  error,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-neutral-200">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-emerald-400"
      />
      {error && <span className="mt-2 block text-sm text-red-300">{error}</span>}
    </label>
  );
}

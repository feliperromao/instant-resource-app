<?php

namespace App\Http\Controllers;

use App\Models\ResourceRecord;
use App\Models\ResourceReferee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ResourceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));

        $resources = ResourceRecord::query()
            ->with('referees')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('requerente', 'like', "%{$search}%")
                        ->orWhere('categoria', 'like', "%{$search}%")
                        ->orWhere('faixa', 'like', "%{$search}%")
                        ->orWhere('luta', 'like', "%{$search}%")
                        ->orWhere('area', 'like', "%{$search}%")
                        ->orWhere('arbitro', 'like', "%{$search}%")
                        ->orWhere('vencedor', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (ResourceRecord $resource) => $this->serialize($resource));

        return response()->json($resources);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validatedData($request);

        $data['observação'] = $data['observacao'] ?? null;
        unset($data['observacao']);

        $refereeNames = $data['referees'] ?? [];
        unset($data['referees']);

        $resource = DB::transaction(function () use ($data, $refereeNames) {
            $resource = ResourceRecord::query()->create($data);
            $this->syncReferees($resource, $refereeNames);

            return $resource->load('referees');
        });

        return response()->json([
            'resource' => $this->serialize($resource),
        ], 201);
    }

    public function show(ResourceRecord $resource): JsonResponse
    {
        return response()->json([
            'resource' => $this->serialize($resource->load('referees')),
        ]);
    }

    public function update(Request $request, ResourceRecord $resource): JsonResponse
    {
        $data = $this->validatedData($request);
        $refereeNames = $data['referees'] ?? [];
        unset($data['referees']);

        $data['observação'] = $data['observacao'] ?? null;
        unset($data['observacao']);

        DB::transaction(function () use ($resource, $data, $refereeNames) {
            $resource->update($data);
            $this->syncReferees($resource, $refereeNames);
        });

        return response()->json([
            'resource' => $this->serialize($resource->refresh()->load('referees')),
        ]);
    }

    public function finish(ResourceRecord $resource): JsonResponse
    {
        $resource->load('referees');

        if ($resource->vencedor === null || $resource->referees->count() !== 3 || $resource->referees->contains(fn (ResourceReferee $referee) => $referee->victory === null)) {
            throw ValidationException::withMessages([
                'resource' => 'O recurso so pode ser finalizado com vencedor definido e 3 avaliacoes de arbitros preenchidas.',
            ]);
        }

        $resource->update([
            'status' => 'finalizado',
        ]);

        return response()->json([
            'resource' => $this->serialize($resource->refresh()->load('referees')),
        ]);
    }

    public function destroy(ResourceRecord $resource): JsonResponse
    {
        $resource->delete();

        return response()->json([
            'message' => 'Recurso excluido.',
        ]);
    }

    private function validatedData(Request $request): array
    {
        return $request->validate([
            'requerente' => ['required', 'string', 'max:255'],
            'categoria' => ['required', 'string', 'max:255'],
            'peso' => ['required', 'numeric', 'min:0'],
            'faixa' => ['required', Rule::in(['branca', 'cinza', 'amarela', 'laranja', 'verde', 'azul', 'roxa', 'preta'])],
            'luta' => ['required', 'string', 'max:255'],
            'area' => ['nullable', 'string', 'max:255'],
            'arbitro' => ['nullable', 'string', 'max:255'],
            'vencedor' => ['nullable', Rule::in(['white', 'color'])],
            'observacao' => ['nullable', 'string', 'max:255'],
            'referees' => ['nullable', 'array', 'max:3'],
            'referees.*' => ['nullable', 'string', 'max:255'],
        ]);
    }

    private function serialize(ResourceRecord $resource): array
    {
        return [
            'id' => $resource->id,
            'requerente' => $resource->requerente,
            'categoria' => $resource->categoria,
            'peso' => $resource->peso,
            'faixa' => $resource->faixa,
            'luta' => $resource->luta,
            'area' => $resource->area,
            'arbitro' => $resource->arbitro,
            'vencedor' => $resource->vencedor,
            'status' => $resource->status,
            'observacao' => $resource->{'observação'},
            'referees' => $resource->referees
                ->sortBy('id')
                ->values()
                ->map(fn (ResourceReferee $referee) => $this->serializeReferee($referee))
                ->all(),
            'created_at' => $resource->created_at?->toISOString(),
            'updated_at' => $resource->updated_at?->toISOString(),
        ];
    }

    private function serializeReferee(ResourceReferee $referee): array
    {
        return [
            'id' => $referee->id,
            'resource_id' => $referee->resource_id,
            'code' => $referee->code,
            'referee_name' => $referee->referee_name,
            'white_pontos' => $referee->white_pontos,
            'white_vantagens' => $referee->white_vantagens,
            'white_punicao' => $referee->white_punicao,
            'color_pontos' => $referee->color_pontos,
            'color_vantagens' => $referee->color_vantagens,
            'color_punicao' => $referee->color_punicao,
            'victory' => $referee->victory,
            'observacao' => $referee->observacao,
            'link' => url("/referees/{$referee->code}"),
        ];
    }

    private function syncReferees(ResourceRecord $resource, array $names): void
    {
        $names = collect($names)
            ->map(fn ($name) => trim((string) $name))
            ->filter()
            ->take(3)
            ->values();

        $existing = $resource->referees()->orderBy('id')->get();

        $names->each(function (string $name, int $index) use ($resource, $existing) {
            $referee = $existing->get($index);

            if ($referee) {
                $referee->update(['referee_name' => $name]);
                return;
            }

            $resource->referees()->create([
                'referee_name' => $name,
                'code' => $this->makeRefereeCode(),
            ]);
        });

        $existing
            ->slice($names->count())
            ->each
            ->delete();
    }

    private function makeRefereeCode(): string
    {
        do {
            $code = Str::random(40);
        } while (ResourceReferee::query()->where('code', $code)->exists());

        return $code;
    }
}

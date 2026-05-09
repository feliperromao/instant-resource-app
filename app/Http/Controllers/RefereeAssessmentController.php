<?php

namespace App\Http\Controllers;

use App\Models\ResourceReferee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RefereeAssessmentController extends Controller
{
    public function show(string $code): JsonResponse
    {
        $referee = ResourceReferee::query()
            ->with('resource')
            ->where('code', $code)
            ->firstOrFail();

        return response()->json([
            'assessment' => $this->serialize($referee),
        ]);
    }

    public function update(Request $request, string $code): JsonResponse
    {
        $referee = ResourceReferee::query()
            ->with('resource')
            ->where('code', $code)
            ->firstOrFail();

        $data = $request->validate([
            'white_pontos' => ['required', 'integer', 'min:0'],
            'white_vantagens' => ['required', 'integer', 'min:0'],
            'white_punicao' => ['required', 'integer', 'min:0'],
            'color_pontos' => ['required', 'integer', 'min:0'],
            'color_vantagens' => ['required', 'integer', 'min:0'],
            'color_punicao' => ['required', 'integer', 'min:0'],
            'victory' => ['required', 'in:white,color'],
            'observacao' => ['nullable', 'string', 'max:255'],
        ]);

        $referee->update($data);

        return response()->json([
            'assessment' => $this->serialize($referee->refresh()->load('resource')),
        ]);
    }

    private function serialize(ResourceReferee $referee): array
    {
        return [
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
            'resource' => [
                'id' => $referee->resource->id,
                'requerente' => $referee->resource->requerente,
                'categoria' => $referee->resource->categoria,
                'peso' => $referee->resource->peso,
                'faixa' => $referee->resource->faixa,
                'luta' => $referee->resource->luta,
                'area' => $referee->resource->area,
            ],
        ];
    }
}

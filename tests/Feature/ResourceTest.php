<?php

namespace Tests\Feature;

use App\Models\ResourceRecord;
use App\Models\ResourceReferee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_list_resources(): void
    {
        $this->getJson('/api/resources')->assertUnauthorized();
    }

    public function test_authenticated_user_can_list_paginated_resources(): void
    {
        $user = User::factory()->create();

        ResourceRecord::query()->create([
            'requerente' => 'Felipe',
            'categoria' => 'Adulto',
            'peso' => 82.5,
            'faixa' => 'azul',
            'luta' => 'Final',
        ]);

        $response = $this
            ->actingAs($user)
            ->getJson('/api/resources');

        $response
            ->assertOk()
            ->assertJsonPath('data.0.requerente', 'Felipe')
            ->assertJsonPath('data.0.categoria', 'Adulto')
            ->assertJsonPath('current_page', 1)
            ->assertJsonPath('total', 1);
    }

    public function test_authenticated_user_can_create_resource(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->postJson('/api/resources', [
                'requerente' => 'Felipe',
                'categoria' => 'Adulto',
                'peso' => 82.5,
                'faixa' => 'azul',
                'luta' => 'Final',
                'area' => 'Area 1',
                'arbitro' => 'Carlos',
                'vencedor' => 'white',
                'observacao' => 'Revisao solicitada.',
                'referees' => ['Arbitro Um', 'Arbitro Dois', ''],
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('resource.requerente', 'Felipe')
            ->assertJsonPath('resource.observacao', 'Revisao solicitada.')
            ->assertJsonCount(2, 'resource.referees')
            ->assertJsonPath('resource.referees.0.referee_name', 'Arbitro Um');

        $this->assertDatabaseHas('resources', [
            'requerente' => 'Felipe',
            'categoria' => 'Adulto',
            'observação' => 'Revisao solicitada.',
        ]);

        $this->assertDatabaseHas('resources_referees', [
            'referee_name' => 'Arbitro Um',
        ]);
    }

    public function test_authenticated_user_can_search_resources(): void
    {
        $user = User::factory()->create();

        ResourceRecord::query()->create([
            'requerente' => 'Maria',
            'categoria' => 'Adulto',
            'peso' => 70,
            'faixa' => 'roxa',
            'luta' => 'Final',
        ]);

        ResourceRecord::query()->create([
            'requerente' => 'Carlos',
            'categoria' => 'Juvenil',
            'peso' => 65,
            'faixa' => 'azul',
            'luta' => 'Quartas',
        ]);

        $response = $this
            ->actingAs($user)
            ->getJson('/api/resources?search=Maria');

        $response
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.requerente', 'Maria');
    }

    public function test_authenticated_user_can_update_resource(): void
    {
        $user = User::factory()->create();
        $resource = ResourceRecord::query()->create([
            'requerente' => 'Felipe',
            'categoria' => 'Adulto',
            'peso' => 82.5,
            'faixa' => 'azul',
            'luta' => 'Final',
        ]);
        $resource->referees()->create([
            'referee_name' => 'Arbitro Antigo',
            'code' => 'old-code',
        ]);

        $response = $this
            ->actingAs($user)
            ->putJson("/api/resources/{$resource->id}", [
                'requerente' => 'Felipe Editado',
                'categoria' => 'Master',
                'peso' => 84,
                'faixa' => 'roxa',
                'luta' => 'Semifinal',
                'observacao' => 'Atualizado.',
                'referees' => ['Arbitro Novo'],
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('resource.requerente', 'Felipe Editado')
            ->assertJsonPath('resource.observacao', 'Atualizado.')
            ->assertJsonPath('resource.referees.0.referee_name', 'Arbitro Novo');
    }

    public function test_referee_can_fill_assessment_with_public_code(): void
    {
        $resource = ResourceRecord::query()->create([
            'requerente' => 'Felipe',
            'categoria' => 'Adulto',
            'peso' => 82.5,
            'faixa' => 'azul',
            'luta' => 'Final',
        ]);

        $referee = ResourceReferee::query()->create([
            'resource_id' => $resource->id,
            'referee_name' => 'Arbitro Um',
            'code' => 'public-code',
        ]);

        $this
            ->getJson("/api/referees/{$referee->code}")
            ->assertOk()
            ->assertJsonPath('assessment.referee_name', 'Arbitro Um')
            ->assertJsonPath('assessment.resource.requerente', 'Felipe');

        $this
            ->putJson("/api/referees/{$referee->code}", [
                'white_pontos' => 2,
                'white_vantagens' => 1,
                'white_punicao' => 0,
                'color_pontos' => 0,
                'color_vantagens' => 0,
                'color_punicao' => 1,
                'victory' => 'white',
                'observacao' => 'Recurso deferido.',
            ])
            ->assertOk()
            ->assertJsonPath('assessment.victory', 'white');

        $this->assertDatabaseHas('resources_referees', [
            'id' => $referee->id,
            'white_pontos' => 2,
            'victory' => 'white',
            'observacao' => 'Recurso deferido.',
        ]);
    }

    public function test_authenticated_user_can_finish_resource(): void
    {
        $user = User::factory()->create();
        $resource = ResourceRecord::query()->create([
            'requerente' => 'Felipe',
            'categoria' => 'Adulto',
            'peso' => 82.5,
            'faixa' => 'azul',
            'luta' => 'Final',
            'vencedor' => 'white',
        ]);
        foreach (['Arbitro Um', 'Arbitro Dois', 'Arbitro Tres'] as $index => $name) {
            $resource->referees()->create([
                'referee_name' => $name,
                'code' => "code-{$index}",
                'victory' => 'white',
            ]);
        }

        $response = $this
            ->actingAs($user)
            ->patchJson("/api/resources/{$resource->id}/finish");

        $response
            ->assertOk()
            ->assertJsonPath('resource.status', 'finalizado');
    }

    public function test_authenticated_user_can_delete_resource(): void
    {
        $user = User::factory()->create();
        $resource = ResourceRecord::query()->create([
            'requerente' => 'Felipe',
            'categoria' => 'Adulto',
            'peso' => 82.5,
            'faixa' => 'azul',
            'luta' => 'Final',
        ]);

        $this
            ->actingAs($user)
            ->deleteJson("/api/resources/{$resource->id}")
            ->assertOk();

        $this->assertDatabaseMissing('resources', [
            'id' => $resource->id,
        ]);
    }
}

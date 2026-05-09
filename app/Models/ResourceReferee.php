<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'resource_id',
    'code',
    'referee_name',
    'white_pontos',
    'white_vantagens',
    'white_punicao',
    'color_pontos',
    'color_vantagens',
    'color_punicao',
    'victory',
    'observacao',
])]
class ResourceReferee extends Model
{
    protected $table = 'resources_referees';

    protected function casts(): array
    {
        return [
            'white_pontos' => 'integer',
            'white_vantagens' => 'integer',
            'white_punicao' => 'integer',
            'color_pontos' => 'integer',
            'color_vantagens' => 'integer',
            'color_punicao' => 'integer',
        ];
    }

    public function resource(): BelongsTo
    {
        return $this->belongsTo(ResourceRecord::class, 'resource_id');
    }
}

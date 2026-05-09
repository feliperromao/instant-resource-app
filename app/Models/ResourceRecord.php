<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'requerente',
    'categoria',
    'peso',
    'faixa',
    'luta',
    'area',
    'arbitro',
    'vencedor',
    'observação',
    'status',
])]
class ResourceRecord extends Model
{
    protected $table = 'resources';

    public function referees(): HasMany
    {
        return $this->hasMany(ResourceReferee::class, 'resource_id');
    }

    protected function casts(): array
    {
        return [
            'peso' => 'float',
        ];
    }
}

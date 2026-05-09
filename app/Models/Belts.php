<?php

class Faixas
{
    public const BRANCA = 'branca';
    public const CINZA = 'cinza';
    public const AMARELA = 'amarela';
    public const LARANJA = 'laranja';
    public const VERDE = 'verde';
    public const AZUL = 'azul';
    public const ROXA = 'roxa';
    public const PRETA = 'preta';

    public static function all(): array
    {
        return [
            self::BRANCA,
            self::CINZA,
            self::AMARELA,
            self::LARANJA,
            self::VERDE,
            self::AZUL,
            self::ROXA,
            self::PRETA,
        ];
    }
}
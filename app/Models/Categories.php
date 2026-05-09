<?php

class Faixas
{
    public const PRE_MIRIM = 'PRÉ - MIRIM';
    public const MIRIM = 'MIRIM';
    public const INFANTIL_1 = 'INFANTIL 1';
    public const INFANTIL_2 = 'INFANTIL 2';
    public const INFANTO_JUVENIL_1 = 'INFANTO JUVENIL 1';
    public const INFANTO_JUVENIL_2 = 'INFANTO JUVENIL 2';
    public const JUVENIL = 'JUVENIL';
    public const ADULTO = 'ADULTO';
    public const MASTER_1 = 'MASTER 1';
    public const MASTER_2 = 'MASTER 2';
    public const MASTER_3 = 'MASTER 3';
    public const MASTER_4 = 'MASTER 4';
    public const MASTER_5 = 'MASTER 5';

    public static function all(): array
    {
        return [
            self::PRE_MIRIM,
            self::MIRIM,
            self::INFANTIL_1,
            self::INFANTIL_2,
            self::INFANTO_JUVENIL_1,
            self::INFANTO_JUVENIL_2,
            self::JUVENIL,
            self::ADULTO,
            self::MASTER_1,
            self::MASTER_2,
            self::MASTER_3,
            self::MASTER_4,
            self::MASTER_5,
        ];
    }
}
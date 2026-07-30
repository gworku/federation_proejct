<?php

namespace App\Support;

class ZoneCoordinates
{
    /** @var array<string, array{lat: float, lng: float}> */
    public const COORDINATES = [
        'East Shewa' => ['lat' => 8.54, 'lng' => 39.27],
        'West Shewa' => ['lat' => 9.0, 'lng' => 37.85],
        'North Shewa' => ['lat' => 9.8, 'lng' => 38.7],
        'Southwest Shewa' => ['lat' => 8.55, 'lng' => 38.05],
        'Jimma' => ['lat' => 7.67, 'lng' => 36.83],
        'Illu Aba Bor' => ['lat' => 8.15, 'lng' => 35.6],
        'Buno Bedele' => ['lat' => 8.45, 'lng' => 36.35],
        'East Wollega' => ['lat' => 9.08, 'lng' => 36.55],
        'West Wollega' => ['lat' => 9.1, 'lng' => 35.5],
        'Horo Guduru' => ['lat' => 9.55, 'lng' => 37.05],
        'Kelem Wollega' => ['lat' => 8.85, 'lng' => 34.85],
        'Arsi' => ['lat' => 7.95, 'lng' => 39.15],
        'West Arsi' => ['lat' => 7.2, 'lng' => 38.6],
        'Bale' => ['lat' => 7.0, 'lng' => 40.0],
        'East Bale' => ['lat' => 6.9, 'lng' => 40.7],
        'Guji' => ['lat' => 5.8, 'lng' => 39.2],
        'West Guji' => ['lat' => 5.65, 'lng' => 38.25],
        'Borana' => ['lat' => 4.9, 'lng' => 38.1],
        'East Hararghe' => ['lat' => 9.15, 'lng' => 42.1],
        'West Hararghe' => ['lat' => 8.9, 'lng' => 40.75],
    ];

    public static function forZone(string $zone): array
    {
        return self::COORDINATES[$zone] ?? ['lat' => 8.5, 'lng' => 39.0];
    }
}

<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json([
    'name' => 'OWUF API',
    'health' => url('/api/health'),
]));

<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\RefereeAssessmentController;
use App\Http\Controllers\ResourceController;
use Illuminate\Support\Facades\Route;

Route::get('/auth/user', [AuthenticatedSessionController::class, 'user'])
    ->middleware('auth')
    ->name('auth.user');

Route::post('/auth/login', [AuthenticatedSessionController::class, 'store'])
    ->middleware('guest')
    ->name('auth.login');

Route::post('/auth/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('auth.logout');

Route::get('/api/resources', [ResourceController::class, 'index'])
    ->middleware('auth')
    ->name('resources.index');

Route::post('/api/resources', [ResourceController::class, 'store'])
    ->middleware('auth')
    ->name('resources.store');

Route::get('/api/resources/{resource}', [ResourceController::class, 'show'])
    ->middleware('auth')
    ->name('resources.show');

Route::put('/api/resources/{resource}', [ResourceController::class, 'update'])
    ->middleware('auth')
    ->name('resources.update');

Route::patch('/api/resources/{resource}/finish', [ResourceController::class, 'finish'])
    ->middleware('auth')
    ->name('resources.finish');

Route::delete('/api/resources/{resource}', [ResourceController::class, 'destroy'])
    ->middleware('auth')
    ->name('resources.destroy');

Route::get('/api/referees/{code}', [RefereeAssessmentController::class, 'show'])
    ->name('referees.show');

Route::put('/api/referees/{code}', [RefereeAssessmentController::class, 'update'])
    ->name('referees.update');

Route::get('/login', function () {
    return view('app');
})->name('login');

Route::get('/referees/{code}', function () {
    return view('app');
});

Route::get('/resources/{any?}', function () {
    return view('app');
})
    ->middleware('auth')
    ->where('any', '.*');

Route::get('/', function () {
    return view('app');
});

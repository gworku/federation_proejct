<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\Audit;
use App\Support\Roles;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $user = $request->user('api');
        $data = $request->validate([
            'file' => [
                'required',
                'file',
                'max:10240',
                'mimes:jpg,jpeg,png,webp,gif,pdf,doc,docx,xls,xlsx',
            ],
            'folder' => ['nullable', 'string', 'max:64', 'regex:/^[a-z0-9_-]+$/'],
        ]);

        $folder = $data['folder'] ?? 'uploads';
        $financeFolders = ['invoices', 'receipts', 'finance'];
        $isFinanceUpload = in_array($folder, $financeFolders, true);

        $isUtilityReceipt = $folder === 'receipts'
            && $user !== null
            && $user->role === Roles::UTILITY_USER;
        $allowed = $isFinanceUpload
            ? Roles::isFinanceStaff($user) || Roles::isAdministrator($user) || $isUtilityReceipt
            : Roles::isContentEditorOrAdmin($user, $request->method());

        if (! $allowed) {
            return response()->json([
                'detail' => 'You do not have permission to upload media.',
            ], 403);
        }

        $file = $data['file'];
        $ext = strtolower($file->getClientOriginalExtension() ?: 'bin');
        $name = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $filename = ($name !== '' ? $name : 'file').'-'.Str::lower(Str::random(8)).'.'.$ext;

        $diskRoot = $isFinanceUpload ? 'finance' : 'cms';
        $path = $file->storeAs("{$diskRoot}/{$folder}", $filename, 'public');
        $url = Storage::disk('public')->url($path);

        Audit::record($user, 'media.upload', $request->ip(), [
            'path' => $path,
            'mime' => $file->getClientMimeType(),
            'size' => $file->getSize(),
        ]);

        return response()->json([
            'url' => $url,
            'path' => $path,
            'name' => $file->getClientOriginalName(),
            'mime' => $file->getClientMimeType(),
            'size' => $file->getSize(),
        ], 201);
    }
}

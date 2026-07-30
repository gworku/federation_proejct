<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use ZipArchive;

class BackupService
{
    /** @var array<int, class-string<Model>> Parent tables first for restore inserts. */
    private array $exportModels = [
        \App\Models\User::class,
        \App\Models\AccessRequest::class,
        \App\Models\Utility::class,
        \App\Models\Project::class,
        \App\Models\ProjectMilestone::class,
        \App\Models\NewsArticle::class,
        \App\Models\SiteStatistic::class,
        \App\Models\Publication::class,
        \App\Models\ContactMessage::class,
        \App\Models\ServiceRequest::class,
        \App\Models\LeadershipProfile::class,
        \App\Models\Event::class,
        \App\Models\GalleryItem::class,
        \App\Models\NewsletterSubscriber::class,
        \App\Models\MembershipApplication::class,
        \App\Models\EventRegistration::class,
        \App\Models\TrainingCourse::class,
        \App\Models\TrainingRegistration::class,
        \App\Models\Partner::class,
        \App\Models\PartnershipInquiry::class,
        \App\Models\ProcurementNotice::class,
        \App\Models\ProcurementInterest::class,
        \App\Models\KnowledgeDocument::class,
        \App\Models\ConsultancyRequest::class,
        \App\Models\LocaleContent::class,
        \App\Models\Risk::class,
        \App\Models\StrategicKra::class,
        \App\Models\Indicator::class,
        \App\Models\IndicatorResult::class,
        \App\Models\UtilityKpi::class,
        \App\Models\Notification::class,
        \App\Models\NotificationRead::class,
        \App\Models\Contribution::class,
        \App\Models\ContributionPayment::class,
        \App\Models\AuditEvent::class,
    ];

    public function root(): string
    {
        $root = storage_path('app/backups');
        if (! is_dir($root)) {
            mkdir($root, 0755, true);
        }

        return $root;
    }

    public function create(string $label = 'manual'): array
    {
        $stamp = now()->utc()->format('Ymd-His');
        $safeLabel = substr(preg_replace('/[^A-Za-z0-9\-_]/', '-', $label) ?? 'manual', 0, 40) ?: 'manual';
        $filename = "owuf-backup-{$stamp}-{$safeLabel}.zip";
        $path = $this->root().DIRECTORY_SEPARATOR.$filename;

        $meta = [
            'created_at' => now()->utc()->toIso8601String(),
            'label' => $label,
            'database' => DB::connection()->getDriverName(),
            'apps' => ['accounts', 'cms', 'utilities', 'projects', 'ops', 'membership', 'auditlog', 'finance'],
            'version' => 2,
        ];

        $zip = new ZipArchive;
        if ($zip->open($path, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new \RuntimeException('Unable to create backup archive.');
        }

        $zip->addFromString('meta.json', json_encode($meta, JSON_PRETTY_PRINT));

        foreach ($this->exportModels as $modelClass) {
            /** @var Model $instance */
            $instance = new $modelClass;
            $table = $instance->getTable();
            if (! Schema::hasTable($table)) {
                continue;
            }

            $rows = $modelClass::query()
                ->orderBy($instance->getKeyName())
                ->get()
                ->map(function (Model $row) use ($table): array {
                    // Include hidden attributes (e.g. password hashes) and only real columns.
                    $attrs = $row->getAttributes();
                    $columns = array_flip(Schema::getColumnListing($table));

                    return array_intersect_key($attrs, $columns);
                })
                ->values()
                ->all();

            $zip->addFromString("data/{$table}.json", json_encode($rows, JSON_PRETTY_PRINT));
        }

        $dbPath = config('database.connections.'.config('database.default').'.database');
        if (DB::connection()->getDriverName() === 'sqlite' && is_string($dbPath) && file_exists($dbPath)) {
            $zip->addFile($dbPath, 'sqlite/db.sqlite3');
        }

        $zip->close();

        return [
            'filename' => $filename,
            'path' => $path,
            'size_bytes' => filesize($path) ?: 0,
            'created_at' => $meta['created_at'],
            'label' => $label,
        ];
    }

    /**
     * Restore application tables from a backup ZIP.
     * Replaces current rows for each exported table.
     *
     * @return array{filename: string, tables: array<string, int>, restored_at: string}
     */
    public function restore(string $filename): array
    {
        $path = $this->resolve($filename);
        if ($path === null) {
            throw new \InvalidArgumentException('Backup not found.');
        }

        $zip = new ZipArchive;
        if ($zip->open($path) !== true) {
            throw new \RuntimeException('Unable to open backup archive.');
        }

        $metaRaw = $zip->getFromName('meta.json');
        if ($metaRaw === false) {
            $zip->close();
            throw new \RuntimeException('Backup is missing meta.json.');
        }

        $counts = [];

        try {
            Schema::disableForeignKeyConstraints();

            DB::transaction(function () use ($zip, &$counts): void {
                // Clear child tables first, then parents.
                foreach (array_reverse($this->exportModels) as $modelClass) {
                    /** @var Model $instance */
                    $instance = new $modelClass;
                    $table = $instance->getTable();
                    if (! Schema::hasTable($table)) {
                        continue;
                    }
                    DB::table($table)->delete();
                }

                foreach ($this->exportModels as $modelClass) {
                    /** @var Model $instance */
                    $instance = new $modelClass;
                    $table = $instance->getTable();
                    if (! Schema::hasTable($table)) {
                        continue;
                    }

                    $raw = $zip->getFromName("data/{$table}.json");
                    if ($raw === false) {
                        $counts[$table] = 0;
                        continue;
                    }

                    $rows = json_decode($raw, true);
                    if (! is_array($rows)) {
                        throw new \RuntimeException("Invalid JSON for table {$table}.");
                    }

                    $columns = Schema::getColumnListing($table);
                    $columnFlip = array_flip($columns);
                    $prepared = [];

                    foreach ($rows as $row) {
                        if (! is_array($row)) {
                            continue;
                        }
                        $filtered = array_intersect_key($row, $columnFlip);
                        if ($table === 'users' && empty($filtered['password'])) {
                            // Older backups hid password hashes; force a reset-required hash.
                            $filtered['password'] = Hash::make(Str::password(32));
                        }
                        $prepared[] = $this->normalizeRowForInsert($filtered);
                    }

                    foreach (array_chunk($prepared, 100) as $chunk) {
                        if ($chunk !== []) {
                            DB::table($table)->insert($chunk);
                        }
                    }

                    $counts[$table] = count($prepared);
                }
            });
        } finally {
            Schema::enableForeignKeyConstraints();
            $zip->close();
        }

        return [
            'filename' => $filename,
            'tables' => $counts,
            'restored_at' => now()->utc()->toIso8601String(),
            'rows_total' => array_sum($counts),
        ];
    }

    /** @param array<string, mixed> $row */
    private function normalizeRowForInsert(array $row): array
    {
        foreach ($row as $key => $value) {
            if (is_bool($value)) {
                $row[$key] = $value ? 1 : 0;
            } elseif (is_array($value)) {
                $row[$key] = json_encode($value);
            }
        }

        return $row;
    }

    /** @return array<int, array<string, mixed>> */
    public function list(): array
    {
        $files = glob($this->root().DIRECTORY_SEPARATOR.'owuf-backup-*.zip') ?: [];
        rsort($files);

        return array_map(function (string $path): array {
            return [
                'filename' => basename($path),
                'size_bytes' => filesize($path) ?: 0,
                'created_at' => gmdate('c', (int) filemtime($path)),
            ];
        }, $files);
    }

    public function resolve(string $filename): ?string
    {
        if (str_contains($filename, '/') || str_contains($filename, '\\') || str_contains($filename, '..')) {
            return null;
        }

        if (! preg_match('/^owuf-backup-[A-Za-z0-9._-]+\.zip$/', $filename)) {
            return null;
        }

        $path = $this->root().DIRECTORY_SEPARATOR.$filename;
        if (! is_file($path)) {
            return null;
        }

        return $path;
    }

    public function delete(string $filename): bool
    {
        $path = $this->resolve($filename);
        if ($path === null) {
            return false;
        }

        return File::delete($path);
    }
}

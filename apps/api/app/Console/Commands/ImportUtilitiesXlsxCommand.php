<?php

namespace App\Console\Commands;

use App\Models\SiteStatistic;
use App\Models\Utility;
use Illuminate\Console\Command;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ImportUtilitiesXlsxCommand extends Command
{
    protected $signature = 'utilities:import-xlsx {path?} {--replace-generated}';

    protected $description = 'Import member utilities from the federation Excel master list';

    private const GRADE_MAP = [
        'Tokkoffaa Addaa' => 'Special 1st',
        'Tokkoffaa' => '1st',
        'Lammaffaa' => '2nd',
        'Sadaffaa' => '3rd',
        'Afraffaa' => '4th',
        'Shanaffaa' => '5th',
    ];

    private const ZONE_MAP = [
        'Shawaa Bahaa' => 'East Shewa',
        'Shawaa Lixaa' => 'West Shewa',
        'Shawaa Kaabaa' => 'North Shewa',
        'Shawaa Kibbaa' => 'Southwest Shewa',
        'Shawaa Kibba Lixaa' => 'Southwest Shewa',
        'Jimma' => 'Jimma',
        'Jimmaa' => 'Jimma',
        'Iluu Abbaa Boor' => 'Illu Aba Bor',
        'Bunnoo Beddellee' => 'Buno Bedele',
        'B/Baddallee' => 'Buno Bedele',
        'Baddallee' => 'Buno Bedele',
        'Wallagga Bahaa' => 'East Wollega',
        'Wallaggaa Bahaa' => 'East Wollega',
        'Wallagga Lixaa' => 'West Wollega',
        'Wallaggaa Lixaa' => 'West Wollega',
        'Horroo Guduruu' => 'Horo Guduru',
        'Horroo Guduru Wallaggaa' => 'Horo Guduru',
        'Qellem Wallaggaa' => 'Kelem Wollega',
        'Qeellam Wallaggaa' => 'Kelem Wollega',
        'Arsii' => 'Arsi',
        'Arsii Lixaa' => 'West Arsi',
        'Baalee' => 'Bale',
        'Baalee Bahaa' => 'East Bale',
        'Gujii' => 'Guji',
        'Gujii Lixaa' => 'West Guji',
        'Boorana' => 'Borana',
        'Harargee Bahaa' => 'East Hararghe',
        'Harargee Lixaa' => 'West Hararghe',
        'Finfinnee' => 'East Shewa',
        'Oromiyaa Special Zone' => 'East Shewa',
    ];

    private const DATA_SHEETS = [
        'Sad. 1ffaa Addaa' => 'Special 1st',
        'Sad. 1ffaa' => '1st',
        'Sad. 2ffaa' => '2nd',
        'Sad. 3ffaa' => '3rd',
        'Sad. 4ffaa' => '4th',
        'Sad.5ffaa' => '5th',
    ];

    public function handle(): int
    {
        $path = $this->argument('path') ?: base_path('../../1Utility List Updated, as of March 23-2025.xlsx');

        if (! is_file($path)) {
            $this->error("Excel file not found: {$path}");

            return self::FAILURE;
        }

        if ($this->option('replace-generated')) {
            $deleted = Utility::query()->where('name', 'like', '%Town %')->delete();
            $this->info("Removed {$deleted} generated placeholder utilities");
        }

        $spreadsheet = IOFactory::load($path);
        $created = 0;
        $updated = 0;

        foreach (self::DATA_SHEETS as $sheetName => $defaultGrade) {
            if (! $spreadsheet->sheetNameExists($sheetName)) {
                $this->warn("Missing sheet: {$sheetName}");
                continue;
            }

            $sheet = $spreadsheet->getSheetByName($sheetName);
            $rows = $sheet->toArray(null, true, true, false);

            foreach (array_slice($rows, 2) as $row) {
                $name = $row[1] ?? null;
                $gradeRaw = $row[2] ?? null;
                $zoneRaw = $row[3] ?? null;

                if (! is_string($name) || trim($name) === '') {
                    continue;
                }

                $name = preg_replace('/\s+/', ' ', trim($name)) ?? '';
                if (str_contains($name, '=') || str_starts_with(strtolower($name), 'tokkoffaa')) {
                    continue;
                }

                $grade = self::GRADE_MAP[trim((string) $gradeRaw)] ?? $defaultGrade;
                $zone = $this->mapZone((string) $zoneRaw);
                $city = trim(str_replace(['Magaalaa ', 'Magaala '], '', $name));
                $slugBase = Str::slug($name);
                $slugBase = substr($slugBase, 0, 45) ?: Str::slug('utility-'.($created + $updated + 1));
                $slug = $slugBase;
                $suffix = 2;
                while (Utility::query()->where('slug', $slug)->where('name', '!=', $name)->exists()) {
                    $slug = substr("{$slugBase}-{$suffix}", 0, 50);
                    $suffix++;
                }

                $utility = Utility::query()->updateOrCreate(
                    ['name' => $name],
                    [
                        'slug' => $slug,
                        'zone' => $zone,
                        'city' => $city,
                        'grade' => $grade,
                        'status' => 'Active',
                        'is_public' => true,
                    ]
                );

                if ($utility->wasRecentlyCreated) {
                    $created++;
                } else {
                    $updated++;
                }
            }
        }

        SiteStatistic::query()->updateOrCreate(
            ['key' => 'utilities'],
            [
                'label' => 'Member Utilities',
                'value' => Utility::query()->count(),
                'sort_order' => 0,
                'is_public' => true,
            ]
        );

        $total = Utility::query()->count();
        $this->info("Import complete. created={$created} updated={$updated} total={$total}");

        return self::SUCCESS;
    }

    private function mapZone(string $raw): string
    {
        $value = preg_replace('/\s+/', ' ', trim($raw)) ?? '';

        if (isset(self::ZONE_MAP[$value])) {
            return self::ZONE_MAP[$value];
        }

        foreach (self::ZONE_MAP as $key => $mapped) {
            $lowerValue = strtolower($value);
            $lowerKey = strtolower($key);
            if (str_contains($lowerValue, $lowerKey) || str_contains($lowerKey, $lowerValue)) {
                return $mapped;
            }
        }

        return $value !== '' ? $value : 'Unknown';
    }
}

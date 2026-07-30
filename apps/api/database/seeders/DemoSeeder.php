<?php

namespace Database\Seeders;

use App\Models\AccessRequest;
use App\Models\ConsultancyRequest;
use App\Models\ContactMessage;
use App\Models\Contribution;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\GalleryItem;
use App\Models\Indicator;
use App\Models\IndicatorResult;
use App\Models\KnowledgeDocument;
use App\Models\LeadershipProfile;
use App\Models\LocaleContent;
use App\Models\MembershipApplication;
use App\Models\NewsArticle;
use App\Models\NewsletterSubscriber;
use App\Models\Notification;
use App\Models\Partner;
use App\Models\PartnershipInquiry;
use App\Models\ProcurementInterest;
use App\Models\ProcurementNotice;
use App\Models\Project;
use App\Models\ProjectMilestone;
use App\Models\Publication;
use App\Models\Risk;
use App\Models\ServiceRequest;
use App\Models\SiteStatistic;
use App\Models\StrategicKra;
use App\Models\TrainingCourse;
use App\Models\TrainingRegistration;
use App\Models\User;
use App\Models\Utility;
use App\Models\UtilityKpi;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedUsers();
        $this->seedUtilities();
        $this->seedProjects();
        $this->seedStats();
        $this->seedNews();
        $this->seedPublications();
        $this->seedLeadership();
        $this->seedEvents();
        $this->seedGallery();
        $this->seedServiceRequests();
        $this->seedPartners();
        $this->seedTraining();
        $this->seedKnowledgeDocs();
        $this->seedProcurement();
        $this->seedMembership();
        $this->seedConsultancy();
        $this->seedLocaleContent();
        $this->seedOps();
        $this->seedContributions();
        $this->seedInboxSamples();
    }

    private function seedUsers(): void
    {
        $users = [
            ['admin', 'admin@owuf.gov.et', 'Admin@123', 'administrator', 'System', 'Administrator', true, true],
            ['manager', 'manager@owuf.gov.et', 'Manager@123', 'management', 'Federation', 'Manager', false, true],
            ['editor', 'editor@owuf.gov.et', 'Editor@123', 'content_editor', 'Content', 'Editor', false, false],
            ['projects', 'projects@owuf.gov.et', 'Project@123', 'project_officer', 'Project', 'Officer', false, false],
            ['finance', 'finance@owuf.gov.et', 'Finance@123', 'finance_officer', 'Finance', 'Officer', false, false],
            ['procurement', 'procurement@owuf.gov.et', 'Procure@123', 'procurement_officer', 'Procurement', 'Officer', false, false],
            ['utility', 'utility@owuf.gov.et', 'Utility@123', 'utility_user', 'Adama', 'Utility', false, false],
            ['auditor', 'auditor@owuf.gov.et', 'Auditor@123', 'auditor', 'Internal', 'Auditor', false, false],
        ];

        foreach ($users as [$username, $email, $password, $role, $first, $last, $super, $staff]) {
            User::query()->updateOrCreate(
                ['username' => $username],
                [
                    'email' => $email,
                    'password' => $password,
                    'role' => $role,
                    'first_name' => $first,
                    'last_name' => $last,
                    'organization' => $role === 'utility_user'
                        ? 'Adama Water Supply & Sewerage Service Enterprise'
                        : '',
                    'is_superuser' => $super,
                    'is_staff' => $staff,
                    'is_active' => true,
                ]
            );
        }
    }

    private function seedUtilities(): void
    {
        $named = [
            ['Adama Water Supply & Sewerage Service Enterprise', 'East Shewa', 'Adama', 'Special 1st', 'Digitizing', 85000],
            ['Bishoftu Water Supply & Sewerage Service', 'East Shewa', 'Bishoftu', '2nd', 'Active', 29000],
            ['Mojo Town Water Supply Service', 'East Shewa', 'Mojo', '3rd', 'Active', 12000],
            ['Metehara Town Water Supply Service', 'East Shewa', 'Metehara', '3rd', 'Active', 9500],
            ['Dukem Town Water Supply Service', 'East Shewa', 'Dukem', '3rd', 'Digitizing', 11000],
            ['Ambo Town Water Supply & Sewerage Service', 'West Shewa', 'Ambo', '1st', 'Active', 34000],
            ['Holeta Town Water Supply Service', 'West Shewa', 'Holeta', '2nd', 'Active', 18000],
            ['Ginchi Town Water Supply Service', 'West Shewa', 'Ginchi', '3rd', 'Active', 8000],
            ['Gedo Town Water Supply Service', 'West Shewa', 'Gedo', '3rd', 'Digitizing', 7200],
            ['Jimma Town Water Supply & Sewerage Service', 'Jimma', 'Jimma', '1st', 'Active', 52000],
            ['Agaro Town Water Supply Service', 'Jimma', 'Agaro', '2nd', 'Active', 16000],
            ['Limmu Genet Town Water Supply Service', 'Jimma', 'Limmu Genet', '3rd', 'Active', 9000],
            ['Metu Town Water Supply Service', 'Illubabor', 'Metu', '2nd', 'Active', 22000],
            ['Gore Town Water Supply Service', 'Illubabor', 'Gore', '3rd', 'Active', 7500],
            ['Bedele Town Water Supply Service', 'Illubabor', 'Bedele', '2nd', 'Digitizing', 14000],
            ['Robe Town Water Supply Service', 'Bale', 'Robe', '1st', 'Active', 28000],
            ['Goba Town Water Supply Service', 'Bale', 'Goba', '2nd', 'Active', 15000],
            ['Ginnir Town Water Supply Service', 'Bale', 'Ginnir', '3rd', 'Active', 8500],
            ['Asella Town Water Supply & Sewerage Service', 'Arsi', 'Asella', '1st', 'Active', 36000],
            ['Bekoji Town Water Supply Service', 'Arsi', 'Bekoji', '3rd', 'Active', 7800],
            ['Dera Town Water Supply Service', 'Arsi', 'Dera', '3rd', 'Digitizing', 6500],
            ['Shashemene Water Supply Service', 'West Arsi', 'Shashemene', '1st', 'Digitizing', 38000],
            ['Arsi Negele Town Water Supply Service', 'West Arsi', 'Arsi Negele', '2nd', 'Active', 19000],
            ['Kofele Town Water Supply Service', 'West Arsi', 'Kofele', '3rd', 'Active', 8200],
            ['Nekemte Water Supply & Sewerage Service', 'East Wollega', 'Nekemte', '1st', 'Active', 41000],
            ['Gimbi Town Water Supply Service', 'West Wollega', 'Gimbi', '2nd', 'Active', 17000],
            ['Dembi Dollo Town Water Supply Service', 'West Wollega', 'Dembi Dollo', '2nd', 'Digitizing', 15500],
            ['Shambu Town Water Supply Service', 'Horro Guduru', 'Shambu', '2nd', 'Active', 13000],
            ['Fincha Town Water Supply Service', 'Horro Guduru', 'Fincha', '3rd', 'Active', 7000],
            ['Fiche Town Water Supply Service', 'North Shewa', 'Fiche', '2nd', 'Active', 21000],
            ['Sululta Town Water Supply Service', 'North Shewa', 'Sululta', '2nd', 'Digitizing', 16000],
            ['Waliso Town Water Supply Service', 'Southwest Shewa', 'Waliso', '1st', 'Active', 25000],
            ['Tulu Bolo Town Water Supply Service', 'Southwest Shewa', 'Tulu Bolo', '3rd', 'Active', 6800],
            ['Negele Borana Town Water Supply Service', 'Guji', 'Negele Borana', '1st', 'Active', 24000],
            ['Adola Town Water Supply Service', 'Guji', 'Adola', '3rd', 'Active', 9000],
            ['Yabello Town Water Supply Service', 'Borena', 'Yabello', '2nd', 'Active', 14000],
            ['Moyale Town Water Supply Service', 'Borena', 'Moyale', '2nd', 'Digitizing', 12500],
            ['Bule Hora Town Water Supply Service', 'West Guji', 'Bule Hora', '2nd', 'Active', 18000],
            ['Kercha Town Water Supply Service', 'West Guji', 'Kercha', '3rd', 'Active', 7600],
            ['Horo Town Water Supply Service', 'Horo', 'Horo', '3rd', 'Active', 5400],
            ['Haramaya Town Water Supply Service', 'East Hararghe', 'Haramaya', '2nd', 'Active', 20000],
            ['Chiro Town Water Supply Service', 'West Hararghe', 'Chiro', '2nd', 'Digitizing', 17500],
        ];

        foreach ($named as [$name, $zone, $city, $grade, $status, $customers]) {
            Utility::query()->updateOrCreate(
                ['slug' => Str::slug($name)],
                compact('name', 'zone', 'city', 'grade', 'status', 'customers') + ['is_public' => true]
            );
        }
    }

    private function seedProjects(): void
    {
        $projects = [
            ['Federation Capacity Development (KRA 1)', 'federation-capacity-development', 'OWUF Headquarters', 'Institutional Capacity', 'Active', 35, 'Strengthen OWUF staffing, governance, ICT, M&E, risk management, and resource mobilization.'],
            ['Members Engagement & Development (KRA 2)', 'members-engagement-development', 'Oromia Region', 'Member Services', 'Active', 48, 'Expand membership participation, benchmarking, and capacity building.'],
            ['Communication & Advocacy (KRA 3)', 'communication-advocacy-kra3', 'Regional & National', 'Advocacy', 'Active', 42, 'Improve corporate visibility and policy advocacy.'],
        ];

        foreach ($projects as [$title, $slug, $location, $category, $status, $progress, $description]) {
            $project = Project::query()->updateOrCreate(
                ['slug' => $slug],
                compact('title', 'location', 'category', 'status', 'progress', 'description') + ['is_public' => true]
            );

            ProjectMilestone::query()->updateOrCreate(
                ['project_id' => $project->id, 'title' => 'Kick-off complete'],
                ['due_date' => now()->subMonths(2)->toDateString(), 'status' => 'done', 'sort_order' => 1]
            );
            ProjectMilestone::query()->updateOrCreate(
                ['project_id' => $project->id, 'title' => 'Mid-year review'],
                ['due_date' => now()->addMonths(2)->toDateString(), 'status' => 'in_progress', 'sort_order' => 2]
            );
        }
    }

    private function seedStats(): void
    {
        $utilityCount = Utility::query()->count() ?: 237;
        $stats = [
            ['utilities', 'Member WSPs', $utilityCount, '', 0],
            ['kras', 'Key Result Areas', 3, '', 1],
            ['plan_years', 'Strategic Plan Years', 5, '', 2],
            ['budget_etb_m', '5-Year Budget (ETB million)', 46, '', 3],
        ];

        foreach ($stats as [$key, $label, $value, $suffix, $order]) {
            SiteStatistic::query()->updateOrCreate(
                ['key' => $key],
                compact('label', 'value', 'suffix') + ['sort_order' => $order, 'is_public' => true]
            );
        }
    }

    private function seedNews(): void
    {
        $articles = [
            [
                'slug' => 'strategic-plan-2026-2030',
                'title' => 'OWUF Strategic Plan 2026-2030 Adopted',
                'category' => 'Governance',
                'excerpt' => 'The Executive Committee Board presents the Strategic Plan aligned with Proclamation No. 228/2020.',
                'body' => 'The Oromia Water Utilities Federation adopted its Strategic Plan 2026-2030 following extensive consultation with member utilities, zonal coordinators, and sector partners. The plan prioritizes federation capacity, member engagement, and advocacy for reliable water and sanitation services across Oromia.',
                'status' => 'published',
                'featured' => true,
                'published_at' => now()->subDays(2),
            ],
            [
                'slug' => 'nrw-capacity-building-cohort',
                'title' => 'Regional NRW Capacity Building Cohort Opens',
                'category' => 'Capacity Building',
                'excerpt' => 'Forty utility staff from East Shewa, Jimma, and West Arsi join the first NRW fundamentals cohort.',
                'body' => 'OWUF launched a regional non-revenue water capacity building cohort focused on district metered area design, leakage detection, and performance monitoring. Participating utilities will receive mentoring and field coaching through the training hub in Finfinnee.',
                'status' => 'published',
                'featured' => true,
                'published_at' => now()->subDays(8),
            ],
            [
                'slug' => 'oweb-partnership-renewal',
                'title' => 'OWUF and OWEB Renew Sector Partnership Framework',
                'category' => 'Partnerships',
                'excerpt' => 'A renewed framework strengthens coordination on utility performance, digitization, and policy dialogue.',
                'body' => 'The federation and the Oromia Water and Energy Bureau signed a renewed partnership framework covering joint planning, data sharing, and coordinated support to member Water Service Providers. The agreement reinforces OWUF\'s role as the collective voice of town utilities.',
                'status' => 'published',
                'featured' => false,
                'published_at' => now()->subDays(15),
            ],
            [
                'slug' => 'member-forum-jimma-announcement',
                'title' => 'Member Forum Announced for Jimma Cluster',
                'category' => 'Events',
                'excerpt' => 'Utilities from Jimma and Illubabor are invited to a two-day peer learning and planning forum.',
                'body' => 'OWUF will host a member forum in Jimma to review benchmarking results, share digitization lessons, and prioritize technical assistance requests for the coming fiscal year. Registration is open through the events page.',
                'status' => 'published',
                'featured' => false,
                'published_at' => now()->subDays(22),
            ],
            [
                'slug' => 'advocacy-brief-tariff-guidance',
                'title' => 'Advocacy Brief Calls for Clearer Tariff Guidance',
                'category' => 'Advocacy',
                'excerpt' => 'OWUF publishes a brief urging predictable tariff review processes for mid-sized town utilities.',
                'body' => 'Drawing on member consultations, the federation released an advocacy brief recommending clearer tariff guidance, transparent cost-recovery pathways, and stronger customer engagement practices. The brief will inform upcoming policy dialogues with regional stakeholders.',
                'status' => 'published',
                'featured' => false,
                'published_at' => now()->subDays(35),
            ],
            [
                'slug' => 'draft-member-forum-brief',
                'title' => 'Draft: Member Forum Briefing Notes',
                'category' => 'Events',
                'excerpt' => 'Internal draft for the upcoming regional member forum.',
                'body' => 'This draft is visible only to CMS staff.',
                'status' => 'draft',
                'featured' => false,
                'published_at' => null,
            ],
        ];

        foreach ($articles as $article) {
            NewsArticle::query()->updateOrCreate(
                ['slug' => $article['slug']],
                $article
            );
        }
    }

    private function seedPublications(): void
    {
        $publications = [
            [
                'slug' => 'owuf-strategic-plan-2026-2030',
                'title' => 'OWUF Strategic Plan 2026-2030',
                'category' => 'Strategic Plans',
                'description' => 'Five-year strategic direction for federation capacity and member development.',
                'file_type' => 'PDF',
                'file_size' => '550 KB',
                'file_url' => '/publications/owuf-strategic-plan-2026-2030.pdf',
                'published_at' => now()->toDateString(),
                'status' => 'published',
                'is_public' => true,
            ],
            [
                'slug' => 'utility-performance-guidelines-2026',
                'title' => 'Member Utility Performance Guidelines 2026',
                'category' => 'Guidelines',
                'description' => 'Practical guidance on KPIs, reporting cycles, and service quality benchmarks for town utilities.',
                'file_type' => 'PDF',
                'file_size' => '420 KB',
                'file_url' => '/publications/utility-performance-guidelines-2026.pdf',
                'published_at' => now()->subMonths(1)->toDateString(),
                'status' => 'published',
                'is_public' => true,
            ],
            [
                'slug' => 'owuf-annual-report-2025',
                'title' => 'OWUF Annual Report 2025',
                'category' => 'Annual Reports',
                'description' => 'Year-end summary of membership growth, capacity programmes, advocacy, and financial stewardship.',
                'file_type' => 'PDF',
                'file_size' => '1.2 MB',
                'file_url' => '/publications/owuf-annual-report-2025.pdf',
                'published_at' => now()->subMonths(3)->toDateString(),
                'status' => 'published',
                'is_public' => true,
            ],
        ];

        foreach ($publications as $row) {
            Publication::query()->updateOrCreate(
                ['slug' => $row['slug']],
                $row
            );
        }
    }

    private function seedLeadership(): void
    {
        $leaders = [
            [
                'name' => 'Abenet',
                'role' => 'Chairperson',
                'bio' => 'Abenet chairs the Executive Committee Board and guides federation strategy, governance, and member representation.',
                'photo_url' => '/brand/board/Abenet.jpg',
                'sort_order' => 1,
            ],
            [
                'name' => 'Ahmed',
                'role' => 'Vice Chair',
                'bio' => 'Ahmed supports board oversight and coordinates zonal engagement with member Water Service Providers.',
                'photo_url' => '/brand/board/Ahmed.jpg',
                'sort_order' => 2,
            ],
            [
                'name' => 'Demmissie',
                'role' => 'Board Member',
                'bio' => 'Demmissie contributes to programme oversight, membership development, and institutional accountability.',
                'photo_url' => '/brand/board/Demmissie.jpg',
                'sort_order' => 3,
            ],
            [
                'name' => 'Gelana Mekonin',
                'role' => 'Executive Director',
                'bio' => 'Gelana Mekonin leads day-to-day federation operations, partnerships, and delivery of member services.',
                'photo_url' => '/brand/board/Gelana Mekonin.jpg',
                'sort_order' => 4,
            ],
        ];

        foreach ($leaders as $leader) {
            LeadershipProfile::query()->updateOrCreate(
                ['name' => $leader['name']],
                $leader + ['is_public' => true]
            );
        }
    }

    private function seedEvents(): void
    {
        $events = [
            [
                'slug' => 'member-digitization-clinic',
                'title' => 'Member Digitization Clinic',
                'summary' => 'Hands-on support session for utilities implementing billing and payment systems.',
                'location' => 'Finfinnee',
                'starts_at' => now()->addDays(20),
                'ends_at' => now()->addDays(20)->addHours(6),
            ],
            [
                'slug' => 'jimma-cluster-member-forum',
                'title' => 'Jimma Cluster Member Forum',
                'summary' => 'Peer learning forum on benchmarking, NRW, and membership contribution planning.',
                'location' => 'Jimma',
                'starts_at' => now()->addDays(35),
                'ends_at' => now()->addDays(36)->addHours(4),
            ],
            [
                'slug' => 'governance-and-board-induction',
                'title' => 'Utility Governance and Board Induction Workshop',
                'summary' => 'Orientation for utility board members and managers on fiduciary roles and service standards.',
                'location' => 'Adama',
                'starts_at' => now()->addDays(50),
                'ends_at' => now()->addDays(51)->addHours(5),
            ],
        ];

        foreach ($events as $event) {
            Event::query()->updateOrCreate(
                ['slug' => $event['slug']],
                $event + ['status' => 'published', 'is_public' => true]
            );
        }
    }

    private function seedGallery(): void
    {
        $items = [
            [
                'image_url' => '/brand/photos/hero.jpg',
                'title' => 'Safe Water Access',
                'caption' => 'Communities benefiting from improved water service delivery across Oromia.',
                'category' => 'Water',
                'sort_order' => 1,
            ],
            [
                'image_url' => '/brand/photos/hero-water.jpg',
                'title' => 'Water Infrastructure',
                'caption' => 'Field operations and infrastructure supporting reliable town water supply.',
                'category' => 'Infrastructure',
                'sort_order' => 2,
            ],
            [
                'image_url' => '/brand/photos/board.png',
                'title' => 'Federation Board',
                'caption' => 'Executive Committee Board advancing water and sanitation services.',
                'category' => 'Leadership',
                'sort_order' => 3,
            ],
            [
                'image_url' => '/brand/logo.png',
                'title' => 'OWUF Emblem',
                'caption' => 'Official brand mark of the Oromia Water Utilities Federation.',
                'category' => 'Brand',
                'sort_order' => 4,
            ],
        ];

        foreach ($items as $item) {
            GalleryItem::query()->updateOrCreate(
                ['image_url' => $item['image_url']],
                $item + ['is_public' => true]
            );
        }
    }

    private function seedServiceRequests(): void
    {
        ServiceRequest::query()->firstOrCreate(
            ['email' => 'abebe.kebede@example.et', 'subject' => 'NRW assessment support'],
            [
                'name' => 'Abebe Kebede',
                'organization' => 'Adama Water Supply & Sewerage Service Enterprise',
                'category' => 'nrw',
                'description' => 'Requesting field support for district metered area design.',
                'status' => 'new',
            ]
        );
    }

    private function seedPartners(): void
    {
        $partners = [
            [
                'slug' => 'oweb',
                'name' => 'Oromia Water and Energy Bureau',
                'category' => 'government',
                'summary' => 'Regional sector bureau partnership on policy, planning, and utility performance.',
                'sort_order' => 1,
            ],
            [
                'slug' => 'regional-development-partner',
                'name' => 'Regional Water Development Partner',
                'category' => 'development',
                'summary' => 'Development partner supporting capacity building, NRW reduction, and digitization programmes.',
                'sort_order' => 2,
            ],
            [
                'slug' => 'oromia-polytechnic-institute',
                'name' => 'Oromia Polytechnic Water Institute',
                'category' => 'academia',
                'summary' => 'Academic partner for applied research, training curricula, and technician pathways.',
                'sort_order' => 3,
            ],
            [
                'slug' => 'community-water-alliance',
                'name' => 'Community Water Alliance',
                'category' => 'cso',
                'summary' => 'Civil society partner advancing customer accountability and inclusive WASH advocacy.',
                'sort_order' => 4,
            ],
        ];

        foreach ($partners as $partner) {
            Partner::query()->updateOrCreate(
                ['slug' => $partner['slug']],
                $partner + ['is_public' => true]
            );
        }
    }

    private function seedTraining(): void
    {
        $courses = [
            [
                'slug' => 'nrw-reduction-fundamentals',
                'title' => 'NRW Reduction Fundamentals',
                'summary' => 'Practical NRW assessment, DMA design, and leakage control for utility teams.',
                'topic' => 'NRW',
                'venue' => 'Finfinnee Training Hub',
                'is_online' => false,
                'starts_at' => now()->addDays(30),
                'ends_at' => now()->addDays(32),
                'registration_deadline' => now()->addDays(20),
                'capacity' => 40,
                'facilitator' => 'OWUF Technical Team',
            ],
            [
                'slug' => 'billing-and-collection-systems',
                'title' => 'Billing and Collection Systems',
                'summary' => 'Improve metering, billing workflows, payment channels, and collection efficiency.',
                'topic' => 'Billing',
                'venue' => 'Adama Learning Center',
                'is_online' => false,
                'starts_at' => now()->addDays(45),
                'ends_at' => now()->addDays(46),
                'registration_deadline' => now()->addDays(35),
                'capacity' => 35,
                'facilitator' => 'OWUF Digitization Unit',
            ],
            [
                'slug' => 'utility-governance-essentials',
                'title' => 'Utility Governance Essentials',
                'summary' => 'Board oversight, fiduciary duties, and performance accountability for utility leaders.',
                'topic' => 'Governance',
                'venue' => 'Online + Finfinnee',
                'is_online' => true,
                'starts_at' => now()->addDays(55),
                'ends_at' => now()->addDays(56),
                'registration_deadline' => now()->addDays(45),
                'capacity' => 50,
                'facilitator' => 'OWUF Governance Desk',
            ],
        ];

        foreach ($courses as $course) {
            TrainingCourse::query()->updateOrCreate(
                ['slug' => $course['slug']],
                $course + ['status' => 'open', 'is_public' => true]
            );
        }
    }

    private function seedKnowledgeDocs(): void
    {
        $docs = [
            [
                'slug' => 'owuf-strategic-plan-2026-2030',
                'title' => 'OWUF Strategic Plan 2026-2030',
                'document_type' => 'Strategic Plan',
                'topic' => 'Strategy',
                'year' => 2026,
                'language' => 'en',
                'author' => 'OWUF',
                'summary' => 'Five-year strategic direction for federation capacity, member development, and advocacy.',
                'file_url' => '/publications/owuf-strategic-plan-2026-2030.pdf',
                'file_type' => 'PDF',
                'version' => '1.0',
            ],
            [
                'slug' => 'member-service-guidelines',
                'title' => 'Member Service Delivery Guidelines',
                'document_type' => 'Guideline',
                'topic' => 'Operations',
                'year' => 2025,
                'language' => 'en',
                'author' => 'OWUF Technical Team',
                'summary' => 'Standards and checklists for customer service, complaint handling, and operational reporting.',
                'file_url' => '/publications/member-service-guidelines.pdf',
                'file_type' => 'PDF',
                'version' => '1.1',
            ],
            [
                'slug' => 'owuf-annual-report-2025-knowledge',
                'title' => 'OWUF Annual Report 2025',
                'document_type' => 'Annual Report',
                'topic' => 'Accountability',
                'year' => 2025,
                'language' => 'en',
                'author' => 'OWUF Secretariat',
                'summary' => 'Annual accountability report covering programmes, membership, and institutional performance.',
                'file_url' => '/publications/owuf-annual-report-2025.pdf',
                'file_type' => 'PDF',
                'version' => '1.0',
            ],
        ];

        foreach ($docs as $doc) {
            KnowledgeDocument::query()->updateOrCreate(
                ['slug' => $doc['slug']],
                $doc + [
                    'access_level' => 'public',
                    'status' => 'published',
                    'is_public' => true,
                ]
            );
        }
    }

    private function seedProcurement(): void
    {
        $notices = [
            [
                'slug' => 'joint-water-meter-procurement-2026',
                'title' => 'Joint Water Meter Procurement 2026',
                'category' => 'Meters & fittings',
                'summary' => 'Framework opportunity for member utilities to participate in standardized water-meter procurement.',
                'reference_code' => 'OWUF-PROC-2026-01',
                'closing_at' => now()->addDays(60),
                'status' => 'open',
            ],
            [
                'slug' => 'billing-software-support-rfp-2026',
                'title' => 'Billing Software Support Services RFP 2026',
                'category' => 'ICT & systems',
                'summary' => 'Request for proposals to support billing system rollout and operator training for member utilities.',
                'reference_code' => 'OWUF-PROC-2026-02',
                'closing_at' => now()->addDays(45),
                'status' => 'open',
            ],
        ];

        foreach ($notices as $notice) {
            ProcurementNotice::query()->updateOrCreate(
                ['slug' => $notice['slug']],
                $notice + ['is_public' => true]
            );
        }
    }

    private function seedMembership(): void
    {
        MembershipApplication::query()->firstOrCreate(
            ['email' => 'new.utility@example.et', 'organization_name' => 'Sample Emerging Town Utility'],
            [
                'contact_name' => 'Halima Yusuf',
                'phone' => '+251911000000',
                'zone' => 'Arsi',
                'city' => 'Asella',
                'category' => 'full',
                'justification' => 'Seeking federation membership to access technical assistance and training programmes.',
                'status' => 'pending',
            ]
        );
    }

    private function seedConsultancy(): void
    {
        ConsultancyRequest::query()->firstOrCreate(
            ['email' => 'utility.manager@example.et', 'subject' => 'Institutional assessment support'],
            [
                'name' => 'Dereje Mekonnen',
                'organization' => 'Bishoftu Water Utility',
                'category' => 'management',
                'description' => 'Request for institutional assessment and performance improvement roadmap.',
                'status' => 'new',
            ]
        );
    }

    private function seedLocaleContent(): void
    {
        $rows = [
            ['vision', 'en', 'Vision', 'To see water utilities become fully capacitated, self-sustaining, financially viable, and capable of providing reliable water and sanitation services.'],
            ['vision', 'om', 'Mul\'ata', 'Dhaabbilee bishaanii cimoo, of danda\'oo, fi tajaajila bishaanii amanamaa kennaa ta\'uu.'],
            ['vision', 'am', 'Ra\'iy', 'Ye wuha teqamatotch aqim yalachew ina amanama agelgilot endisetu.'],
            ['mission', 'en', 'Mission', 'To empower water utilities through capacity building, partnerships, innovation, advocacy, and knowledge exchange.'],
            ['mission', 'om', 'Kaayyoo', 'Dhaabbilee bishaanii leenjii, michummaa, haaromsa, fi beekumsa qooduun cimsuu.'],
            ['mission', 'am', 'Tel\'eko', 'Ye wuha teqamatotchn be aqim ginbata ina agarnnet matsnaqer.'],
            ['about_intro', 'en', 'About OWUF', 'The Oromia Water Utilities Federation (OWUF) is the collective platform for town Water Service Providers across Oromia, strengthening capacity, partnerships, and advocacy for reliable water and sanitation services.'],
            ['about_intro', 'om', 'Waa\'ee OWUF', 'Waldaan Dhaabbilee Tajaajila Bishaanii Oromiyaa (OWUF) dhaabbilee tajaajila bishaanii magaalaa Oromiyaa keessatti walitti qaba; dandeettii, michummaa, fi afgaaffii cimsa.'],
            ['about_intro', 'am', 'Sil\'e OWUF', 'Ye Oromiya Wuha Teqamatotch Federation (OWUF) be Oromiya ketel yale ye ketema wuha agelgilot sechotch yemimelekket yegubu maderaja new; aqim, agarnnet ina afegagoch yetsensanal.'],
            ['home_show_partners', 'en', 'Home: show partners', '1'],
            ['home_show_gallery', 'en', 'Home: show gallery', '1'],
            ['home_show_map', 'en', 'Home: show coverage map', '1'],
        ];

        foreach ($rows as [$key, $locale, $title, $body]) {
            LocaleContent::query()->updateOrCreate(
                compact('key', 'locale'),
                compact('title', 'body') + ['is_approved' => true]
            );
        }
    }

    private function seedInboxSamples(): void
    {
        ContactMessage::query()->firstOrCreate(
            ['email' => 'resident@example.et', 'subject' => 'Inquiry about membership benefits'],
            [
                'name' => 'Sara Hailu',
                'message' => 'Please share membership benefits for mid-sized town utilities.',
                'status' => 'new',
            ]
        );

        AccessRequest::query()->firstOrCreate(
            ['email' => 'new.staff@owuf.gov.et'],
            [
                'full_name' => 'Tadesse Bekele',
                'organization' => 'OWUF',
                'role_requested' => 'content_editor',
                'justification' => 'Needs CMS access to publish regional updates.',
                'status' => 'pending',
            ]
        );

        PartnershipInquiry::query()->firstOrCreate(
            ['email' => 'partner@example.org', 'organization' => 'Regional Development Partner'],
            [
                'contact_name' => 'Jane Cooper',
                'partnership_interest' => 'Capacity building co-funding',
                'message' => 'Interested in co-funding NRW training programmes.',
                'status' => 'new',
            ]
        );

        NewsletterSubscriber::query()->firstOrCreate(
            ['email' => 'updates@example.et'],
            ['is_active' => true]
        );

        $event = Event::query()->where('slug', 'member-digitization-clinic')->first();
        if ($event) {
            EventRegistration::query()->firstOrCreate(
                ['event_id' => $event->id, 'email' => 'trainee@example.et'],
                [
                    'name' => 'Mulu Getachew',
                    'organization' => 'Jimma Town Water Supply',
                    'phone' => '+251911111111',
                    'status' => 'registered',
                ]
            );
        }

        $course = TrainingCourse::query()->where('slug', 'nrw-reduction-fundamentals')->first();
        if ($course) {
            TrainingRegistration::query()->firstOrCreate(
                ['course_id' => $course->id, 'email' => 'operator@example.et'],
                [
                    'name' => 'Kedir Ahmed',
                    'organization' => 'Nekemte Water Supply',
                    'phone' => '+251922222222',
                    'status' => 'registered',
                ]
            );
        }

        $notice = ProcurementNotice::query()->where('slug', 'joint-water-meter-procurement-2026')->first();
        if ($notice) {
            ProcurementInterest::query()->firstOrCreate(
                ['notice_id' => $notice->id, 'email' => 'supplier@example.com'],
                [
                    'organization' => 'Ethio Meter Supplies PLC',
                    'contact_name' => 'Yonas Lemma',
                    'phone' => '+251933333333',
                    'message' => 'Interested in supplying Class C meters under the framework.',
                    'status' => 'submitted',
                ]
            );
        }
    }

    private function seedOps(): void
    {
        $kraDefs = [
            [
                'code' => 'KRA-1',
                'title' => 'Federation Capacity Development',
                'objective' => 'Enhance Federation capacity for effective service delivery to members.',
                'sort_order' => 1,
                'indicator_code' => 'KRA1-I1',
                'indicator_title' => 'Staff trained',
                'unit' => 'Number',
                'baseline' => 20,
                'annual_target' => 80,
                'actual' => 18,
            ],
            [
                'code' => 'KRA-2',
                'title' => 'Members Engagement & Development',
                'objective' => 'Expand membership participation, benchmarking, and capacity building for utilities.',
                'sort_order' => 2,
                'indicator_code' => 'KRA2-I1',
                'indicator_title' => 'Utilities submitting KPI reports',
                'unit' => 'Number',
                'baseline' => 40,
                'annual_target' => 120,
                'actual' => 52,
            ],
            [
                'code' => 'KRA-3',
                'title' => 'Communication & Advocacy',
                'objective' => 'Improve corporate visibility and policy advocacy for member utilities.',
                'sort_order' => 3,
                'indicator_code' => 'KRA3-I1',
                'indicator_title' => 'Advocacy engagements completed',
                'unit' => 'Number',
                'baseline' => 5,
                'annual_target' => 18,
                'actual' => 4,
            ],
        ];

        foreach ($kraDefs as $def) {
            $kra = StrategicKra::query()->updateOrCreate(
                ['code' => $def['code']],
                [
                    'title' => $def['title'],
                    'objective' => $def['objective'],
                    'sort_order' => $def['sort_order'],
                    'is_active' => true,
                ]
            );

            $indicator = Indicator::query()->updateOrCreate(
                ['kra_id' => $kra->id, 'code' => $def['indicator_code']],
                [
                    'title' => $def['indicator_title'],
                    'unit' => $def['unit'],
                    'baseline' => $def['baseline'],
                    'annual_target' => $def['annual_target'],
                    'frequency' => 'quarterly',
                    'responsible_officer' => 'OWUF Coordination',
                    'is_active' => true,
                ]
            );

            IndicatorResult::query()->firstOrCreate(
                ['indicator_id' => $indicator->id, 'period_label' => '2026-Q1'],
                [
                    'period_start' => '2026-01-01',
                    'period_end' => '2026-03-31',
                    'actual_value' => $def['actual'],
                    'variance_notes' => 'On track against quarterly milestone.',
                    'status' => 'submitted',
                ]
            );
        }

        $risks = [
            [
                'title' => 'Delayed member contribution collections',
                'category' => 'financial',
                'description' => 'Late dues may constrain programme delivery and cash flow.',
                'probability' => 3,
                'impact' => 4,
                'mitigation' => 'Issue invoices early; send renewal reminders; offer payment plans.',
                'residual_risk' => 'Moderate residual cash-flow exposure',
                'owner' => 'Finance Officer',
                'due_date' => '2026-09-30',
                'review_status' => 'monitoring',
            ],
            [
                'title' => 'Low digitization uptake among smaller utilities',
                'category' => 'operational',
                'description' => 'Limited ICT capacity may slow billing and KPI reporting upgrades.',
                'probability' => 3,
                'impact' => 3,
                'mitigation' => 'Provide clinics, peer mentoring, and phased rollout support.',
                'residual_risk' => 'Some towns will remain on paper-based workflows short-term',
                'owner' => 'Project Officer',
                'due_date' => '2026-12-15',
                'review_status' => 'open',
            ],
            [
                'title' => 'Partner funding uncertainty',
                'category' => 'strategic',
                'description' => 'Delayed co-funding decisions may affect training and advocacy schedules.',
                'probability' => 2,
                'impact' => 4,
                'mitigation' => 'Diversify partners; maintain contingency activity plans.',
                'residual_risk' => 'Selected programmes may shift into the next quarter',
                'owner' => 'Management',
                'due_date' => '2026-10-31',
                'review_status' => 'monitoring',
            ],
        ];

        foreach ($risks as $risk) {
            Risk::query()->updateOrCreate(
                ['title' => $risk['title']],
                $risk
            );
        }

        $kpiSamples = [
            [
                'slug' => 'adama-water-supply-sewerage-service-enterprise',
                'period_label' => '2026-Q1',
                'water_production_m3' => 1200000,
                'nrw_percent' => 32,
                'meter_coverage_percent' => 65,
                'billing_efficiency_percent' => 78,
                'collection_efficiency_percent' => 72,
                'service_coverage_percent' => 85,
                'water_quality_compliance_percent' => 92,
                'customer_complaints' => 40,
                'status' => 'approved',
                'notes' => 'Seeded benchmarking sample.',
            ],
            [
                'slug' => 'jimma-town-water-supply-sewerage-service',
                'period_label' => '2026-Q1',
                'water_production_m3' => 780000,
                'nrw_percent' => 36,
                'meter_coverage_percent' => 58,
                'billing_efficiency_percent' => 71,
                'collection_efficiency_percent' => 68,
                'service_coverage_percent' => 80,
                'water_quality_compliance_percent' => 89,
                'customer_complaints' => 55,
                'status' => 'submitted',
                'notes' => 'Jimma cluster benchmarking sample.',
            ],
            [
                'slug' => 'nekemte-water-supply-sewerage-service',
                'period_label' => '2026-Q1',
                'water_production_m3' => 540000,
                'nrw_percent' => 34,
                'meter_coverage_percent' => 61,
                'billing_efficiency_percent' => 74,
                'collection_efficiency_percent' => 70,
                'service_coverage_percent' => 82,
                'water_quality_compliance_percent' => 90,
                'customer_complaints' => 33,
                'status' => 'draft',
                'notes' => 'East Wollega benchmarking sample.',
            ],
        ];

        foreach ($kpiSamples as $sample) {
            $utility = Utility::query()->where('slug', $sample['slug'])->first();
            if ($utility === null) {
                continue;
            }

            UtilityKpi::query()->updateOrCreate(
                ['utility_id' => $utility->id, 'period_label' => $sample['period_label']],
                [
                    'period_start' => '2026-01-01',
                    'period_end' => '2026-03-31',
                    'water_production_m3' => $sample['water_production_m3'],
                    'nrw_percent' => $sample['nrw_percent'],
                    'meter_coverage_percent' => $sample['meter_coverage_percent'],
                    'billing_efficiency_percent' => $sample['billing_efficiency_percent'],
                    'collection_efficiency_percent' => $sample['collection_efficiency_percent'],
                    'service_coverage_percent' => $sample['service_coverage_percent'],
                    'water_quality_compliance_percent' => $sample['water_quality_compliance_percent'],
                    'customer_complaints' => $sample['customer_complaints'],
                    'status' => $sample['status'],
                    'notes' => $sample['notes'],
                ]
            );
        }

        Notification::query()->firstOrCreate(
            ['title' => 'Welcome to the OWUF operations portal', 'user_id' => null],
            [
                'body' => 'Use M&E, Risk, Benchmarking, and Finance modules to track federation performance.',
                'level' => 'info',
                'link' => '/app/dashboard',
                'is_read' => false,
            ]
        );

        Notification::query()->firstOrCreate(
            ['title' => 'Q1 KPI review window open', 'user_id' => null],
            [
                'body' => 'Member utilities can submit 2026-Q1 KPI packages through the benchmarking module.',
                'level' => 'info',
                'link' => '/app/benchmarking',
                'is_read' => false,
            ]
        );

        $admin = User::query()->where('username', 'admin')->first();
        if ($admin !== null) {
            Notification::query()->firstOrCreate(
                ['title' => 'Admin: review overdue contributions', 'user_id' => $admin->id],
                [
                    'body' => 'Two membership invoices need finance follow-up before the mid-year review.',
                    'level' => 'warning',
                    'link' => '/app/finance',
                    'is_read' => false,
                ]
            );
        }
    }

    private function seedContributions(): void
    {
        $adama = Utility::query()->where('slug', 'adama-water-supply-sewerage-service-enterprise')->first()
            ?? Utility::query()->first();
        $jimma = Utility::query()->where('slug', 'jimma-town-water-supply-sewerage-service')->first()
            ?? Utility::query()->skip(1)->first();
        $nekemte = Utility::query()->where('slug', 'nekemte-water-supply-sewerage-service')->first()
            ?? Utility::query()->skip(2)->first();

        Contribution::query()->updateOrCreate(
            ['invoice_number' => 'OWUF-INV-2026-001'],
            [
                'utility_id' => $adama?->id,
                'organization_name' => $adama?->name ?? 'Sample Utility',
                'period_label' => 'FY2026',
                'amount' => 150000,
                'amount_paid' => 50000,
                'currency' => 'ETB',
                'issued_at' => '2026-01-15',
                'due_at' => '2026-03-31',
                'status' => 'partial',
                'notes' => 'Annual membership contribution - partial payment recorded.',
            ]
        );

        Contribution::query()->updateOrCreate(
            ['invoice_number' => 'OWUF-INV-2026-OVERDUE'],
            [
                'utility_id' => $jimma?->id,
                'organization_name' => $jimma?->name ?? 'Jimma Town Water Supply & Sewerage Service',
                'period_label' => 'FY2025',
                'amount' => 120000,
                'amount_paid' => 0,
                'currency' => 'ETB',
                'issued_at' => '2025-07-01',
                'due_at' => '2025-09-30',
                'status' => 'overdue',
                'notes' => 'Seeded overdue contribution for finance demos.',
            ]
        );

        Contribution::query()->updateOrCreate(
            ['invoice_number' => 'OWUF-INV-2026-002'],
            [
                'utility_id' => $nekemte?->id,
                'organization_name' => $nekemte?->name ?? 'Nekemte Water Supply & Sewerage Service',
                'period_label' => 'FY2026',
                'amount' => 110000,
                'amount_paid' => 110000,
                'currency' => 'ETB',
                'issued_at' => '2026-01-20',
                'due_at' => '2026-03-31',
                'status' => 'paid',
                'notes' => 'Fully paid annual membership contribution.',
            ]
        );
    }
}

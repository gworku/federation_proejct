<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\JwtTokens;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CmsPublishGateTest extends TestCase
{
    use RefreshDatabase;

    public function test_content_editor_cannot_publish_news_directly(): void
    {
        $editor = User::factory()->contentEditor()->create();
        $tokens = JwtTokens::pairFor($editor);

        $response = $this->withHeader('Authorization', 'Bearer '.$tokens['access'])
            ->postJson('/api/cms/news', [
                'title' => 'Editor draft',
                'slug' => 'editor-draft',
                'category' => 'News',
                'excerpt' => 'Excerpt text for the article.',
                'body' => 'Body text',
                'status' => 'published',
            ]);

        $response->assertSuccessful();
        $this->assertSame('pending_review', $response->json('status'));
    }

    public function test_utility_user_cannot_write_cms(): void
    {
        $user = User::factory()->create();
        $tokens = JwtTokens::pairFor($user);

        $this->withHeader('Authorization', 'Bearer '.$tokens['access'])
            ->postJson('/api/cms/news', [
                'title' => 'Denied',
                'slug' => 'denied',
                'category' => 'News',
                'excerpt' => 'Excerpt text for the article.',
            ])
            ->assertForbidden();
    }
}

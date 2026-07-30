<?php

namespace App\Support;

use App\Models\AuditEvent;
use App\Models\User;

class Audit
{
    public static function record(
        ?User $actor,
        string $action,
        ?string $ip,
        array $metadata = [],
        ?string $entityType = null,
        int|string|null $entityId = null,
    ): AuditEvent {
        if ($entityType === null && isset($metadata['entity_type'])) {
            $entityType = (string) $metadata['entity_type'];
        }
        if ($entityId === null && isset($metadata['entity_id'])) {
            $entityId = $metadata['entity_id'];
        }
        if ($entityId === null && isset($metadata['id'])) {
            $entityId = $metadata['id'];
        }

        return AuditEvent::create([
            'actor_id' => $actor?->id,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId !== null ? (int) $entityId : null,
            'ip_address' => $ip,
            'metadata' => $metadata,
        ]);
    }
}

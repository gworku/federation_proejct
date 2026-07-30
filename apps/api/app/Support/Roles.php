<?php

namespace App\Support;

use App\Models\User;

class Roles
{
    public const ADMINISTRATOR = 'administrator';

    public const MANAGEMENT = 'management';

    public const CONTENT_EDITOR = 'content_editor';

    public const PROJECT_OFFICER = 'project_officer';

    public const FINANCE_OFFICER = 'finance_officer';

    public const PROCUREMENT_OFFICER = 'procurement_officer';

    public const UTILITY_USER = 'utility_user';

    public const AUDITOR = 'auditor';

    public static function roleOk(?User $user, array $allowedRoles): bool
    {
        if ($user === null) {
            return false;
        }

        if ($user->is_superuser) {
            return true;
        }

        return in_array($user->role, $allowedRoles, true);
    }

    public static function isAdministrator(?User $user): bool
    {
        return $user !== null
            && ($user->is_superuser || $user->role === self::ADMINISTRATOR);
    }

    public static function isContentEditorOrAdmin(?User $user, string $method = 'GET'): bool
    {
        if (self::isSafeMethod($method)) {
            return true;
        }

        return self::roleOk($user, [
            self::ADMINISTRATOR,
            self::CONTENT_EDITOR,
            self::MANAGEMENT,
        ]);
    }

    public static function isAdminOrManagement(?User $user): bool
    {
        return self::roleOk($user, [self::ADMINISTRATOR, self::MANAGEMENT]);
    }

    public static function isContentInboxStaff(?User $user): bool
    {
        return self::roleOk($user, [
            self::ADMINISTRATOR,
            self::MANAGEMENT,
            self::CONTENT_EDITOR,
        ]);
    }

    public static function isMembershipStaff(?User $user): bool
    {
        return self::roleOk($user, [
            self::ADMINISTRATOR,
            self::MANAGEMENT,
            self::FINANCE_OFFICER,
        ]);
    }

    public static function isServiceRequestStaff(?User $user): bool
    {
        return self::roleOk($user, [
            self::ADMINISTRATOR,
            self::MANAGEMENT,
            self::PROJECT_OFFICER,
        ]);
    }

    public static function isTrainingStaff(?User $user): bool
    {
        return self::roleOk($user, [
            self::ADMINISTRATOR,
            self::MANAGEMENT,
            self::PROJECT_OFFICER,
            self::CONTENT_EDITOR,
        ]);
    }

    public static function isProcurementStaff(?User $user): bool
    {
        return self::roleOk($user, [
            self::ADMINISTRATOR,
            self::MANAGEMENT,
            self::PROCUREMENT_OFFICER,
        ]);
    }

    public static function isProcurementNoticeStaff(?User $user, string $method = 'GET'): bool
    {
        if (self::isSafeMethod($method)) {
            return true;
        }

        return self::roleOk($user, [
            self::ADMINISTRATOR,
            self::MANAGEMENT,
            self::PROCUREMENT_OFFICER,
            self::CONTENT_EDITOR,
        ]);
    }

    public static function isProjectStaff(?User $user, string $method = 'GET'): bool
    {
        if (self::isSafeMethod($method)) {
            return true;
        }

        return self::roleOk($user, [
            self::ADMINISTRATOR,
            self::MANAGEMENT,
            self::PROJECT_OFFICER,
            self::CONTENT_EDITOR,
        ]);
    }

    public static function isAuditorOrAdmin(?User $user): bool
    {
        return self::roleOk($user, [
            self::ADMINISTRATOR,
            self::AUDITOR,
            self::MANAGEMENT,
        ]);
    }

    public static function isFinanceStaff(?User $user): bool
    {
        return self::roleOk($user, [
            self::ADMINISTRATOR,
            self::MANAGEMENT,
            self::FINANCE_OFFICER,
        ]);
    }

    private static function isSafeMethod(string $method): bool
    {
        return in_array(strtoupper($method), ['GET', 'HEAD', 'OPTIONS'], true);
    }
}

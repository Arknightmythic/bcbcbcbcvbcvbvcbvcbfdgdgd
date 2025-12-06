// src/features/RoleManagements/utils/roleHelpers.ts
export const shouldShowPermission = (name: string) => name.endsWith(':read');
export const formatPermissionLabel = (name: string) => name.replace(':read', ':access');
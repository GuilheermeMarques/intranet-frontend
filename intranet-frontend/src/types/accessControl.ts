export interface MenuPermissionItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  permissionKey: string;
  children?: MenuPermissionItem[];
}

export interface AdministrativePermissionDefinition {
  key: string;
  label: string;
  description: string;
}

export interface AccessControlUser {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  avatar: string;
  permissions: string[];
}

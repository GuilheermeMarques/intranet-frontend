'use client';

import accessControlData from '@/mocks/access-control.json';
import {
  MANAGE_PERMISSIONS_KEY,
  administrativePermissionDefinitions,
  allPermissionKeys,
  applyPermissionToggle,
  filterMenuItemsByPermissions,
  hasPermission,
  permissionMenuItems,
} from '@/shared/utils/accessControl';
import type {
  AccessControlUser,
  AdministrativePermissionDefinition,
  MenuPermissionItem,
} from '@/types/accessControl';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const USERS_STORAGE_KEY = 'intranet-access-control-users';
const SESSION_USER_STORAGE_KEY = 'intranet-access-control-session-user';
const MANAGED_USER_STORAGE_KEY = 'intranet-access-control-managed-user';

interface AccessControlContextValue {
  administrativePermissions: AdministrativePermissionDefinition[];
  allPermissionKeys: string[];
  canManagePermissions: boolean;
  currentUser: AccessControlUser | null;
  isReady: boolean;
  managedUser: AccessControlUser | null;
  managedUserId: string | null;
  menuItems: MenuPermissionItem[];
  sessionUserId: string | null;
  users: AccessControlUser[];
  visibleMenuItems: MenuPermissionItem[];
  getVisibleMenuItemsForUser: (permissions: string[]) => MenuPermissionItem[];
  hasPermission: (permissionKey: string, permissions?: string[]) => boolean;
  resetMockData: () => void;
  selectManagedUser: (userId: string) => void;
  togglePermission: (userId: string, permissionKey: string, enabled: boolean) => void;
}

const AccessControlContext = createContext<AccessControlContextValue | undefined>(undefined);

const cloneMockUsers = () =>
  (accessControlData.users as AccessControlUser[]).map((user) => ({
    ...user,
    permissions: [...user.permissions],
  }));

export function AccessControlProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<AccessControlUser[]>(() => cloneMockUsers());
  const [sessionUserId, setSessionUserId] = useState<string | null>(
    () => cloneMockUsers()[0]?.id ?? null,
  );
  const [managedUserId, setManagedUserId] = useState<string | null>(
    () => cloneMockUsers()[0]?.id ?? null,
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    const storedSessionUserId = localStorage.getItem(SESSION_USER_STORAGE_KEY);
    const storedManagedUserId = localStorage.getItem(MANAGED_USER_STORAGE_KEY);

    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers) as AccessControlUser[]);
      } catch {
        setUsers(cloneMockUsers());
      }
    }

    if (storedSessionUserId) {
      setSessionUserId(storedSessionUserId);
    }

    if (storedManagedUserId) {
      setManagedUserId(storedManagedUserId);
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    if (sessionUserId) {
      localStorage.setItem(SESSION_USER_STORAGE_KEY, sessionUserId);
    }

    if (managedUserId) {
      localStorage.setItem(MANAGED_USER_STORAGE_KEY, managedUserId);
    }
  }, [isReady, managedUserId, sessionUserId, users]);

  const currentUser = useMemo(
    () => users.find((user) => user.id === sessionUserId) ?? users[0] ?? null,
    [sessionUserId, users],
  );

  const managedUser = useMemo(
    () => users.find((user) => user.id === managedUserId) ?? currentUser ?? users[0] ?? null,
    [currentUser, managedUserId, users],
  );

  const getVisibleMenuItemsForUser = (permissions: string[]) =>
    filterMenuItemsByPermissions(permissionMenuItems, permissions);

  const visibleMenuItems = useMemo(
    () => getVisibleMenuItemsForUser(currentUser?.permissions ?? []),
    [currentUser],
  );

  const canManagePermissions = hasPermission(
    currentUser?.permissions ?? [],
    MANAGE_PERMISSIONS_KEY,
  );

  const selectManagedUser = (userId: string) => {
    setManagedUserId(userId);
  };

  const togglePermission = (userId: string, permissionKey: string, enabled: boolean) => {
    if (!canManagePermissions) {
      return;
    }

    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              permissions:
                user.id === currentUser?.id &&
                permissionKey === MANAGE_PERMISSIONS_KEY &&
                enabled === false
                  ? user.permissions
                  : applyPermissionToggle(user.permissions, permissionKey, enabled),
            }
          : user,
      ),
    );
  };

  const resetMockData = () => {
    const resetUsers = cloneMockUsers();
    setUsers(resetUsers);
    setSessionUserId(resetUsers[0]?.id ?? null);
    setManagedUserId(resetUsers[0]?.id ?? null);
  };

  return (
    <AccessControlContext.Provider
      value={{
        administrativePermissions: administrativePermissionDefinitions,
        allPermissionKeys,
        canManagePermissions,
        currentUser,
        isReady,
        managedUser,
        managedUserId,
        menuItems: permissionMenuItems,
        sessionUserId,
        users,
        visibleMenuItems,
        getVisibleMenuItemsForUser,
        hasPermission: (permissionKey, permissions) =>
          hasPermission(permissions ?? currentUser?.permissions ?? [], permissionKey),
        resetMockData,
        selectManagedUser,
        togglePermission,
      }}
    >
      {children}
    </AccessControlContext.Provider>
  );
}

export function useAccessControl() {
  const context = useContext(AccessControlContext);

  if (!context) {
    throw new Error('useAccessControl must be used within AccessControlProvider');
  }

  return context;
}

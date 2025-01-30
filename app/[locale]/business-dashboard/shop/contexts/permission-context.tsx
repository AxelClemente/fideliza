'use client'

import { createContext, useContext, ReactNode } from 'react'
import type { Permission, Role, ModelType } from '@prisma/client'

interface PermissionContextType {
  permissions: Permission[]
  role: Role | null
  canAccess: (modelType: ModelType) => {
    canView: boolean
    canEdit: boolean
  }
}

interface PermissionProviderProps {
  children: ReactNode
  permissions: Permission[]
  role: Role | null
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined)

export function PermissionProvider({ children, permissions = [], role }: PermissionProviderProps) {
  const canAccess = (modelType: ModelType) => {
    console.log('Checking access for:', {
      modelType,
      role,
      permissions
    })

    // ADMIN y BUSINESS tienen acceso total
    if (role === 'ADMIN' || role === 'BUSINESS') {
      return {
        canView: true,
        canEdit: true
      }
    }

    // Para STAFF, verificamos los permisos específicos
    if (role === 'STAFF') {
      const staffPermissions = Array.isArray(permissions) ? permissions : []
      
      // Verificar si tiene el permiso específico para el modelType
      const hasPermission = staffPermissions.some(p => {
        console.log('Checking permission:', {
          currentModelType: p.modelType,
          requestedModelType: modelType,
          permission: p.permission,
          matches: p.modelType === modelType && p.permission === 'ADD_EDIT_DELETE'
        })
        return p.modelType === modelType && p.permission === 'ADD_EDIT_DELETE'
      })
      
      console.log('Staff permissions check:', {
        modelType,
        permissionsCount: staffPermissions.length,
        hasPermission,
        permissions: staffPermissions.map(p => ({
          modelType: p.modelType,
          permission: p.permission
        }))
      })

      return {
        canView: staffPermissions.some(p => 
          p.modelType === modelType && 
          (p.permission === 'VIEW_ONLY' || p.permission === 'ADD_EDIT_DELETE')
        ),
        canEdit: hasPermission
      }
    }

    return {
      canView: false,
      canEdit: false
    }
  }

  return (
    <PermissionContext.Provider value={{ permissions, role, canAccess }}>
      {children}
    </PermissionContext.Provider>
  )
}

export function usePermissions() {
  const context = useContext(PermissionContext)
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider')
  }
  return context
}
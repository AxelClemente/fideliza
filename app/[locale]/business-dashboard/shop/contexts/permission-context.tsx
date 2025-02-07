'use client'

import { createContext, useContext, ReactNode } from 'react'
import type { Permission, Role, ModelType } from '@prisma/client'

// Definimos un tipo que incluya todos los valores posibles de PermissionType
type AllowedPermissions = 'VIEW_ONLY' | 'ADD_EDIT' | 'ADD_EDIT_DELETE'

// Verificamos que el permiso es uno de los valores permitidos
const isValidPermission = (permission: string): permission is AllowedPermissions => {
  return ['VIEW_ONLY', 'ADD_EDIT', 'ADD_EDIT_DELETE'].includes(permission)
}

interface PermissionContextType {
  permissions: Permission[]
  role: Role | null
  canAccess: (modelType: ModelType) => {
    canView: boolean
    canEdit: boolean
    canDelete: boolean
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
        canEdit: true,
        canDelete: true
      }
    }

    // Para STAFF, verificamos los permisos específicos
    if (role === 'STAFF') {
      const staffPermissions = Array.isArray(permissions) ? permissions : []
      
      // Verificar si tiene el permiso específico para el modelType
      const hasEditPermission = staffPermissions.some(p => {
        if (!isValidPermission(p.permission)) return false
        return p.modelType === modelType && 
          ['ADD_EDIT_DELETE', 'ADD_EDIT'].includes(p.permission)
      })
      
      const hasDeletePermission = staffPermissions.some(p => 
        p.modelType === modelType && 
        p.permission === 'ADD_EDIT_DELETE'
      )
      
      console.log('Staff permissions check:', {
        modelType,
        permissionsCount: staffPermissions.length,
        hasEditPermission,
        hasDeletePermission,
        permissions: staffPermissions.map(p => ({
          modelType: p.modelType,
          permission: p.permission
        }))
      })

      return {
        canView: staffPermissions.some(p => 
          p.modelType === modelType && 
          (p.permission === 'VIEW_ONLY' || p.permission === 'ADD_EDIT_DELETE' || p.permission === 'ADD_EDIT')
        ),
        canEdit: hasEditPermission,
        canDelete: hasDeletePermission
      }
    }

    return {
      canView: false,
      canEdit: false,
      canDelete: false
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
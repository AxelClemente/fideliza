import { UsersContainer } from "./components/users-container"
import { BusinessUserProvider } from "./components/user-provider"
import { Toaster } from "sonner"
import type { BusinessUser } from "./types/types"

export default async function BusinessUsersPage() {
  const { businessUser, staff } = await BusinessUserProvider()

  if (!businessUser?.id) {
    throw new Error('No business owner found')
  }

  const typedBusinessUser = businessUser as BusinessUser
  const adminUsers = staff?.filter(user => user.role === 'ADMIN') || []
  const staffUsers = staff?.filter(user => user.role === 'STAFF') || []

  return (
    <div className="w-full px-0 sm:px-4 md:px-8 lg:px-6 max-w-full overflow-x-hidden">
      <UsersContainer
        businessUser={typedBusinessUser}
        adminUsers={adminUsers}
        staffUsers={staffUsers}
      />
      <Toaster />
    </div>
  )
}
import { Toaster } from "sonner"
import { UsersContainer } from "./components/users-container"
import { BusinessUserProvider } from "./components/user-provider"
import type { BusinessUser, User, UserWithRestaurants } from "./types/types"
import { updateSubscriptionStatus } from "../utils/update-subscriptions"

export default async function BusinessUsersPage() {
  await updateSubscriptionStatus()

  const { businessUser, staff } = await BusinessUserProvider()

  if (!businessUser?.id) {
    throw new Error('No business owner found')
  }

  const mapStaffToUser = (staffMember: UserWithRestaurants): User => ({
    id: staffMember.id,
    name: staffMember.name,
    email: staffMember.email,
    image: staffMember.image || '/images/placeholder.png',
    role: staffMember.role as 'ADMIN' | 'STAFF',
    permissions: staffMember.permissions
  })

  const adminUsers = staff
    ?.filter(user => user.role === 'ADMIN')
    .map(mapStaffToUser) || []

  const staffUsers = staff
    ?.filter(user => user.role === 'STAFF')
    .map(mapStaffToUser) || []

  return (
    <div className="w-full px-0 sm:px-4 md:px-8 lg:px-6 max-w-full overflow-x-hidden">
      <UsersContainer
        businessUser={businessUser as BusinessUser}
        adminUsers={adminUsers}
        staffUsers={staffUsers}
      />
      <Toaster />
    </div>
  )
}
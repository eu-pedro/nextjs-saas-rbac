import { AbilityBuilder } from '@casl/ability';
import { type User } from './models/user';
import type { AppAbility } from '.';
import type { Role } from './roles';


type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>
) => void

export const permissions: Record<Role, PermissionsByRole> = {
  ADMIN: (_, { can }) => {
    can("manage", "all");
  },
  MEMBER: (user, { can }) => {
    // can("invite", "User"),
    can("create", "Project");
    can("get", "Project", { ownerId: { $eq: user.id } })
  },
  BILLING: function (user: User, builder): void {
    throw new Error('Function not implemented.');
  }
}
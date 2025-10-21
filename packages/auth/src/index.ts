import { createMongoAbility, type CreateAbility, type MongoAbility, AbilityBuilder } from '@casl/ability';
import type { User } from './models/user';
import { permissions } from './permissions';
import { userSubject } from './subjects/user';
import { projectSubject } from './subjects/project';
import { z } from 'zod';
import { organizationSubject } from './subjects/organization';
import { inviteSubject } from './subjects/invite';
import { billingSubject } from './subjects/billing';

const appAbilitieSchema = z.union([
  projectSubject,
  userSubject,
  organizationSubject,
  inviteSubject,
  billingSubject,

  z.tuple([
    z.literal("manage"),
    z.literal("all")
  ])
])

export type AppAbilities = z.infer<typeof appAbilitieSchema>

export type AppAbility = MongoAbility<AppAbilities>;
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

export function defineAbilityFor(user: User) {

  const builder = new AbilityBuilder(createAppAbility)

  if (typeof permissions[user.role] !== 'function') {
    throw new Error(`Permission for role ${user.role} not found.`)
  }

  permissions[user.role](user, builder)

  const ability = builder.build({
    detectSubjectType(subject) {
      return subject.__typename
    }
  })

  ability.can = ability.can.bind(ability)
  ability.cannot = ability.cannot.bind(ability)

  return ability
}
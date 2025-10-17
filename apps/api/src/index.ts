import { defineAbilityFor } from "@saas/auth"

const ability = defineAbilityFor({
  role: "MEMBER",
  id: "user-id"
})

console.log(ability.can("get", "Billing"))
console.log(ability.can("create", "Invite"))

// const userCanInviteSomeoneElse = ability.can('invite', 'User')

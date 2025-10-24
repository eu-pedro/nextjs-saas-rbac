import { auth } from "@/http/middlewares/auth";
import { prisma } from "@/lib/prisma";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { getUserPermissions } from "@/utils/get-user-permissions";
import { UnauthorizedError } from "../_erros/unauthorized-error";
import { roleSchema } from "@saas/auth/src/roles";
import { BadRequestError } from "../_erros/bad-request-error";

export async function getInvites(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post("/organizations/:slug/projects", {
      schema: {
        tags: ["Invites"],
        summary: "Get all organization invites",

        security: [{ bearerAuth: [] }],
        params: z.object({
          slug: z.string(),
        }),
        response: {
          200: z.object({
            invites: z.array(
              z.object({
                id: z.uuid(),
                role: roleSchema,
                email: z.email(),
                createdAt: z.date(),
                author: z
                  .object({
                    id: z.uuid(),
                    name: z.string().nullable(),
                  })
                  .nullable(),
              }),
            )
          })
        }
      }
    }, async (request) => {

      const { slug } = request.params
      const userId = await request.getCurrentUserId()

      const { membership, organization } = await request.getUserMembership(slug)

      const { cannot } = getUserPermissions(userId, membership.role)

      if (cannot("get", "Invite")) {
        throw new UnauthorizedError(`You're not allowed to get organization invite.`)
      }

      const invites = await prisma.invite.findMany({
        where: {
          organizationId: organization.id
        },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      })

      return { invites }

    })
}
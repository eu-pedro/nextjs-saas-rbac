import { auth } from "@/http/middlewares/auth";
import { prisma } from "@/lib/prisma";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { BadRequestError } from "../_erros/bad-request-error";
import { organizationSchema } from "@saas/auth/src/models/organization";
import { UnauthorizedError } from "../_erros/unauthorized-error";
import { getUserPermissions } from "@/utils/get-user-permissions";

export async function transferOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch("/organizations/:slug/owner", {
      schema: {
        tags: ["Organizations"],
        summary: "Transfer organization ownership",
        security: [{ bearerAuth: [] }],
        body: z.object({
          transferToUserId: z.uuid(),
        }),
        params: z.object({
          slug: z.string()
        }),
        response: {
          204: z.null()
        }
      }
    }, async (request, reply) => {

      const { slug } = request.params

      const userId = await request.getCurrentUserId()

      const { membership, organization } = await request.getUserMembership(slug)



      const { cannot } = getUserPermissions(userId, membership.role)

      const authOrganization = organizationSchema.parse({
        id: organization.id,
        ownerId: organization.ownerId
      })

      if (cannot('transfer_ownership', authOrganization)) {
        throw new UnauthorizedError("You're not allowed to transfer this organization ownership.")
      }

      const { transferToUserId } = request.body

      const transferToMemberShip = await prisma.member.findUnique({
        where: {
          organizationId_userId: {
            organizationId: organization.id,
            userId: transferToUserId
          }
        }
      })

      if (!transferToMemberShip) {
        throw new BadRequestError("Target user is not a member of this organization.")
      }

      await prisma.$transaction([
        prisma.member.update({
          where: {
            organizationId_userId: {
              organizationId: organization.id,
              userId: transferToUserId
            }
          },
          data: {
            role: "ADMIN"
          }
        }),

        prisma.organization.update({
          where: { id: organization.id },
          data: {
            ownerId: transferToUserId
          }
        })

      ])

      return reply.status(204).send()

    })
}
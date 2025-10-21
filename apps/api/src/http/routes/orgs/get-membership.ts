import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { roleSchema } from "../../../../../../packages/auth/src/roles";
import { auth } from "@/http/middlewares/auth";
export async function getMembership(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post("/organizations/:slug/membership", {
      schema: {
        tags: ["Organizations"],
        summary: "Get user membership on organization",
        security: [{ bearerAuth: [] }],
        params: z.object({
          slug: z.string()
        }),
        response: {
          200: z.object({
            membership: z.object({
              id: z.uuid(),
              role: roleSchema,
              organizationId: z.uuid()
            })
          })
        }
      }
    }, async (request) => {
      const { slug } = request.params

      const { membership } = await request.getUserMembership(slug)

      return {
        membership: {
          id: membership.id,
          role: membership.role,
          organizationId: membership.organizationId
        }
      }
    })
}
import { auth } from "@/http/middlewares/auth";
import { prisma } from "@/lib/prisma";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { createSlug } from "@/utils/create-slug";
import { getUserPermissions } from "@/utils/get-user-permissions";
import { UnauthorizedError } from "../_erros/unauthorized-error";
import { BadRequestError } from "../_erros/bad-request-error";

export async function getProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get("/organizations/:orgSlug/projects/:projectSlug", {
      schema: {
        tags: ["Projects"],
        summary: "Get a project details",

        security: [{ bearerAuth: [] }],
        params: z.object({
          orgSlug: z.string(),
          projectSlug: z.string(),
        }),
        response: {
          200: z.object({
            project: z.object({
              id: z.uuid(),
              description: z.string(),
              name: z.string(),
              slug: z.string(),
              avatarUrl: z.string().nullable(),
              organizationId: z.uuid(),
              ownerId: z.uuid(),
              owner: z.object({
                id: z.string(),
                name: z.string().nullable(),
                avatarUrl: z.string().nullable()
              })
            })
          })
        }
      }
    }, async (request, reply) => {

      const { orgSlug, projectSlug } = request.params
      const userId = await request.getCurrentUserId()

      const { membership, organization } = await request.getUserMembership(orgSlug)

      const { cannot } = getUserPermissions(userId, membership.role)

      if (cannot("get", "Project")) {
        throw new UnauthorizedError(`You're not allowed to see this project.`)
      }

      const project = await prisma.project.findUnique({
        select: {
          id: true,
          name: true,
          description: true,
          slug: true,
          ownerId: true,
          avatarUrl: true,
          organizationId: true,
          owner: {
            select: {
              id: true,
              name: true,
              avatarUrl: true
            }
          }
        },
        where: {
          slug: projectSlug,
          organizationId: organization.id
        }
      })

      if (!project) {
        throw new BadRequestError("Project not found.")
      }

      return reply.status(200).send({
        project
      })

    })
}
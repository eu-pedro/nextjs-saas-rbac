import { auth } from "@/http/middlewares/auth";
import { prisma } from "@/lib/prisma";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { getUserPermissions } from "@/utils/get-user-permissions";
import { UnauthorizedError } from "../_erros/unauthorized-error";
import { projectSchema } from "@saas/auth/src/models/project";
import { BadRequestError } from "../_erros/bad-request-error";

export async function updateProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete("/organizations/:slug/projects/:projectId", {
      schema: {
        tags: ["Projects"],
        summary: "Update a project",
        security: [{ bearerAuth: [] }],
        body: z.object({
          name: z.string(),
          description: z.string(),
        }),
        params: z.object({
          slug: z.string(),
          projectId: z.uuid(),
        }),
        response: {
          204: z.null()
        }
      }
    }, async (request, reply) => {

      const { slug, projectId } = request.params
      const userId = await request.getCurrentUserId()

      const { membership, organization } = await request.getUserMembership(slug)

      const project = await prisma.project.findUnique({
        where: {
          id: projectId,
          organizationId: organization.id
        }
      })

      if (!project) {
        throw new BadRequestError("Project not found.")
      }

      const { cannot } = getUserPermissions(userId, membership.role)

      const authProject = projectSchema.parse(project)

      if (cannot("update", authProject)) {
        throw new UnauthorizedError(`You're not allowed to update this projects`)
      }

      const { description, name } = request.body

      await prisma.project.update({
        where: {
          id: projectId,
        },
        data: {
          name,
          description
        }
      })

      await prisma.project.delete({
        where: {
          id: projectId,
        }
      })


      return reply.status(204).send()

    })
}
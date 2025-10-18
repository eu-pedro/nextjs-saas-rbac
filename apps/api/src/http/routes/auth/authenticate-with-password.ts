import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

export async function authenticateWithPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post("/sessions/password", {
    schema: {
      tags: ["Auth"],
      summary: "Authenticate with e-mail & password.",
      body: z.object({
        email: z.email(),
        password: z.string(),
      }),
      response: {
        400: z.object({
          message: z.string()
        }),
        201: z.object({
          token: z.string(),
        }),
      }
    },
  }, async (request, reply) => {
    const { email, password } = request.body

    // buscando usuário pelo email
    const userFromEmail = await prisma.user.findUnique({
      where: { email }
    })

    // se não achou, informa o cliente
    if (!userFromEmail) {
      return reply.status(400).send({
        message: "Invalid credentials."
      })
    }

    // se encontrou:
    // verificamos se o hash da senha é null
    // pois se for null ele não usou o social login, só github

    if (userFromEmail.passwordHash === null) {
      return reply.status(400).send({
        message: "User does not have a password, use social login"
      })
    }

    // se ele fez login social, vamos comparar as senhas
    const isPassowrdInvalid = await compare(
      password,
      userFromEmail.passwordHash
    )

    // se a senha for errada:
    if (!isPassowrdInvalid) {
      return reply.status(400).send({
        message: "Invalid credentials"
      })
    }

    // gera o token assinando a prop sub com o email do usuário
    // essa prop sub é "padrão" e carrega a informação de quem criou esse token
    const token = await reply.jwtSign(
      {
        sub: userFromEmail.id
      }, {
      sign: {
        expiresIn: "7d"
      }
    })

    return reply.status(201).send({
      token,
    })
  })
}
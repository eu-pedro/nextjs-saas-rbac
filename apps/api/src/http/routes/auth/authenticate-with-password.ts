import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { BadRequestError } from "../_erros/bad-request-error";

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
      throw new BadRequestError("Invalid credentials.")
    }

    // se encontrou:
    // verificamos se o hash da senha é null
    // pois se for null ele não usou o social login, só github

    if (userFromEmail.passwordHash === null) {
      throw new BadRequestError("User does not have a password, use social login")
    }

    // se ele fez login social, vamos comparar as senhas
    const isPasswordInvalid = await compare(
      password,
      userFromEmail.passwordHash
    )

    // se a senha for errada:
    if (!isPasswordInvalid) {
      throw new BadRequestError("Invalid credentials.")
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
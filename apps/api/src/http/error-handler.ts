import type { FastifyInstance } from "fastify";
import z, { ZodError } from "zod";
import { BadRequestError } from "./routes/_erros/bad-request-error";
import { UnauthorizedError } from "./routes/_erros/unauthorized-error";
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'

type FastifyErrorHandler = FastifyInstance["errorHandler"]

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: "Validation error",
      errors: {
        issues: error.validation,
        method: request.method,
        url: request.url,
      }
    })
  }

  if (error instanceof BadRequestError) {
    return reply.status(400).send({
      message: error.message
    })
  }


  if (error instanceof UnauthorizedError) {
    return reply.status(401).send({
      message: error.message
    })
  }

  console.log(error)

  // send erro to some observability plataform

  return reply.status(500).send({
    message: "Internal server error.",
  })
}
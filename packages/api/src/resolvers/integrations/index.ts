import { authorized } from '../../utils/helpers'
import {
  DeleteIntegrationError,
  DeleteIntegrationErrorCode,
  DeleteIntegrationSuccess,
  IntegrationsError,
  IntegrationsErrorCode,
  IntegrationsSuccess,
  MutationDeleteIntegrationArgs,
  MutationSetIntegrationArgs,
  SetIntegrationError,
  SetIntegrationErrorCode,
  SetIntegrationSuccess,
} from '../../generated/graphql'
import { getRepository } from '../../entity/utils'
import { User } from '../../entity/user'
import { Integration } from '../../entity/integration'
import { analytics } from '../../utils/analytics'
import { env } from '../../env'
import { validateToken } from '../../services/integrations'
import { deleteTask, enqueueSyncWithIntegration } from '../../utils/createTask'

export const setIntegrationResolver = authorized<
  SetIntegrationSuccess,
  SetIntegrationError,
  MutationSetIntegrationArgs
>(async (_, { input }, { claims: { uid }, log }) => {
  log.info('setIntegrationResolver')

  try {
    const user = await getRepository(User).findOneBy({ id: uid })
    if (!user) {
      return {
        errorCodes: [SetIntegrationErrorCode.Unauthorized],
      }
    }

    let integrationToSave: Partial<Integration> = {
      user,
    }
    if (input.id) {
      // Update
      const existingIntegration = await getRepository(Integration).findOne({
        where: { id: input.id },
        relations: ['user'],
      })
      if (!existingIntegration) {
        return {
          errorCodes: [SetIntegrationErrorCode.NotFound],
        }
      }
      if (existingIntegration.user.id !== uid) {
        return {
          errorCodes: [SetIntegrationErrorCode.Unauthorized],
        }
      }

      if (existingIntegration.enabled === input.enabled) {
        return {
          integration: existingIntegration,
        }
      }
      integrationToSave = {
        ...integrationToSave,
        id: existingIntegration.id,
        taskName: existingIntegration.taskName,
        enabled: input.enabled,
      }
    } else {
      // Create
      const existingIntegration = await getRepository(Integration).findOneBy({
        user: { id: uid },
        type: input.type,
      })

      if (existingIntegration) {
        return {
          errorCodes: [SetIntegrationErrorCode.AlreadyExists],
        }
      }

      // validate token
      if (!(await validateToken(input.token, input.type))) {
        return {
          errorCodes: [SetIntegrationErrorCode.InvalidToken],
        }
      }
      integrationToSave = {
        ...integrationToSave,
        token: input.token,
        type: input.type,
        enabled: true,
      }
    }

    if (!integrationToSave.id || integrationToSave.enabled) {
      // create a task to sync all the pages if new integration or enable integration
      const taskName = await enqueueSyncWithIntegration(user.id, input.type)
      log.info('enqueued task', taskName)
      integrationToSave.taskName = taskName
    } else if (integrationToSave.taskName) {
      // delete the task if disable integration and task exists
      await deleteTask(integrationToSave.taskName)
      integrationToSave.taskName = null
      log.info('task deleted', integrationToSave.taskName)
    }
    const integration = await getRepository(Integration).save(integrationToSave)

    analytics.track({
      userId: uid,
      event: 'integration_set',
      properties: {
        id: integrationToSave.id,
        env: env.server.apiEnv,
      },
    })

    return {
      integration,
    }
  } catch (error) {
    log.error(error)

    return {
      errorCodes: [SetIntegrationErrorCode.BadRequest],
    }
  }
})

export const integrationsResolver = authorized<
  IntegrationsSuccess,
  IntegrationsError
>(async (_, __, { claims: { uid }, log }) => {
  log.info('integrationsResolver')

  try {
    const user = await getRepository(User).findOneBy({ id: uid })
    if (!user) {
      return {
        errorCodes: [IntegrationsErrorCode.Unauthorized],
      }
    }
    const integrations = await getRepository(Integration).findBy({
      user: { id: uid },
    })

    return {
      integrations,
    }
  } catch (error) {
    log.error(error)

    return {
      errorCodes: [IntegrationsErrorCode.BadRequest],
    }
  }
})

export const deleteIntegrationResolver = authorized<
  DeleteIntegrationSuccess,
  DeleteIntegrationError,
  MutationDeleteIntegrationArgs
>(async (_, { id }, { claims: { uid }, log }) => {
  log.info('deleteIntegrationResolver')

  try {
    const user = await getRepository(User).findOneBy({ id: uid })
    if (!user) {
      return {
        errorCodes: [DeleteIntegrationErrorCode.Unauthorized],
      }
    }

    const integration = await getRepository(Integration).findOne({
      where: { id },
      relations: ['user'],
    })

    if (!integration) {
      return {
        errorCodes: [DeleteIntegrationErrorCode.NotFound],
      }
    }

    if (integration.user.id !== uid) {
      return {
        errorCodes: [DeleteIntegrationErrorCode.Unauthorized],
      }
    }

    if (integration.taskName) {
      // delete the task if task exists
      await deleteTask(integration.taskName)
      log.info('task deleted', integration.taskName)
    }

    const deletedIntegration = await getRepository(Integration).remove(
      integration
    )
    deletedIntegration.id = id

    analytics.track({
      userId: uid,
      event: 'integration_delete',
      properties: {
        integrationId: deletedIntegration.id,
        env: env.server.apiEnv,
      },
    })

    return {
      integration: deletedIntegration,
    }
  } catch (error) {
    log.error(error)

    return {
      errorCodes: [DeleteIntegrationErrorCode.BadRequest],
    }
  }
})

import { env } from '../env'
import knex from 'knex'
import knexStringcase from 'knex-stringcase'

export const kx = knex(
  knexStringcase({
    client: 'pg',
    connection: {
      host: env.pg.host,
      port: env.pg.port,
      user: env.pg.userName,
      password: env.pg.password,
      database: env.pg.dbName,
    },
    pool: {
      max: env.pg.pool.max,
      acquireTimeoutMillis: 40000,
    },
  })
)

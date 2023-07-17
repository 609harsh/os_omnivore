import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import {
  Subscription,
  SubscriptionType,
} from '../queries/useGetSubscriptionsQuery'

type SubscribeResult = {
  subscribe: Subscribe
}

type Subscribe = {
  subscriptions: Subscription[]
  errorCodes?: unknown[]
}

export type SubscribeMutationInput = {
  name?: string
  url?: string
  subscriptionType?: SubscriptionType
}

export async function subscribeMutation(
  input: SubscribeMutationInput
): Promise<any | undefined> {
  const mutation = gql`
    mutation Subscribe($input: SubscribeInput!) {
      subscribe(input: $input) {
        ... on SubscribeSuccess {
          subscriptions {
            id
          }
        }
        ... on SubscribeError {
          errorCodes
        }
      }
    }
  `
  try {
    const data = (await gqlFetcher(mutation, { input })) as SubscribeResult
    return data.subscribe.errorCodes ? undefined : data.subscribe
  } catch (error) {
    console.log('subscribeMutation error', error)
    return undefined
  }
}

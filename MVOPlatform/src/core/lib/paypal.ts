import { PayPalEnvironment, PayPalHttpClient } from '@paypal/paypal-server-sdk'
import { serverEnv } from '@/env-validation/config/env'

const environment =
  serverEnv.paypalEnvironment === 'sandbox'
    ? new PayPalEnvironment.Sandbox(
        serverEnv.paypalClientId,
        serverEnv.paypalClientSecret || '' // Note: In sandbox, client secret might not be needed
      )
    : new PayPalEnvironment.Production(
        serverEnv.paypalClientId,
        serverEnv.paypalClientSecret
      )

export const client = new PayPalHttpClient(environment)

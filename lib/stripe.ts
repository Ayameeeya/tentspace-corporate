import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY is not configured')
}

export const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-05-28.basil',
    })
  : null

/**
 * Stripeに新しい顧客を作成する
 */
export async function createStripeCustomer(params: {
  email: string
  name?: string
  metadata?: Record<string, string>
}): Promise<{ customerId: string | null; error?: string }> {
  if (!stripe) {
    return { customerId: null, error: 'Stripe is not configured' }
  }

  try {
    const customer = await stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: {
        source: 'tentspace_blog',
        ...params.metadata,
      },
    })

    return { customerId: customer.id }
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    return { 
      customerId: null, 
      error: error instanceof Error ? error.message : 'Failed to create Stripe customer' 
    }
  }
}

/**
 * Stripe顧客を取得する
 */
export async function getStripeCustomer(customerId: string): Promise<Stripe.Customer | null> {
  if (!stripe) return null

  try {
    const customer = await stripe.customers.retrieve(customerId)
    if (customer.deleted) return null
    return customer as Stripe.Customer
  } catch (error) {
    console.error('Error retrieving Stripe customer:', error)
    return null
  }
}

/**
 * Stripe顧客を更新する
 */
export async function updateStripeCustomer(
  customerId: string,
  params: Stripe.CustomerUpdateParams
): Promise<Stripe.Customer | null> {
  if (!stripe) return null

  try {
    return await stripe.customers.update(customerId, params)
  } catch (error) {
    console.error('Error updating Stripe customer:', error)
    return null
  }
}

/**
 * Stripe顧客を削除する
 */
export async function deleteStripeCustomer(customerId: string): Promise<boolean> {
  if (!stripe) return false

  try {
    await stripe.customers.del(customerId)
    return true
  } catch (error) {
    console.error('Error deleting Stripe customer:', error)
    return false
  }
}


export type BillingType = string

export type SubscriptionType = 'max' | 'pro' | 'enterprise' | 'team'

export type RateLimitTier = string

export interface OAuthProfileResponse {
  account: {
    uuid: string
    email: string
    display_name: string | null
    created_at: string
  }
  organization: {
    uuid: string
    organization_type: string
    rate_limit_tier: RateLimitTier | null
    has_extra_usage_enabled: boolean | null
    billing_type: BillingType | null
    subscription_created_at: string | null
  }
}

export interface OAuthTokenExchangeResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope?: string
  account?: {
    uuid: string
    email_address: string
  }
  organization?: {
    uuid: string
  }
}

export interface OAuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
  scopes: string[]
  profile?: OAuthProfileResponse
  tokenAccount?: {
    uuid: string
    emailAddress: string
    organizationUuid: string
  }
}

export interface UserRolesResponse {
  organization_role: string | null
  workspace_role: string | null
  organization_name: string | null
}

export type ReferralCampaign = string

export interface ReferralEligibilityResponse {
  eligible: boolean
  remaining_passes?: number
  referrer_reward?: ReferrerRewardInfo | null
}

export interface ReferralRedemptionsResponse {
  redemptions: unknown[]
}

export interface ReferrerRewardInfo {
  currency: string
  amount_minor_units: number
}

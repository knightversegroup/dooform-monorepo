import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

import { UserModel } from '../../infrastructure/persistence/typeorm/models/user.model'
import { AuthService } from './auth.service'
import type { LineLoginDto } from '../dtos/oauth.dto'

interface LineTokenResponse {
  access_token: string
  expires_in: number
  id_token: string
  refresh_token: string
  scope: string
  token_type: string
}

interface LineProfile {
  userId: string
  displayName: string
  pictureUrl: string
  statusMessage: string
}

@Injectable()
export class LineAuthService {
  private readonly logger = new Logger(LineAuthService.name)
  private readonly channelId: string
  private readonly channelSecret: string
  private readonly callbackUrl: string

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.channelId = this.configService.get<string>('LINE_CHANNEL_ID', '')
    this.channelSecret = this.configService.get<string>('LINE_CHANNEL_SECRET', '')
    this.callbackUrl = this.configService.get<string>('LINE_CALLBACK_URL', '')
  }

  getAuthUrl(state: string, redirectUri?: string) {
    const callbackUri = redirectUri || this.callbackUrl
    const authUrl =
      `https://access.line.me/oauth2/v2.1/authorize` +
      `?response_type=code&client_id=${this.channelId}` +
      `&redirect_uri=${encodeURIComponent(callbackUri)}` +
      `&state=${state}&scope=profile%20openid`

    return { auth_url: authUrl }
  }

  async callback(dto: LineLoginDto) {
    // Exchange code for token
    const tokenResp = await this.exchangeCodeForToken(dto.code, dto.redirect_uri)

    // Get profile
    const profile = await this.getLineProfile(tokenResp.access_token)

    return this.authService.oauthLogin({
      findCondition: { lineUserId: profile.userId },
      createUser: (): Partial<UserModel> => ({
        lineUserId: profile.userId,
        displayName: profile.displayName || null,
        pictureUrl: profile.pictureUrl || null,
        authProvider: 'line',
        isActive: true,
        profileCompleted: false,
      }),
      updateUser: (user) => {
        let updated = false
        if (user.displayName !== profile.displayName) {
          user.displayName = profile.displayName; updated = true
        }
        if (user.pictureUrl !== profile.pictureUrl) {
          user.pictureUrl = profile.pictureUrl; updated = true
        }
        return updated
      },
      getEmail: (user) => user.email || user.lineUserId || `user_${user.id}`,
    })
  }

  private async exchangeCodeForToken(code: string, redirectUri: string): Promise<LineTokenResponse> {
    try {
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: this.channelId,
        client_secret: this.channelSecret,
      })

      const resp = await axios.post('https://api.line.me/oauth2/v2.1/token', params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000,
      })
      return resp.data
    } catch (err) {
      this.logger.error(`LINE token exchange failed: ${err}`)
      throw new InternalServerErrorException('Failed to exchange code for token')
    }
  }

  private async getLineProfile(accessToken: string): Promise<LineProfile> {
    try {
      const resp = await axios.get('https://api.line.me/v2/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 10000,
      })
      return resp.data
    } catch (err) {
      this.logger.error(`LINE profile fetch failed: ${err}`)
      throw new InternalServerErrorException('Failed to get LINE profile')
    }
  }
}

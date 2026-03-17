import { Injectable, UnauthorizedException, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

import { UserModel } from '../../infrastructure/persistence/typeorm/models/user.model'
import { AuthService } from './auth.service'
import type { GoogleLoginDto } from '../dtos/oauth.dto'

interface FirebaseUser {
  localId: string
  email: string
  emailVerified: boolean
  displayName: string
  photoUrl: string
  providerUserInfo: Array<{
    providerId: string
    rawId: string
    email: string
    displayName: string
    photoUrl: string
  }>
}

@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger(GoogleAuthService.name)
  private readonly firebaseApiKey: string

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.firebaseApiKey = this.configService.get<string>('FIREBASE_API_KEY', '')
  }

  async login(dto: GoogleLoginDto) {
    const tokenPayload = await this.verifyFirebaseIdToken(dto.id_token)

    return this.authService.oauthLogin({
      findCondition: { googleId: tokenPayload.googleId },
      emailFallback: tokenPayload.email || undefined,
      linkOAuthField: (user) => { user.googleId = tokenPayload.googleId },
      createUser: () => this.createUserFromPayload(tokenPayload),
      updateUser: (user) => this.updateUserFromPayload(user, tokenPayload),
      getEmail: (user) => user.email || user.googleId || `user_${user.id}`,
    })
  }

  private async verifyFirebaseIdToken(idToken: string) {
    try {
      const resp = await axios.post(
        `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=${this.firebaseApiKey}`,
        { idToken },
        { timeout: 10000 },
      )

      const users = resp.data?.users
      if (!users || users.length === 0) {
        throw new Error('No user found in token')
      }

      const firebaseUser: FirebaseUser = users[0]

      // Extract Google-specific info
      let googleId = firebaseUser.localId
      for (const provider of firebaseUser.providerUserInfo || []) {
        if (provider.providerId === 'google.com') {
          googleId = provider.rawId
          break
        }
      }

      // Split display name into first/last name
      const nameParts = (firebaseUser.displayName || '').split(' ')
      const givenName = nameParts[0] || ''
      const familyName = nameParts.slice(1).join(' ') || ''

      return {
        googleId,
        email: firebaseUser.email,
        emailVerified: firebaseUser.emailVerified,
        displayName: firebaseUser.displayName,
        picture: firebaseUser.photoUrl,
        givenName,
        familyName,
      }
    } catch (err: any) {
      const detail = err?.response?.data ? JSON.stringify(err.response.data) : String(err)
      this.logger.error(`Firebase token verification failed: ${detail}`)
      this.logger.error(`FIREBASE_API_KEY present: ${!!this.firebaseApiKey}, length: ${this.firebaseApiKey?.length}`)
      throw new UnauthorizedException('Invalid ID token')
    }
  }

  private createUserFromPayload(payload: ReturnType<GoogleAuthService['verifyFirebaseIdToken']> extends Promise<infer T> ? T : never): Partial<UserModel> {
    return {
      googleId: payload.googleId,
      email: payload.email || null,
      firstName: payload.givenName || null,
      lastName: payload.familyName || null,
      displayName: payload.displayName || null,
      pictureUrl: payload.picture || null,
      authProvider: 'google',
      isActive: true,
      profileCompleted: true,
    }
  }

  private updateUserFromPayload(user: UserModel, payload: any): boolean {
    let updated = false

    if (payload.displayName && user.displayName !== payload.displayName) {
      user.displayName = payload.displayName; updated = true
    }
    if (payload.picture && user.pictureUrl !== payload.picture) {
      user.pictureUrl = payload.picture; updated = true
    }
    if (payload.givenName && user.firstName !== payload.givenName) {
      user.firstName = payload.givenName; updated = true
    }
    if (payload.familyName && user.lastName !== payload.familyName) {
      user.lastName = payload.familyName; updated = true
    }
    if (payload.email && user.email !== payload.email) {
      user.email = payload.email; updated = true
    }

    return updated
  }
}

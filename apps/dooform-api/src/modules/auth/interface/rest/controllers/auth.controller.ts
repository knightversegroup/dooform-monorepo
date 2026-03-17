import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common'

import { Public } from '../../../../../common/decorators/public.decorator'
import { CurrentUser, type RequestUser } from '../../../../../common/decorators/current-user.decorator'

import { AuthService } from '../../../application/services/auth.service'
import { GoogleAuthService } from '../../../application/services/google-auth.service'
import { LineAuthService } from '../../../application/services/line-auth.service'
import { RegisterDto, LoginDto, RefreshTokenDto, UpdateProfileDto } from '../../../application/dtos/auth.dto'
import { GoogleLoginDto, LineLoginDto } from '../../../application/dtos/oauth.dto'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly lineAuthService: LineAuthService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Public()
  @Post('refresh')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refresh_token)
  }

  @Public()
  @Post('logout')
  async logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refresh_token)
  }

  @Get('me')
  async getMe(@CurrentUser() user: RequestUser) {
    return this.authService.getMe(user.userId)
  }

  @Put('profile')
  async updateProfile(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.userId, dto)
  }

  @Delete('profile/picture')
  async deleteProfilePicture(@CurrentUser() user: RequestUser) {
    return this.authService.deleteProfilePicture(user.userId)
  }

  // --- OAuth ---

  @Public()
  @Post('google/login')
  async googleLogin(@Body() dto: GoogleLoginDto) {
    const result = await this.googleAuthService.login(dto)
    return { success: true, data: result }
  }

  @Public()
  @Get('line/url')
  async getLineAuthUrl(
    @Query('state') state: string,
    @Query('redirect_uri') redirectUri?: string,
  ) {
    if (!state) {
      return { error: 'state parameter is required' }
    }
    return this.lineAuthService.getAuthUrl(state, redirectUri)
  }

  @Public()
  @Post('line/callback')
  async lineCallback(@Body() dto: LineLoginDto) {
    return this.lineAuthService.callback(dto)
  }
}

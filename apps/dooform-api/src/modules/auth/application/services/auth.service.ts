import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Not } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { createHash } from 'crypto'

import { UserModel } from '../../infrastructure/persistence/typeorm/models/user.model'
import { RoleModel } from '../../infrastructure/persistence/typeorm/models/role.model'
import { UserRoleModel } from '../../infrastructure/persistence/typeorm/models/user-role.model'
import { RefreshTokenModel } from '../../infrastructure/persistence/typeorm/models/refresh-token.model'
import { UserQuotaModel } from '../../infrastructure/persistence/typeorm/models/user-quota.model'
import { RoleName } from '../../domain/enums/auth.enum'
import { JwtTokenService } from './jwt-token.service'
import type { RegisterDto, LoginDto, UpdateProfileDto } from '../dtos/auth.dto'

const BCRYPT_COST = 12

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    @InjectRepository(UserModel)
    private readonly userRepo: Repository<UserModel>,
    @InjectRepository(RoleModel)
    private readonly roleRepo: Repository<RoleModel>,
    @InjectRepository(UserRoleModel)
    private readonly userRoleRepo: Repository<UserRoleModel>,
    @InjectRepository(RefreshTokenModel)
    private readonly refreshTokenRepo: Repository<RefreshTokenModel>,
    @InjectRepository(UserQuotaModel)
    private readonly userQuotaRepo: Repository<UserQuotaModel>,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if user already exists
    const existing = await this.userRepo.findOne({ where: { email: dto.email } })
    if (existing) {
      throw new ConflictException('User with this email already exists')
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_COST)
    const isFirstUser = await this.isFirstUser()

    // Create user in a transaction
    const user = await this.userRepo.manager.transaction(async (manager) => {
      const newUser = manager.create(UserModel, {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.first_name,
        lastName: dto.last_name,
        authProvider: 'email',
        isActive: true,
        profileCompleted: true,
      })
      const savedUser = await manager.save(newUser)

      // Assign role
      const roleName = isFirstUser ? RoleName.ADMIN : RoleName.USER
      await this.assignRoleInTransaction(manager, savedUser.id, roleName)

      // Create quota
      const quota = manager.create(UserQuotaModel, {
        userId: savedUser.id,
        totalQuota: 0,
        usedQuota: 0,
      })
      await manager.save(quota)

      return savedUser
    })

    const roleName = isFirstUser ? RoleName.ADMIN : RoleName.USER
    const roles = [roleName]

    // Generate tokens
    const tokenPair = await this.jwtTokenService.generateTokenPair(user.id, dto.email, roles)

    // Save refresh token
    await this.saveRefreshToken(user.id, tokenPair.refresh_token)

    return {
      ...tokenPair,
      user: await this.buildUserResponse(user.id),
    }
  }

  async login(dto: LoginDto) {
    // Find user with password
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email AND user.is_active = true AND user.auth_provider = :provider', {
        email: dto.email,
        provider: 'email',
      })
      .getOne()

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // Revoke existing refresh tokens (single session enforcement)
    await this.refreshTokenRepo.update(
      { userId: user.id, isRevoked: false },
      { isRevoked: true },
    )

    const roles = await this.getUserRoles(user.id)
    const email = user.email || ''
    const tokenPair = await this.jwtTokenService.generateTokenPair(user.id, email, roles)

    await this.saveRefreshToken(user.id, tokenPair.refresh_token)

    return {
      ...tokenPair,
      user: await this.buildUserResponse(user.id),
    }
  }

  async refreshToken(refreshTokenStr: string) {
    let claims
    try {
      claims = await this.jwtTokenService.verifyRefreshToken(refreshTokenStr)
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }

    // Check token in database (compare hashed values)
    const storedToken = await this.refreshTokenRepo.findOne({
      where: { token: this.hashToken(refreshTokenStr), isRevoked: false },
    })
    if (!storedToken || !storedToken.expiresAt || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }

    // Check user is active
    const user = await this.userRepo.findOne({
      where: { id: claims.sub, isActive: true },
    })
    if (!user) {
      throw new UnauthorizedException('User account is inactive')
    }

    // Revoke old token
    await this.refreshTokenRepo.update(storedToken.id, { isRevoked: true })

    // Get fresh roles and generate new tokens
    const roles = await this.getUserRoles(user.id)
    const email = user.email || ''
    const tokenPair = await this.jwtTokenService.generateTokenPair(user.id, email, roles)

    await this.saveRefreshToken(user.id, tokenPair.refresh_token)

    return {
      ...tokenPair,
      user: await this.buildUserResponse(user.id),
    }
  }

  async logout(refreshTokenStr: string) {
    await this.refreshTokenRepo.update(
      { token: this.hashToken(refreshTokenStr) },
      { isRevoked: true },
    )
    return { message: 'Logout successful' }
  }

  async getMe(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId, isActive: true },
    })
    if (!user) {
      throw new NotFoundException('User not found')
    }
    return this.buildUserResponse(user.id)
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId, isActive: true },
    })
    if (!user) {
      throw new NotFoundException('User not found')
    }

    let updated = false

    if (dto.email) {
      const existing = await this.userRepo.findOne({
        where: { email: dto.email, id: Not(userId) },
      })
      if (existing) {
        throw new ConflictException('Email already in use')
      }
      user.email = dto.email
      updated = true
    }

    if (dto.first_name !== undefined) { user.firstName = dto.first_name; updated = true }
    if (dto.last_name !== undefined) { user.lastName = dto.last_name; updated = true }
    if (dto.display_name !== undefined) { user.displayName = dto.display_name; updated = true }

    // Mark profile as completed for LINE users
    if (user.authProvider === 'line' && !user.profileCompleted) {
      if ((dto.first_name && dto.last_name) || dto.display_name) {
        user.profileCompleted = true
        updated = true
      }
    }

    if (!updated) {
      throw new BadRequestException('No fields to update')
    }

    await this.userRepo.save(user)
    return this.buildUserResponse(user.id)
  }

  async deleteProfilePicture(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId, isActive: true },
    })
    if (!user) {
      throw new NotFoundException('User not found')
    }

    if (!user.pictureUrl && !user.pictureObjectName) {
      throw new BadRequestException('No profile picture to delete')
    }

    user.pictureUrl = null
    user.pictureObjectName = null
    await this.userRepo.save(user)

    return this.buildUserResponse(user.id)
  }

  // --- OAuth login helper (shared by Google/LINE services) ---

  async oauthLogin(params: {
    findCondition: Record<string, any>
    emailFallback?: string
    linkOAuthField?: (user: UserModel) => void
    createUser: () => Partial<UserModel>
    updateUser?: (user: UserModel) => boolean
    getEmail: (user: UserModel) => string
  }) {
    let user = await this.userRepo.findOne({ where: params.findCondition })
    let isNewUser = false

    // Email-based account linking: if no user found by OAuth ID,
    // check if a user with the same email exists and link the accounts
    if (!user && params.emailFallback && params.linkOAuthField) {
      const emailUser = await this.userRepo.findOne({ where: { email: params.emailFallback } })
      if (emailUser) {
        params.linkOAuthField(emailUser)
        await this.userRepo.save(emailUser)
        user = emailUser
      }
    }

    if (!user) {
      const isFirstUser = await this.isFirstUser()

      user = await this.userRepo.manager.transaction(async (manager) => {
        const newUser = manager.create(UserModel, params.createUser())
        const savedUser = await manager.save(newUser)

        const roleName = isFirstUser ? RoleName.ADMIN : RoleName.USER
        await this.assignRoleInTransaction(manager, savedUser.id, roleName)

        const quota = manager.create(UserQuotaModel, {
          userId: savedUser.id,
          totalQuota: 0,
          usedQuota: 0,
        })
        await manager.save(quota)

        return savedUser
      })
      isNewUser = true
    } else if (params.updateUser) {
      const updated = params.updateUser(user)
      if (updated) {
        await this.userRepo.save(user)
      }
    }

    // Revoke existing refresh tokens (single session)
    await this.refreshTokenRepo.update(
      { userId: user.id, isRevoked: false },
      { isRevoked: true },
    )

    const roles = await this.getUserRoles(user.id)
    const email = params.getEmail(user)
    const tokenPair = await this.jwtTokenService.generateTokenPair(user.id, email, roles)

    await this.saveRefreshToken(user.id, tokenPair.refresh_token)

    return {
      ...tokenPair,
      user: await this.buildUserResponse(user.id),
    }
  }

  // --- Helpers ---

  async getUserRoles(userId: string): Promise<string[]> {
    try {
      const userRoles = await this.userRoleRepo.find({
        where: { userId },
        relations: ['role'],
      })
      return userRoles
        .filter((ur) => ur.role?.name && ur.role.isActive)
        .map((ur) => ur.role.name)
    } catch (err) {
      this.logger.warn(`Failed to fetch user roles: ${err}`)
      return []
    }
  }

  async isFirstUser(): Promise<boolean> {
    const count = await this.userRepo.count()
    return count === 0
  }

  async seedDefaultRoles(): Promise<void> {
    const adminExists = await this.roleRepo.findOne({ where: { name: RoleName.ADMIN } })
    if (!adminExists) {
      await this.roleRepo.save([
        {
          name: RoleName.ADMIN,
          displayName: 'Administrator',
          description: 'Full system access - can manage users, roles, quotas, templates, and forms',
          isActive: true,
        },
        {
          name: RoleName.USER,
          displayName: 'General User',
          description: 'Limited access - can view templates, fill forms, and generate documents with quota restrictions',
          isActive: true,
        },
      ])
      this.logger.log('Default roles seeded')
    }
  }

  async cleanupExpiredTokens(): Promise<void> {
    const result = await this.refreshTokenRepo
      .createQueryBuilder()
      .delete()
      .where('expires_at < :now OR is_revoked = true', { now: new Date() })
      .execute()
    this.logger.log(`Cleaned up ${result.affected ?? 0} expired/revoked tokens`)
  }

  private async assignRoleInTransaction(
    manager: any,
    userId: string,
    roleName: string,
    assignedBy?: string,
  ): Promise<void> {
    const role = await manager.findOne(RoleModel, {
      where: { name: roleName, isActive: true },
    })
    if (!role) {
      throw new Error(`Role ${roleName} not found`)
    }

    const userRole = manager.create(UserRoleModel, {
      userId,
      roleId: role.id,
      assignedBy: assignedBy ?? null,
      assignedAt: new Date(),
    })
    await manager.save(userRole)
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }

  private async saveRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date(Date.now() + this.jwtTokenService.getRefreshTokenDuration())
    const refreshToken = this.refreshTokenRepo.create({
      userId,
      token: this.hashToken(token),
      expiresAt,
      isRevoked: false,
    })
    await this.refreshTokenRepo.save(refreshToken)
  }

  async buildUserResponse(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) throw new NotFoundException('User not found')

    const roles = await this.getUserRoles(userId)
    const quota = await this.userQuotaRepo.findOne({ where: { userId } })

    return {
      id: user.id,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      display_name: user.displayName,
      picture_url: user.pictureUrl,
      line_user_id: user.lineUserId,
      google_id: user.googleId,
      auth_provider: user.authProvider,
      is_active: user.isActive,
      profile_completed: user.profileCompleted,
      roles,
      quota: quota
        ? { total: quota.totalQuota, used: quota.usedQuota, remaining: quota.totalQuota - quota.usedQuota }
        : null,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    }
  }
}

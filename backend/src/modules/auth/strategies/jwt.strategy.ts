import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'qjwldb-secret-key-2024',
    });
  }

  async validate(payload: any) {
    const user = await this.userRepository.findOne({ 
      where: { id: payload.sub, status: 1 } 
    });
    
    if (!user) {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    return { 
      id: user.id, 
      username: user.username, 
      role: user.role 
    };
  }
}

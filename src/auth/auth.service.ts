import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { HASH_ROUNDS, JWT_SECRET_KEY } from './const/auth.const';
import { UsersModel } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';
import bcrypt from 'bcrypt';

type JwtToken = {
  email: string;
  sub: number;
  type: 'access' | 'refresh';
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersServiace: UsersService,
  ) {}

  /**
   *
   * 1) 로그인하면 토큰들 보냄
   * 2) 로그인 할때는 basic토큰과 함게 요청
   * ex) {authorization: Basic {token}}
   *   basic토큰은 `이메일:비밀번호`를 base64인코딩
   * 3) 아무나 접근 할 수 없는 정보 private route접근시는 accesstoken을 헤더에 붙임
   *   ex) {authorization: Bearer {token}}
   * 4) 토큰과 요청을 함께 받은 서버는 토큰 검증을 통해 현재 요청을 보낸 사용자 알수있음
   *  현재 로그인한 사용자가 작성한 포스트만 가져오면 sub 값에 해당하는 포스트만 필터링
   * 5) 모든 토큰은 만료기간이 있음
   * 6) 토큰만료시 재발급하는 엔드포인트에 요청
   *
   */

  extractTokenFromHeader(header: string, isBearer: boolean) {
    const splitToken = header.split(' ');

    const prefix = isBearer ? 'Bearer' : 'Basic';

    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new UnauthorizedException('잘못 토큰');
    }

    const token = splitToken[1];

    return token;
  }

  decodeBasicToken(base64String: string) {
    const decoded = Buffer.from(base64String, 'base64').toString('utf8');
    const split = decoded.split(':');
    if (split.length !== 2) {
      throw new UnauthorizedException('잘못됨');
    }
    const [email, password] = split;

    return {
      email,
      password,
    };
  }

  // 토큰검증
  verifyToken(token: string): JwtToken {
    return this.jwtService.verify(token, {
      secret: this.configService.getOrThrow<string>(JWT_SECRET_KEY),
    });
  }

  rotateToken(token: string, isRefreshToken: boolean) {
    const decoded = this.jwtService.verify<JwtToken>(token, {
      secret: this.configService.getOrThrow<string>(JWT_SECRET_KEY),
    });

    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException('토큰 재발급 오직 리프레쉬');
    }

    return this.signToken(
      {
        email: decoded.email,
        id: decoded.sub,
      },
      isRefreshToken,
    );
  }

  /**
   * 1) registerWithEmail
   * - email, nickname, password입력받고 생성
   * - 생성이 완료되면 access, refresh반환
   * - 회원가입후 다시 로그인은 쓸데없음
   *
   * 2) loginWithEmail
   * - email, password입력받고 로그인
   * - 로그인 성공하면 access, refresh반환
   *
   * 3) loginUser
   * - 1), 2) 에서 필요한 accessToken, refreshToken을 반환
   *
   * 4) signToken
   * - 3) 에서 필요한 access와 refresh을 sign
   *
   * 5) authenticateWithEmailAndPassword
   * - 2)에서 로그인을 진행할때 필요한 기본적인 검증 진행
   * 1. 사용자 존재 확인 (email)
   * 2. 비번 확인
   * 3. 모두 통과되면 user 반환
   * 4. loginWithEmail에서 반환된 데이터 기반으로 토큰 생성
   */

  /**
   * Payload
   * - email
   * - sub (userId)
   * - type (access, refresh)
   */
  signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>(JWT_SECRET_KEY),
      // expiresIn: isRefreshToken ? '7d' : '15m',
      expiresIn: isRefreshToken ? 3600 : 300,
    });
  }

  loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
    const accessToken = this.signToken(user, false);
    const refreshToken = this.signToken(user, true);
    return {
      accessToken,
      refreshToken,
    };
  }

  async authenticateWithEmailAndPassword(
    user: Pick<UsersModel, 'email' | 'password'>,
  ) {
    const existingUser = await this.usersServiace.getUserByEmail(user?.email);

    if (!existingUser) {
      throw new UnauthorizedException('Not exists user.');
    }

    const passOk = await bcrypt.compare(user.password, existingUser.password);

    if (!passOk) {
      throw new UnauthorizedException('Invalid password.');
    }

    return existingUser;
  }

  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    const existsingUser = await this.authenticateWithEmailAndPassword(user);

    return this.loginUser(existsingUser);
  }

  async registerWithEmail(
    user: Pick<UsersModel, 'email' | 'password' | 'nickname'>,
  ) {
    const hash = await bcrypt.hash(
      user.password,
      this.configService.getOrThrow<number>(HASH_ROUNDS),
    );

    const newUser = await this.usersServiace.createUser({
      ...user,
      password: hash,
    });

    return this.loginUser(newUser);
  }
}

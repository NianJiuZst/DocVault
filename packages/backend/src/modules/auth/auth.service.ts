import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../user/user.service';  // 后续创建的用户服务

@Injectable()
export class AuthService {
  constructor(
    private httpService: HttpService,
    private jwtService: JwtService,
    private userService: UserService,  // 注入用户服务
  ) {}

  
  async getGitHubAccessToken(code: string) : Promise<{ access_token: string, token_type: string, scope: string, error?: string }> {
    const params = {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GITHUB_REDIRECT_URI,
    };

    const response: GithubAccessTokenResponse = await firstValueFrom(
      this.httpService.post(
        'https://github.com/login/oauth/access_token',
        params,
        { headers: { Accept: 'application/json' } },
      ),
    );

    return response.data;  // { access_token, token_type, scope }
  }

    async getGitHubUserInfo(accessToken: string) {
    const response: GithubUserResponse = await firstValueFrom(
      this.httpService.get('https://api.github.com/user', {
        headers: { Authorization: `token ${accessToken}` },
      }),
    );
    return response.data;  // { id, login, name, email, avatar_url 等 }
  }

  async handleGitHubCallback(code: string) {
    const { access_token: accessToken, error } = await this.getGitHubAccessToken(code);
    if (error || !accessToken) {
      throw new Error(`GitHub 令牌获取失败: ${error}`);
    }

    const githubUser = await this.getGitHubUserInfo(accessToken);

    const localUser = await this.userService.findOrCreate({
      githubId: githubUser.id,
      username: githubUser.login,
      name: githubUser.name,
      avatar: githubUser.avatar_url,
    });

    const jwtToken = this.jwtService.sign({
      userId: localUser.id, 
    });

    return { jwtToken, user: localUser };
  }
}
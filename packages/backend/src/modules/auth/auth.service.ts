import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { GithubAccessTokenResponse, GithubUserResponse } from './interface/github.interface';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private httpService: HttpService,
    private jwtService: JwtService,
    private userService: UserService, 
  ) {}

  
  async getGitHubAccessToken(code: string){
    const params = {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GITHUB_REDIRECT_URI,
    };
    //用授权码交换令牌（access_token）
    const response: AxiosResponse<GithubAccessTokenResponse> = await firstValueFrom(
      this.httpService.post<GithubAccessTokenResponse>(
        'https://github.com/login/oauth/access_token',
        params,
        // 响应类型设置为JSON
        { headers: { Accept: 'application/json' } },
      ),
    );
    return response.data;
  }

    async getGitHubUserInfo(accessToken: string) {
    //用令牌获取用户信息
    const response: AxiosResponse<GithubUserResponse> = await firstValueFrom(
      this.httpService.get('https://api.github.com/user', {
        headers: { Authorization: `token ${accessToken}` },
      }),
    );
    return response.data; 
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
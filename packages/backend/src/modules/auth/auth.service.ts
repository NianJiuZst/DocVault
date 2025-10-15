import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { GithubAccessTokenResponse, GithubUserResponse } from './interface/github.interface';
import { UsersService } from '../users/users.service';
import { URLSearchParams } from 'url';

@Injectable()
export class AuthService {
  constructor(
    private httpService: HttpService,
    private jwtService: JwtService,
    private userService: UsersService, 
  ) {}

  
  async getGitHubAccessToken(code: string){
    const params =new  URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID || '',
      client_secret: process.env.GITHUB_CLIENT_SECRET || '',
      code:code,
      redirect_uri: process.env.GITHUB_REDIRECT_URI || '',
    });
    //用授权码交换令牌（access_token）
    const response: AxiosResponse<GithubAccessTokenResponse> = await firstValueFrom(
      this.httpService.post<GithubAccessTokenResponse>(
        'https://github.com/login/oauth/access_token',
        params.toString(),
        // 响应类型设置为JSON
        { headers: { Accept: 'application/json','Content-Type': 'application/x-www-form-urlencoded' }, 
      timeout:10000},
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
      name: githubUser.name ? githubUser.name : '',
      githubUserId: githubUser.id.toString(),
      id: githubUser.id,
    });

    const jwtToken = this.jwtService.sign({
      userId: localUser?.id, 
    });

    return { jwtToken, user: localUser };
  }
}
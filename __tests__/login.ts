import { type AxiosInstance, type AxiosResponse } from 'axios';
import { httpsAgent, loginPath } from './testserver.js';
import { type GraphQLQuery } from './album/album-mutation.resolver.test.js';
import { type GraphQLResponseBody } from './album/album-query.resolver.test.js';
import { type LoginResult } from '../src/security/auth/service/auth.service.js';

const usernameDefault = 'admin';
const passwordDefault = 'p';

export const loginRest = async (
    axiosInstance: AxiosInstance,
    username = usernameDefault,
    password = passwordDefault,
) => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded', // eslint-disable-line @typescript-eslint/naming-convention
    };
    const response: AxiosResponse<LoginResult> = await axiosInstance.post(
        loginPath,
        `username=${username}&password=${password}`,
        { headers, httpsAgent },
    );
    return response.data.token;
};

export const loginGraphQL = async (
    axiosInstance: AxiosInstance,
    username: string = usernameDefault,
    password: string = passwordDefault,
): Promise<string> => {
    const body: GraphQLQuery = {
        query: `
            mutation {
                login(
                    username: "${username}",
                    password: "${password}"
                ) {
                    token
                }
            }
        `,
    };

    const response: AxiosResponse<GraphQLResponseBody> =
        await axiosInstance.post('graphql', body, { httpsAgent });

    const data = response.data.data!;
    return data.login.token; // eslint-disable-line @typescript-eslint/no-unsafe-return
};

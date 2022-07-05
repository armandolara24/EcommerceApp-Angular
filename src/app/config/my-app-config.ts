import { environment } from 'src/environments/environment';

// we are making "default export" of this JSON
export default {

    oidc: {
        clientId: '0oa3wsd48tyvwQ1MR5d7',
        issuer: 'https://dev-76318129.okta.com/oauth2/default',
        redirectUri: environment.luv2shopApiUrlLoginCallback,
        scopes: ['openid', 'profile', 'email']
    }

}
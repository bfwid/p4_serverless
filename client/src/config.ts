// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'jfbv22z1jb'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-2.amazonaws.com/dev`

export const authConfig = {
  // Auth0 application values
  domain: 'dev-1r0gh5g9.us.auth0.com',            // Auth0 domain
  clientId: 'z7TXIFWN3KAGdrYkck5bPVQyIp1CrrBH',   // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}

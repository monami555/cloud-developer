import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const fetch = require('node-fetch');
const logger = createLogger('auth')
const http = require('http');

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-7gkt66t5.eu.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized' + e.message, e)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function getCertificate(url): Promise<string> {
     logger.info('Getting certificate from url: ' + url)

     try {
       const response = await Axios.get(jwksUrl);
       logger.info('Fetched response: ' + JSON.stringify(response))

       const key = response['data']['keys'][0]['x5c'][0];
       logger.info('Parsed RS256 key', key)

       const cert = `-----BEGIN CERTIFICATE-----\n${key}\n-----END CERTIFICATE-----`;
       logger.info('Prepared RS256 certificate', cert)

       return cert
     } catch (error) {
       logger.error('Getting certificate failed: ', error)
     }

     const json = await response.json()
     logger.info(json)

     const cert = json.keys[0].x5c[0]
     logger.info('Fetched RS256 certificate', cert)

     return cert
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)

  //const jwt: Jwt = decode(token, { complete: true }) as Jwt
  const cert = await getCertificate(jwksUrl)

  return verify(
     token,  // Token from an HTTP header to validate
     cert,   // A certificate copied from Auth0 website
     { algorithms: ['RS256'] } // We need to specify that we use the RS256 algorithm
  ) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  logger.info('Got token from header: ' + token)
  return token
}

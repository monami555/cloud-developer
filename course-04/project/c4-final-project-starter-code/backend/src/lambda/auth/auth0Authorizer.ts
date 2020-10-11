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

     let response = null
     try {
       logger.info(fetch)
       response = await fetch("http://www.google.com")
       logger.info('Key set response arrived')

       //const json = await response.json()
       //logger.info(json)

       //const cert = json.keys[0].x5c[0]
       const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJeGCdq930MlVLMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi03Z2t0NjZ0NS5ldS5hdXRoMC5jb20wHhcNMjAxMDEwMTM0MDIyWhcN
MzQwNjE5MTM0MDIyWjAkMSIwIAYDVQQDExlkZXYtN2drdDY2dDUuZXUuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxtIclgPjIrk15Rbq
dWtUUSTz9KeyVoXbv+Zc+0Kotb23kx+Zqpc8ws9B47b24t1TVb1gzhESbubLeLQ7
T0PnIrGHQGCUWGoqEVFzV66ESqVYKXy9kth6YqPpgGtqUNYTCj3D1pgwjh2M2wx0
Rl6IdWtm12O2MCb8GzmpVkKcEVGNoetIPNtQ7GRorEmwvsrDTuMVap/qs7ezT5Ar
gTKUOUOdWHRjbfuSBqs4ZBMtyHI22jbY5epMJLrdgYU385LhoypCl6Wu+xXoGn63
pqJyaNyvpcdt1Qndc6TE3GdzjTLkc8cJt+6+xrLsrEUQbmLXjeilczATmyqsYlIT
mvKkYQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQLwAJNmdlQ
DOxgCe+RdFO02v8jaDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
ACGizVQEPS/ZC9ReiCHZXk06fY4Lx21iqFdWtWKcv0WEBlUtHfQnRMBH/niQMAcL
FUWDQp1oH/awSOnE6Sr6kKrnDVDdGy0FHJ0lfC0z9eZ6/ND16mXPt4IIq/HXzEOy
p0rTKYHnSOn+weYyl86UzgTgHcF/lnO63MkOpl8cWnD2zSGgiK0skITSnq6s5cFb
oXTS55wj+b6fP66h+4zbS0lm2PWU6zR6XLw3gQ6e8i9TcjDVfw9YVG60eJAIK1G8
ZRYFAi/cRsiTyyW3e+nNWSFcTQK19TGvtRL5NyA+jNLutj864M2PnrkMHCuPnnnM
7I9Bio/MJBDjhimkpjN4abA=
-----END CERTIFICATE-----`
       logger.info('Fetched RS256 certificate', cert)

       return cert
     } catch (error) {
       logger.error('Getting certificate failed: ', error)
     }
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

import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS  from 'aws-sdk'

const logger = createLogger('auth')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  const s3 = new AWS.S3({
     signatureVersion: 'v4' // Use Sigv4 algorithm
  })

  logger.info('Creating signed url')

  const presignedUrl = s3.getSignedUrl('putObject', { // The URL will allow to perform the PUT operation
    Bucket: process.env.TODO_ATTACHMENTS_S3, // Name of an S3 bucket
    Key: todoId, // id of an object this URL allows access to
    Expires: process.env.SIGNED_URL_EXPIRATION  // A URL is only valid for this time
  })

  logger.info('Created signed url', {
    presignedUrl
  })

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      todoId,
      presignedUrl
    })
  }
}

import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as AWS  from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()
const todoTable = process.env.TODO_TABLE
const logger = createLogger('auth')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  const updatedItem = {
     todoId,
     ...updatedTodo
  }

  await docClient.put({
     TableName: todoTable,
     Item: updatedItem
  }).promise()

  logger.info('Updated TODO:', {
     updatedItem
  })

  return {
     statusCode: 200,
     headers: {
       'Access-Control-Allow-Origin': '*'
     },
     body: JSON.stringify({
       updatedItem
     })
   }
}

import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'
import { createLogger } from '../../utils/logger'

const docClient = new AWS.DynamoDB.DocumentClient()
const todoTable = process.env.TODO_TABLE
const logger = createLogger('auth')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const todoId = uuid.v4()

  const newItem = {
    todoId,
    createdAt: new Date().toISOString(),
    name: newTodo.name,
    dueDate: newTodo.dueDate,
    done: false,
    attachmentUrl: `https://${process.env.TODO_ATTACHMENTS_S3}.s3.amazonaws.com/${todoId}`
  }

  await docClient.put({
    TableName: todoTable,
    Item: newItem
  }).promise()

  logger.info('TODO created', {
    todo: newItem
  })

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      newItem
    })
  }
}

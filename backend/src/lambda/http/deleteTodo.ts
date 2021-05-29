import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { deleteTodo, todoExists } from '../../businessLogic/todo'

const logger = createLogger('getTodos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId: string = getUserId(event)

  if(!todoId || !userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        error: 'Missing parameters' 
      })
    }
  }

  const validTodo = await todoExists(todoId, userId)
  if(!validTodo) {
    return {
      statusCode: 404,
      body: JSON.stringify({ 
        error: 'TODO item not found' 
      })
    }
  }
  
  logger.info('Delete TODO: ', {'todoId': todoId, 'userId': userId})
  await deleteTodo(todoId, userId)

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({})
  }
}

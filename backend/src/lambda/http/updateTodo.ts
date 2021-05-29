import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { updateTodo, todoExists } from '../../businessLogic/todo'

const logger = createLogger('createTodo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  logger.info('Received Update TODO Request ', {updatedTodo})
  const userId: string = getUserId(event)
  logger.info('Update TODO: ', {'todoId': todoId, 'userId': userId})

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

  await updateTodo(todoId, userId, updatedTodo)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({})
  }
}
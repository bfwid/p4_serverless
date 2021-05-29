import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { todoExists, getUploadUrl, uploadAttachment } from '../../businessLogic/todo'

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

  logger.info('Adding URL to ', {'todoId': todoId, 'userId': userId})

  const signedUrl: string = await getUploadUrl(todoId)
  logger.info('Retrieved Signed URL ', {'signedUrl': signedUrl})

  await uploadAttachment(todoId, userId)
  logger.info('Attachment uploaded ', {'todoId': todoId, 'userId': userId, 'signedUrl': signedUrl})
    
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl: signedUrl
    })
  }
}

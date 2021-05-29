import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'

const AWSXRay = require('aws-xray-sdk-core');
const XAWS = AWSXRay.captureAWS(require('aws-sdk'));
const logger = createLogger('todoAccess')

// Reference: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todoTable = process.env.TODO_TABLE,
    private readonly todoCreatedAtIndex = process.env.TODO_CREATEDAT_INDEX,
    private readonly bucket = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly todoBucket = process.env.TODO_S3_BUCKET,
    private readonly signedUrlExpiration = process.env.SIGNED_URL_EXPIRATION) {
  }

  async getAllTodoItems(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all TODOs for: ', {'userId': userId})

    const result = await this.docClient.query({
      TableName: this.todoTable,
      IndexName: this.todoCreatedAtIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId }
    }).promise()

    logger.info('Retreived TODO items for: ', {'userId': userId})

    const items = result.Items
    return items as TodoItem[]
  }
  

  async todoExists(todoId: string, userId: string) {
    const result = await this.docClient.get({
      TableName: this.todoTable,
      Key: {
        'userId': userId,
        'todoId': todoId
      }
    }).promise()
  
    logger.info('TODO Exists: ', {'result': result})
    return !!result.Item
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info('Creating new TODO', {todo})
    const result = await this.docClient.put({
      TableName: this.todoTable,
      Item: todo
    }).promise()

    logger.info('Create result ', result)

    return todo
  }

  async updateTodo(todoId: string, userId: string, updatedTodo: UpdateTodoRequest) {
    logger.info('Updating TODO ID ', {'todoId': todoId, 'userId': userId})
    
    const result = await this.docClient.update({
        TableName: this.todoTable,
        Key: {
          'userId': userId,
          'todoId': todoId
        },
        UpdateExpression: 'set #name = :name, #dueDate = :dueDate, #done = :done',
        ExpressionAttributeNames: {
          '#name': 'name',
          '#dueDate': 'dueDate',
          '#done': 'done'
        },
        ExpressionAttributeValues: {
          ':name': updatedTodo.name,
          ':dueDate': updatedTodo.dueDate,
          ':done': updatedTodo.done
        },
    }).promise()

    logger.info('Update result ', result)
  }

  async deleteTodo(todoId: string, userId: string) {
    logger.info('Deleting TODO ID ', {'todoId': todoId, 'userId': userId})

    const result = await this.docClient.delete({
        TableName: this.todoTable,
        Key: {
          'userId': userId,
          'todoId': todoId
        }
    }).promise()

    logger.info('Delete result ', result)
  }

  async getUploadUrl(todoId: string): Promise<string> {
    logger.info('Obtaining signed URL for ', {'todoId': todoId})
    const imgKey: string = todoId + '.png'

    const url = this.bucket.getSignedUrl(
      'putObject', {
          Bucket: this.todoBucket,
          Key: imgKey,
          Expires: this.signedUrlExpiration
      })
      
    logger.info('Signed URL for upload ', {'todoId': todoId, 'url': url})

    return url
  }

  async uploadAttachment(todoId: string, userId: string) {
    const url = 'https://' + this.todoBucket + '.s3.us-east-2.amazonaws.com/' + todoId + '.png'
    logger.info('Associating attachment ', {'todoId': todoId, 'userId': userId, 'url': url})

    const result = await this.docClient.update({
        TableName: this.todoTable,
        Key: {
          'userId': userId,
          'todoId': todoId
        },
        UpdateExpression: 'set #attachmentUrl = :attachmentUrl',
        ExpressionAttributeNames: {
          '#attachmentUrl': 'attachmentUrl'
        },
        ExpressionAttributeValues: {
          ':attachmentUrl': url
        }
    }).promise()

    logger.info('Updated TODO with attachment url ', result)
  }
}

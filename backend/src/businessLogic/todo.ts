import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'

const logger = createLogger('todo')

const todoAccess = new TodoAccess()

export async function getAllTodoItems(userId: string): Promise<TodoItem[]> {
  return todoAccess.getAllTodoItems(userId)
}

export async function todoExists(todoId: string, userId: string) {
    return await todoAccess.todoExists(todoId, userId)
}

export async function createTodo(createTodoRequest: CreateTodoRequest,
                                 userId: string
                                ): Promise<TodoItem> {
  const todoId = uuid.v4()
  const timestamp: string = new Date().toISOString()
  logger.info('Create TODO: ', {'todoId': todoId, 'userId': userId})

  const newTodo: TodoItem = {
      todoId,
      userId,
      createdAt: timestamp,
      done: false,
      ...createTodoRequest
  }

  return await todoAccess.createTodo(newTodo)
}

 export async function updateTodo(todoId: string, userId: string, updatedTodo: UpdateTodoRequest) {
     return await todoAccess.updateTodo(todoId, userId, updatedTodo)
 }

export async function deleteTodo(todoId: string, userId: string) {
    return await todoAccess.deleteTodo(todoId, userId)
}

export async function getUploadUrl(todoId: string): Promise<string> {
    return await todoAccess.getUploadUrl(todoId)
}

export async function uploadAttachment(todoId: string, userId: string) {
    return await todoAccess.uploadAttachment(todoId, userId)
}

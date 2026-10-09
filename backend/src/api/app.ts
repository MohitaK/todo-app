import express from 'express';
import cors from 'cors';
import type { TodoService } from '../service/TodoService';
import { createTodosRouter } from './todos.router';
import { errorMiddleware } from './errorMiddleware';

export function createApp(service: TodoService) {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/todos', createTodosRouter(service));
  app.use(errorMiddleware);
  return app;
}

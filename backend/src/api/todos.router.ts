import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import type { TodoService } from '../service/TodoService';
import type { FilterStatus, SortBy } from '../domain/todo.types';

export function createTodosRouter(service: TodoService): Router {
  const router = Router();

  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const todo = await service.createTodo(req.body);
      res.status(201).json(todo);
    } catch (err) {
      next(err);
    }
  });

  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter = req.query['filter'] as FilterStatus | undefined;
      const sortBy = req.query['sortBy'] as SortBy | undefined;
      const todos = await service.getTodos(filter, sortBy);
      res.json(todos);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const todo = await service.getTodoById(req.params['id']!);
      res.json(todo);
    } catch (err) {
      next(err);
    }
  });

  router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const todo = await service.updateTodo(req.params['id']!, req.body);
      res.json(todo);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      await service.deleteTodo(req.params['id']!);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  router.patch('/:id/complete', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const todo = await service.completeTodo(req.params['id']!);
      res.json(todo);
    } catch (err) {
      next(err);
    }
  });

  router.patch('/:id/incomplete', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const todo = await service.incompleteTodo(req.params['id']!);
      res.json(todo);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

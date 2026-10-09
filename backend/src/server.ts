import { FileTodoRepository } from './repository/FileTodoRepository';
import { TodoService } from './service/TodoService';
import { createApp } from './api/app';

const repo = new FileTodoRepository();
const service = new TodoService(repo);
const app = createApp(service);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

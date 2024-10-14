import { getMockTodos, setMockTodos } from "./mockData";

// Define Todo type
export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

// GET todos
export const fetchTodos = async (): Promise<Response> => {
  const todos = getMockTodos();
  return new Response(JSON.stringify(todos), { status: 200 });
};

// POST new todo
export const addTodo = async (newTodo: Omit<Todo, "id">): Promise<Response> => {
  const todos = getMockTodos();
  const newId = todos.length > 0 ? Math.max(...todos.map((t) => t.id)) + 1 : 1;
  const todoToAdd = { ...newTodo, id: newId };
  setMockTodos([...todos, todoToAdd]);
  return new Response(JSON.stringify(todoToAdd), { status: 201 });
};

// PUT update todo
export const updateTodo = async (updatedTodo: Todo): Promise<Response> => {
  const todos = getMockTodos();
  const updatedTodos = todos.map((t) =>
    t.id === updatedTodo.id ? updatedTodo : t
  );
  setMockTodos(updatedTodos);
  return new Response(JSON.stringify(updatedTodo), { status: 200 });
};

// DELETE todo
// ... other imports and functions remain the same

export const deleteTodo = async (id: number): Promise<void> => {
  const todos = getMockTodos();
  const updatedTodos = todos.filter((t) => t.id !== id);
  setMockTodos(updatedTodos);
  // No need to return a Response object
};

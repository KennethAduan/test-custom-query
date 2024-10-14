import { Todo } from "./api";

let mockTodos: Todo[] = [];

export const getMockTodos = () => [...mockTodos];
export const setMockTodos = (todos: Todo[]) => {
  mockTodos = todos;
};

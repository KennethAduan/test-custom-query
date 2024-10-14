import { useState } from "react";
import "./App.css";
import { addTodo, fetchTodos, Todo, deleteTodo } from "./api";
import { useCustomQuery } from "./hooks/useCustomQuery";
import { useCustomMutation } from "./hooks/useCustomMutation";

function App() {
  const {
    data: todos,
    isLoading: isLoadingTodos,
    error: todosError,
    refetch: refetchTodos,
  } = useCustomQuery<Todo[]>("todos", fetchTodos, {
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });

  const [newTodoTitle, setNewTodoTitle] = useState("");

  const addTodoMutation = useCustomMutation(addTodo, {
    queryKey: "todos",
    onSuccess: () => {
      refetchTodos();
      setNewTodoTitle("");
    },
  });

  const deleteTodoMutation = useCustomMutation(deleteTodo, {
    queryKey: "todos",
    onSuccess: () => refetchTodos(),
  });
  const handleAddTodo = () => {
    if (newTodoTitle.trim()) {
      addTodoMutation.mutate({ title: newTodoTitle, completed: false });
    }
  };

  const handleDeleteTodo = (id: number) => {
    deleteTodoMutation.mutate(id);
  };

  if (isLoadingTodos) return <p>Loading...</p>;
  if (todosError) return <p>Error: {todosError.message}</p>;

  return (
    <div>
      <h1>Todo App</h1>
      <ul>
        {todos?.map((todo) => (
          <li key={todo.id} style={{ display: "flex", gap: "10px" }}>
            <span>{todo.title}</span>
            <button onClick={() => handleDeleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <button onClick={refetchTodos}>Refetch</button>
      <div>
        <input
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          placeholder="New todo title"
        />
        <button onClick={handleAddTodo} disabled={addTodoMutation.isLoading}>
          {addTodoMutation.isLoading ? "Adding..." : "Add Todo"}
        </button>
      </div>
      {addTodoMutation.error && (
        <p>Error adding todo: {addTodoMutation.error.message}</p>
      )}
      {deleteTodoMutation.error && (
        <p>Error deleting todo: {deleteTodoMutation.error.message}</p>
      )}
    </div>
  );
}

export default App;

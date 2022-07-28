import { useState } from 'react'
import { TodoInput } from './TodoInput'
import { TodoItem } from './TodoItem'
import { v4 as uuid } from 'uuid'

export interface Todo {
  id: string
  title: string
  completed: boolean
}

export function TodoList() {
  const [todoList, setTodoList] = useState<Array<Todo>>([])

  function addTodo(title: Todo['title']) {
    const todo: Todo = { id: uuid(), title, completed: false }
    setTodoList([...todoList, todo])
  }

  return (
    <div className="w-full">
      <TodoInput onSubmit={addTodo} />

      <div className="text-slate-600 my-6 bg-white rounded-md shadow-sm divide-y divide-slate-100">
        {todoList.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onChange={(checked) => {
              setTodoList(
                todoList.map((t) =>
                  t.id === todo.id ? { ...t, completed: checked } : t,
                ),
              )
            }}
            onRemove={() => {
              setTodoList(todoList.filter((t) => t.id !== todo.id))
            }}
          />
        ))}
      </div>
    </div>
  )
}

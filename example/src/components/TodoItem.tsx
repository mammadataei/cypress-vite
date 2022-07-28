import type { Todo } from './Todos'
import { Circle, CheckCircle, Trash2 } from 'react-feather'

interface TodoItemProps {
  todo: Todo
  onChange: (checked: boolean) => void
  onRemove: () => void
}

export function TodoItem(props: TodoItemProps) {
  const { todo, onChange, onRemove } = props

  return (
    <div className="w-full flex items-center px-4 py-3 hover:text-slate-800 hover:bg-slate-50">
      <div className="flex flex-grow items-center">
        {todo.completed ? (
          <CheckCircle className="w-5 h-5 text-sky-500" />
        ) : (
          <Circle className="text-slate-500 w-5 h-5" />
        )}
        <input
          id={todo.id}
          type="checkbox"
          checked={todo.completed}
          onChange={() => onChange(!todo.completed)}
          className="appearance-none"
        />
        <label
          htmlFor={todo.id}
          className={`ml-3 flex-grow ${
            todo.completed ? 'line-through text-slate-400' : ''
          }`}
        >
          {todo.title}
        </label>
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${todo.title}`}
        className="p-2 rounded-full hover:bg-slate-100"
      >
        <Trash2 className="text-slate-400 hover:text-red-600 w-5 h-5" />
      </button>
    </div>
  )
}

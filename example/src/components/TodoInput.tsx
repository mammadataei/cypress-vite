import { FormEvent, useState } from 'react'
import { PlusCircle } from 'react-feather'

interface TodoInputProps {
  onSubmit: (title: string) => void
}

export function TodoInput(props: TodoInputProps) {
  const [title, setTitle] = useState('')

  function addTodoHandler(event: FormEvent) {
    event.preventDefault()

    if (title.length === 0) {
      return
    }

    props.onSubmit(title)
    setTitle('')
  }

  return (
    <form className="flex gap-x-3" onSubmit={addTodoHandler}>
      <input
        type="text"
        aria-label="Add new todo"
        placeholder="What needs to be done?"
        value={title}
        onChange={({ target }) => setTitle(target.value)}
        className="px-4 py-3 w-full border border-slate-100 shadow-sm rounded-md"
      />

      <button
        aria-label="Add"
        type="submit"
        className="py-2 px-3 text-gray-500 hover:text-sky-500 hover:bg-slate-50 rounded-md"
      >
        <PlusCircle className="inline-block w-6 h-6" />
      </button>
    </form>
  )
}

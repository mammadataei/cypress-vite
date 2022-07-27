import { TodoList } from './components/Todos'

function App() {
  return (
    <div className="h-screen bg-slate-100">
      <div className="max-w-screen-md h-full mx-auto py-20 px-24 flex flex-col items-center">
        <div className="my-10">
          <h1 className="text-4xl text-slate-800">Todo App</h1>
        </div>

        <TodoList />
      </div>
    </div>
  )
}

export default App

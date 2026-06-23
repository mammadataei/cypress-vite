import type { Todo } from '@src/components/Todos'
import { createTodo } from '@tests/utils/factory'

beforeEach(() => {
  cy.visit('/')
})

it('should add a new todo', () => {
  cy.findByRole('textbox', { name: 'Add new todo' })
    .as('input')
    .type('Buy milk')
  cy.findByRole('button', { name: 'Add' }).click()

  cy.get('@input').should('have.value', '')
  cy.findByRole('checkbox', { name: 'Buy milk' }).should('exist')
})

it('should add multiple todos', () => {
  createTodo({ length: 4 }).forEach(({ title }) => {
    cy.findByRole('textbox', { name: 'Add new todo' }).type(`${title}{enter}`)
    cy.findByRole('checkbox', { name: title }).should('exist')
  })
})

it('should remove a todo', () => {
  cy.findByRole('textbox', { name: 'Add new todo' }).type('Buy milk')
  cy.findByRole('button', { name: 'Add' }).click()

  cy.findByRole('checkbox', { name: 'Buy milk' }).should('exist')
  cy.findByRole('button', { name: 'Remove Buy milk' }).click()

  cy.findByRole('checkbox', { name: 'Buy milk' }).should('not.exist')
})

it('should add multiple todos using fixtures', () => {
  cy.fixture<Array<Todo>>('todos').then((todos) => {
    todos.forEach((todo) => {
      cy.findByRole('textbox', { name: 'Add new todo' }).type(
        `${todo.title}{enter}`,
      )

      if (todo.completed) {
        cy.findByText(todo.title).click()
        cy.findByRole('checkbox', { name: todo.title })
          .should('exist')
          .and('be.checked')
      } else {
        cy.findByRole('checkbox', { name: todo.title })
          .should('exist')
          .and('not.be.checked')
      }
    })
  })
})

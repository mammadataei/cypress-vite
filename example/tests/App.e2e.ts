export {}

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
  ;['Buy milk', 'Buy eggs', 'Buy bread'].forEach((todo) => {
    cy.findByRole('textbox', { name: 'Add new todo' }).type(`${todo}{enter}`)
    cy.findByRole('checkbox', { name: todo }).should('exist')
  })
})

it('should remove a todo', () => {
  cy.findByRole('textbox', { name: 'Add new todo' }).type('Buy milk')
  cy.findByRole('button', { name: 'Add' }).click()

  cy.findByRole('checkbox', { name: 'Buy milk' }).should('exist')
  cy.findByRole('button', { name: 'Remove Buy milk' }).click()

  cy.findByRole('checkbox', { name: 'Buy milk' }).should('not.exist')
})

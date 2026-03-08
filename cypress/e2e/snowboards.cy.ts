/// <reference types="cypress" />

describe('Snowboards Catalog', () => {
  const API_BASE = 'https://dummyjson.com/c/5ab5-caac-4d58-81cf'

  beforeEach(() => {
    cy.intercept('GET', `${API_BASE}*`, { fixture: 'snowboards.json' }).as('fetchSnowboards')
    cy.intercept('DELETE', `${API_BASE}/*`, { statusCode: 200 }).as('deleteSnowboard')
    cy.visit('/')
    cy.wait('@fetchSnowboards')
  })

  it('displays the catalog with snowboard list', () => {
    cy.contains('h1', 'Snowboards catalog').should('be.visible')
    cy.contains('Burton Custom X').should('be.visible')
    cy.contains('Jones Frontier').should('be.visible')
    cy.contains('Lib Tech Orca').should('be.visible')
  })

  it('opens detail sidepanel when clicking a row', () => {
    cy.contains('tr', 'Burton Custom X').click()
    // Sidepanel shows snowboard title as header; "Snowboard details" only when null
    cy.contains('All-mountain board for versatile riding').should('be.visible')
    cy.contains('Burton').should('be.visible')
    cy.contains('Directional').should('be.visible')
    cy.contains('€599.00').should('be.visible')
  })

  it('creates a new snowboard', () => {
    cy.contains('button', 'Add').click()
    cy.contains('Add a new product').should('be.visible')

    cy.get('#title').type('E2E Test Board')
    cy.get('#description').type('Created by Cypress')
    cy.get('#brand').type('TestBrand')
    cy.get('#shape').type('Twin')
    cy.get('#price').clear().type('299')
    cy.get('#discount').clear().type('0')
    cy.get('#stock').clear().type('5')
    cy.get('#sizes').type('150, 154, 158')
    cy.get('#stiffness').clear().type('5')

    cy.contains('button', 'Select styles').click()
    cy.contains('All mountain').click()

    cy.contains('button', 'Create').click({ force: true })

    cy.contains('E2E Test Board').should('be.visible')
    cy.contains('TestBrand').should('be.visible')
  })

  it('edits an existing snowboard', () => {
    cy.get('button[aria-label="Edit Burton Custom X"]').click({ force: true })
    cy.contains('Edit Burton Custom X').should('be.visible')

    cy.get('#title').clear().type('Burton Custom X Updated')
    cy.contains('button', 'Save').click()

    cy.contains('Burton Custom X Updated').should('be.visible')
  })

  it('deletes a snowboard after confirmation', () => {
    cy.contains('Lib Tech Orca').should('be.visible')
    cy.get('button[aria-label="Delete Lib Tech Orca"]').click({ force: true })

    cy.contains('Delete snowboard').should('be.visible')
    cy.contains('Are you sure you want to delete "Lib Tech Orca"?').should('be.visible')
    cy.contains('button', 'Delete').click()

    cy.contains('Lib Tech Orca').should('not.exist')
  })

  it('cancels delete without removing the snowboard', () => {
    cy.contains('Burton Custom X').should('be.visible')
    cy.get('button[aria-label="Delete Burton Custom X"]').click({ force: true })

    cy.contains('Delete snowboard').should('be.visible')
    cy.contains('button', 'Cancel').click()

    cy.contains('Burton Custom X').should('be.visible')
  })

  it('full flow: list → detail → create → edit → delete', () => {
    // 1. Open detail
    cy.contains('Jones Frontier').click()
    cy.contains('Freeride board for powder').should('be.visible')
    cy.get('body').type('{esc}') // Close sidepanel

    // 2. Create new item
    cy.contains('button', 'Add').click()
    cy.get('#title').type('Full Flow Board')
    cy.get('#brand').type('FlowBrand')
    cy.get('#shape').type('Directional')
    cy.get('#price').clear().type('399')
    cy.get('#discount').clear().type('5')
    cy.get('#stock').clear().type('10')
    cy.get('#sizes').type('152, 156, 160')
    cy.get('#stiffness').clear().type('6')
    cy.contains('button', 'Select styles').click()
    cy.contains('Freestyle').click()
    cy.contains('button', 'Create').click({ force: true })

    cy.contains('Full Flow Board').should('be.visible')

    // 3. Edit the new item
    cy.get('button[aria-label="Edit Full Flow Board"]').click({ force: true })
    cy.get('#title').clear().type('Full Flow Board Edited')
    cy.contains('button', 'Save').click({ force: true })
    cy.contains('Full Flow Board Edited').should('be.visible')

    // 4. Delete the edited item
    cy.get('button[aria-label="Delete Full Flow Board Edited"]').click({ force: true })
    cy.contains('button', 'Delete').click()
    cy.contains('Full Flow Board Edited').should('not.exist')
  })
})

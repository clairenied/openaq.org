// / <reference types="Cypress" />
import country from '../fixtures/country.json';

describe('The Country Page', () => {
  it('successfully loads', () => {
    cy.visit('/#/countries/CY');

    cy.get('header');
    cy.get('main');
    cy.get('footer');
    cy.get('h1');
  });

  it('displays header with all its content', () => {
    cy.get('[data-cy=country-header').should('exist');
    cy.get('[data-cy=country-header-subtitle').contains('Country');
    cy.get('[data-cy=country-header-title').contains('Cyprus');

    cy.get('[data-cy=country-stats').should('exist');
    cy.get('[data-cy=country-stats-areas').should('exist');
    cy.get('[data-cy=country-stats-locations').should('exist');
    cy.get('[data-cy=country-stats-measurements').should('exist');
    cy.get('[data-cy=country-stats-sources').should('exist');

    // tests that the link should open in a new tab
    cy.get('[data-cy=header-apidocs-btn').should(
      'have.attr',
      'target',
      '_blank'
    );

    cy.get('[data-cy=header-download-btn').contains('Download');
  });

  it('displays a map', () => {
    cy.get('[data-cy=loading-message').should('exist');
    // TODO: plug in fixture to display map
  });

  it('displays a displays region sections with cards', () => {
    cy.get('[data-cy=country-list').should('exist');
  });
});

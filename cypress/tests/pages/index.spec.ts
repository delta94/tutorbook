import user from '../fixtures/user.json';

describe('Landing page', () => {
  beforeEach(() => {
    cy.setup();
    cy.visit('/');
  });

  it('has collapsible banner', () => {
    cy.get('[data-cy=banner]')
      .should('be.visible')
      .and('contain', 'We stand with the black community.')
      .find('[role=button]')
      .click();
    cy.get('[data-cy=banner]').should('not.be.visible');
  });

  it('leads to search page', () => {
    cy.get('[data-cy=hero]').first().as('hero');
    cy.get('@hero')
      .find('[data-cy=title]')
      .should('have.text', 'Learn from and work with an expert.');
    cy.get('@hero').find('form > button').should('have.text', 'Search mentors');

    cy.get('header').contains('button', 'Tutors').click();

    cy.get('@hero')
      .find('[data-cy=title]')
      .should('have.text', 'Free tutoring amidst COVID-19.');
    cy.get('@hero').find('form > button').should('have.text', 'Search tutors');

    cy.contains('What would you like to learn?').type('Computer');
    cy.contains('Computer Science').click({ force: true });
    cy.get('@hero').find('form > button').click();

    // TODO: Find way to make Cypress wait for Next.js to emit the "client-side
    // page transition complete" signal (e.g. when the nprogress bar is hidden).
    cy.url({ timeout: 60000 }).should('contain', '/default/search');

    // cy.get('header')
    // .contains('button', 'Tutors')
    // .should('have.attr', 'aria-selected', true);
  });

  it('shows featured users carousel', () => {
    cy.get('[data-cy=carousel]').first().as('carousel');

    cy.get('@carousel').find('[data-cy=loading-card]').should('not.exist');

    cy.get('@carousel').find('[data-cy=user-card]').first().as('card');

    cy.get('@card').find('[data-cy=name]').should('have.text', user.username);
    cy.get('@card').find('[data-cy=bio]').should('have.text', user.bio);
    cy.get('@card').find('img').should('have.attr', 'src', user.photo);

    // TODO: Remove this `click()` workaround b/c that's a bug in our front-end.
    // cy.get('@carousel').find('button:visible').click();
    // cy.get('@carousel').find('button').should('not.be.visible');
  });
});
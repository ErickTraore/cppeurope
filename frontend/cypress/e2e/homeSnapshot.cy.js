describe('Home snapshot', () => {
  it('capture le snapshot visuel et HTML de la page home', () => {
    cy.visit('/#home');
    cy.get('.home', { timeout: 15000 }).should('be.visible');
    cy.contains('Choisir une image').should('be.visible');

    cy.wait(1200);
    cy.screenshot('home-snapshot', { capture: 'fullPage' });
    cy.get('.home').screenshot('home-snapshot-content');

    cy.document().then((doc) => {
      cy.writeFile('cypress/snapshots/home-snapshot.html', doc.documentElement.outerHTML);
    });
  });
});
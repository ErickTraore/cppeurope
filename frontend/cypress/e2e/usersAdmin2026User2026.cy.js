/**
 * Test E2E : présence des utilisateurs admin2026@cppeurope.net et user2026@cppeurope.net.
 * Connexion en admin, puis appel API GET /api/users/all/ pour vérifier que les deux comptes existent.
 */
describe('utilisateurs admin2026 et user2026', () => {
  const adminEmail = 'admin2026@cppeurope.net';
  const adminPassword = 'admin2026!';
  const userEmail = 'user2026@cppeurope.net';

  it('admin2026 et user2026 sont présents dans la liste des utilisateurs (API admin)', () => {
    cy.visit('/');
    cy.get('input[type="email"][placeholder="Email"]').clear().type(adminEmail);
    cy.get('input[type="password"][placeholder="Mot de passe"]').clear().type(adminPassword);
    cy.get('button.auth-submit').contains('Se connecter').click();

    cy.get('div.App.authenticated', { timeout: 15000 }).should('exist');

    cy.window().invoke('localStorage.getItem', 'accessToken').then((token) => {
      expect(token).to.be.a('string');
      cy.request({
        method: 'GET',
        url: `${Cypress.config('baseUrl')}/api/users/all/`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        expect(res.status).to.eq(200);
        const users = Array.isArray(res.body) ? res.body : [];
        const emails = users.map((u) => u.email);
        expect(emails).to.include(adminEmail);
        expect(emails).to.include(userEmail);
      });
    });
  });
});

/**
 * Test E2E : présence des 4 avatars (slots) dans ProfilePage > Mes images
 * après création d'un utilisateur (à l'inscription, 4 slots sont attribués).
 *
 * Lancer le test :
 *   npm run cypress:run -- --spec "cypress/e2e/profilePageImagesAvatars.cy.js"
 * ou :
 *   npx cypress run --spec "cypress/e2e/profilePageImagesAvatars.cy.js"
 */
describe('ProfilePage - Mes images : avatars à la création du user', () => {
  const baseUrl = Cypress.config('baseUrl');
  const registerUrl = `${baseUrl}/api/users/register/`;
  let userEmail;
  const userPassword = 'Test1234';

  before(() => {
    userEmail = `e2e-avatars-${Date.now()}@cppeurope.net`;
  });

  it('crée un utilisateur via API (profil + 4 slots créés côté backend)', () => {
    cy.request({
      method: 'POST',
      url: registerUrl,
      headers: { 'Content-Type': 'application/json' },
      body: {
        email: userEmail,
        password: userPassword,
        isAdmin: false,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.have.property('userId');
      expect(res.body).not.to.have.property('error');
    });
  });

  it('se connecte puis ouvre ProfilePage > Mes images et vérifie les 4 avatars', () => {
    cy.visit('/');
    cy.get('input[type="email"][placeholder="Email"]').clear().type(userEmail);
    cy.get('input[type="password"][placeholder="Mot de passe"]').clear().type(userPassword);
    cy.get('button.auth-submit').contains('Se connecter').click();
    cy.get('div.App.authenticated', { timeout: 15000 }).should('exist');

    // Si la modale "session va expirer" s'affiche, cliquer sur Prolonger
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="prolonger-session"]').length) {
        cy.get('[data-testid="prolonger-session"]').click();
      }
    });

    // Aller sur la page Profil (hash ou menu)
    cy.visit('/#profilepage');
    cy.get('.profile-page', { timeout: 10000 }).should('exist');
    cy.get('h3').should('contain', 'Mon profil');

    // Onglet "Mes images"
    cy.contains('button', 'Mes images').click();
    cy.get('.images__container').should('exist');

    // Attendre que les 4 slots soient chargés (pas "Aucune image disponible")
    cy.get('.images__container__grid', { timeout: 20000 }).should('exist');
    cy.get('.images__container__grid__card', { timeout: 20000 }).should('have.length', 4);

    // Ne doit pas afficher "Aucune image disponible"
    cy.get('.images__container').should('not.contain', 'Aucune image disponible.');

    // Chaque carte contient une image et une zone d'upload
    cy.get('.images__container__grid__card').each(($card) => {
      cy.wrap($card).find('img.profile-image').should('exist');
      cy.wrap($card).find('.images__container__grid__card__upload input[type="file"]').should('exist');
    });
  });
});

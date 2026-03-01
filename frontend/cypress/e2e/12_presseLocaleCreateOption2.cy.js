/**
 * Presse Locale - Create option 2 (titre + contenu + photo).
 * Même rigueur que option-1 : API, Consulter (page + titre + photo + contenu), Gérer via API.
 */
describe('Presse Locale - Create (option 2: titre + contenu + photo)', () => {
  const adminEmail = 'admin2026@cppeurope.net';
  const adminPassword = 'admin2026!';
  const contenu = 'E2E Contenu article avec photo (fixture car-1).';
  const titreRemplace = `titre remplacé Option2 ${Date.now()}`;
  const contenuRemplace = "Votre texte a été remplacé pour des raisons d'optimisation.";
  const apiBase = () => Cypress.config('baseUrl') + '/api/presse-locale/messages/';
  const apiMessages = () => apiBase() + '?categ=presse-locale&siteKey=cppEurope';
  const imageFixture = 'cypress/fixtures/images/car-1.png';
  const imageFixture2 = 'cypress/fixtures/images/car-2.png';
  const waitForUpdatedTitle = (token, expectedTitle, remaining = 12) => {
    return cy.request({ method: 'GET', url: apiMessages(), headers: { Authorization: 'Bearer ' + token } }).then((res) => {
      expect(res.status).to.eq(200);
      const messages = Array.isArray(res.body) ? res.body : [];
      const found = messages.some((m) => m.title === expectedTitle);
      if (found) return;
      if (remaining <= 1) {
        throw new Error(`Titre mis à jour introuvable via API: ${expectedTitle}`);
      }
      return cy.wait(500).then(() => waitForUpdatedTitle(token, expectedTitle, remaining - 1));
    });
  };
  const ensureAuthenticated = () => {
    cy.get('body').then(($body) => {
      if ($body.find('input[type="email"][placeholder="Email"]').length) {
        cy.get('input[type="email"][placeholder="Email"]').clear().type(adminEmail);
        cy.get('input[type="password"][placeholder="Mot de passe"]').clear().type(adminPassword);
        cy.get('button.auth-submit').contains('Se connecter').click();
      }
    });
    cy.get('div.App.authenticated', { timeout: 60000 }).should('exist');
  };
  let titre;
  let createdMessage;
  before(() => { titre = 'E2E Option2 Presse Locale ' + Date.now(); });
  beforeEach(() => {
    cy.visit('/');
    cy.get('input[type="email"][placeholder="Email"]').clear().type(adminEmail);
    cy.get('input[type="password"][placeholder="Mot de passe"]').clear().type(adminPassword);
    cy.get('button.auth-submit').contains('Se connecter').click();
    cy.get('div.App.authenticated', { timeout: 15000 }).should('exist');
  });
  it('envoie article avec titre, contenu et photo et affiche succès', () => {
    cy.window().then((win) => { win.location.hash = 'admin-presse-locale'; });
    cy.get('div.App.authenticated', { timeout: 15000 }).should('exist');
    cy.get('#format').select('article-photo');
    cy.get('input[name="title"]').clear().type(titre);
    cy.get('textarea[name="content"]').clear().type(contenu);
    cy.get('input[type="file"][name="image"]').selectFile(imageFixture, { force: true });
    cy.get('button[type="submit"]').contains('Publier').click();
    cy.contains('Article publié avec succès', { timeout: 25000 }).should('be.visible');
  });
  it('vérifie en BDD via API messages et garde le message pour Gérer', () => {
    cy.window().invoke('localStorage.getItem', 'accessToken').then((token) => {
      cy.request({ method: 'GET', url: apiMessages(), headers: { Authorization: 'Bearer ' + token } }).then((res) => {
        expect(res.status).to.eq(200);
        const messages = Array.isArray(res.body) ? res.body : [];
        const found = messages.find((m) => m.title === titre);
        expect(found, 'message créé trouvé via API').to.exist;
        createdMessage = found;
      });
    });
  });
  it('en Consulter : page, titre, photo et contenu consultables', () => {
    cy.window().invoke('localStorage.getItem', 'accessToken').then((token) => {
      cy.request({ method: 'GET', url: apiMessages(), headers: { Authorization: 'Bearer ' + token } }).then((res) => {
        expect(res.status).to.eq(200);
        const messages = Array.isArray(res.body) ? res.body : [];
        expect(messages.some((m) => m.title === titre), 'message visible via API avant vérification UI').to.be.true;
      });
    });
    cy.window().then((win) => { win.location.hash = 'newpresse-locale'; });
    cy.get('div.App.authenticated', { timeout: 15000 }).should('exist');
    cy.get('.presse__container__title').should('contain', 'Presse Locale');
    cy.get('.presse__container__messagelist').should('exist');
    cy.get('.presse__message--image-only', { timeout: 25000 }).should('have.length.at.least', 1).first().within(() => {
      cy.get('.presse__message__media__img').should('be.visible');
      cy.get('.presse__message__textbar').click();
      cy.get('.presse__message__content').should('be.visible').invoke('text').should('match', /\S+/);
    });
  });
  it('met à jour le titre/contenu via API et valide l\'accès à Gérer sans régression', () => {
    expect(createdMessage, 'createdMessage défini par test précédent').to.exist;
    cy.window().invoke('localStorage.getItem', 'accessToken').then((token) => {
      cy.request({
        method: 'PUT',
        url: apiBase() + createdMessage.id,
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: { title: titreRemplace, content: contenuRemplace },
      }).then((updateRes) => {
        expect(updateRes.status).to.eq(200);
        return waitForUpdatedTitle(token, titreRemplace).then(() => {
          cy.visit('/#presse-locale');
          ensureAuthenticated();
          cy.window().then((win) => { win.location.hash = 'presse-locale'; });
          cy.contains('h1.admin-title', 'GESTION PRESSE LOCALE', { timeout: 15000 }).should('be.visible');
          cy.get('.messages-list, .no-messages', { timeout: 15000 }).should('exist');
        });
      });
    });
  });
});

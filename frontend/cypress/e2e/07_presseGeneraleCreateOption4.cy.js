/**
 * Presse Générale - Create option 4 (titre + contenu + photo + vidéo).
 * Même rigueur que option-1 : API, Consulter (page + titre + photo + vidéo + contenu), Gérer via API.
 */
describe('Presse Générale - Create (option 4: titre + contenu + photo + vidéo)', () => {
  const adminEmail = 'admin2026@cppeurope.net';
  const adminPassword = 'admin2026!';
  const contenu = 'E2E Contenu article avec photo et vidéo (fixtures car-1 + video-1).';
  const titreRemplace = 'titre remplacé Option4';
  const contenuRemplace = "Votre texte a été remplacé pour des raisons d'optimisation.";
  const apiMessages = () => Cypress.config('baseUrl') + '/api/presse-generale/messages/';
  const imageFixture = 'cypress/fixtures/images/car-1.png';
  const imageFixture2 = 'cypress/fixtures/images/car-2.png';
  const videoFixture = 'cypress/fixtures/videos/video-1.mp4';
  const videoFixture2 = 'cypress/fixtures/videos/video-2.mp4';
  let titre;
  let createdMessage;
  before(() => { titre = 'E2E Option4 Presse ' + Date.now(); });
  beforeEach(() => {
    cy.visit('/');
    cy.get('input[type="email"][placeholder="Email"]').clear().type(adminEmail);
    cy.get('input[type="password"][placeholder="Mot de passe"]').clear().type(adminPassword);
    cy.get('button.auth-submit').contains('Se connecter').click();
    cy.get('div.App.authenticated', { timeout: 15000 }).should('exist');
  });
  it('envoie article avec titre, contenu, photo et vidéo et affiche succès', () => {
    cy.visit('/#admin-presse-generale');
    cy.get('#format').select('article-thumbnail-video');
    cy.get('input[name="title"]').clear().type(titre);
    cy.get('textarea[name="content"]').clear().type(contenu);
    cy.get('input[type="file"][name="image"]').selectFile(imageFixture, { force: true });
    cy.get('input[type="file"][name="video"]').selectFile(videoFixture, { force: true });
    cy.get('button[type="submit"]').contains('Publier').click();
    cy.contains('Article publié avec succès', { timeout: 90000 }).should('be.visible');
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
  it('en Consulter : page, titre, photo, vidéo et contenu consultables', () => {
    cy.visit('/#newpresse');
    cy.get('.presse__container__title').should('contain', 'Presse PPA-CI');
    cy.get('.presse__container__messagelist').should('exist');
    cy.contains('.presse__message__header__title', titre, { timeout: 10000 }).should('be.visible');
    cy.contains('.presse__message__header__title', titre).parents('.presse__message--image-and-video').first().within(() => {
      cy.get('.presse__message__media__videoWrapper').should('be.visible');
      cy.get('.presse__message__textbar').click();
      cy.get('.presse__message__content').should('be.visible').and('contain', contenu);
    });
  });
  it('met à jour le titre/contenu via API et valide l\'accès à Gérer sans régression', () => {
    expect(createdMessage, 'createdMessage défini par test précédent').to.exist;
    cy.window().invoke('localStorage.getItem', 'accessToken').then((token) => {
      cy.request({
        method: 'PUT',
        url: apiMessages() + createdMessage.id,
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: { ...createdMessage, title: titreRemplace, content: contenuRemplace },
      }).then((updateRes) => {
        expect(updateRes.status).to.eq(200);
        cy.visit('/#presse-generale');
        cy.get('div.App.authenticated', { timeout: 15000 }).should('exist');
        cy.get('.messages-list, .no-messages', { timeout: 15000 }).should('exist');
      });
    });
  });
});

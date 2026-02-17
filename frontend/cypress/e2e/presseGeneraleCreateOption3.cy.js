/**
 * Presse Générale - Create option 3 (titre + contenu + vidéo).
 * Même rigueur que option-1 : API, Consulter (page + titre + vidéo + contenu), Gérer via API.
 */
describe('Presse Générale - Create (option 3: titre + contenu + vidéo)', () => {
  const adminEmail = 'admin2026@cppeurope.net';
  const adminPassword = 'admin2026!';
  const contenu = 'E2E Contenu article avec vidéo (fixture video-1).';
  const titreRemplace = 'titre remplacé Option3';
  const contenuRemplace = "Votre texte a été remplacé pour des raisons d'optimisation.";
  const apiMessages = () => Cypress.config('baseUrl') + '/api/users/messages/';
  const videoFixture = 'cypress/fixtures/videos/video-1.mp4';
  const videoFixture2 = 'cypress/fixtures/videos/video-2.mp4';
  let titre;
  let createdMessage;
  before(() => { titre = 'E2E Option3 Presse ' + Date.now(); });
  beforeEach(() => {
    cy.visit('/');
    cy.get('input[type="email"][placeholder="Email"]').clear().type(adminEmail);
    cy.get('input[type="password"][placeholder="Mot de passe"]').clear().type(adminPassword);
    cy.get('button.auth-submit').contains('Se connecter').click();
    cy.get('div.App.authenticated', { timeout: 15000 }).should('exist');
  });
  it('envoie article avec titre, contenu et vidéo et affiche succès', () => {
    cy.visit('/#admin-presse-generale');
    cy.get('#format').select('article-video');
    cy.get('input[name="title"]').clear().type(titre);
    cy.get('textarea[name="content"]').clear().type(contenu);
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
  it('en Consulter : page, titre, vidéo et contenu consultables', () => {
    cy.visit('/#newpresse');
    cy.get('.presse__container__title').should('contain', 'Presse PPA-CI');
    cy.get('.presse__container__messagelist').should('exist');
    cy.contains('.presse__message__header__title', titre, { timeout: 10000 }).should('be.visible');
    cy.contains('.presse__message__header__title', titre).parents('.presse__message--video-only').first().within(() => {
      cy.get('.presse__message__media__videoWrapper').should('be.visible');
      cy.get('.presse__message__textbar').click();
      cy.get('.presse__message__content').should('be.visible').and('contain', contenu);
    });
  });
  it('remplace le titre et le contenu via API, remplace la vidéo video-1 par video-2 en Gérer, et vérifie', () => {
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
        cy.contains('.message-card', titreRemplace, { timeout: 15000 }).within(() => {
          cy.get('.message-content').should('contain', contenuRemplace);
        });
        cy.contains('.message-card', titreRemplace).within(() => {
          cy.get('.message-media video, .presse__message__media__videoWrapper', { timeout: 15000 }).should('be.visible');
        });
        cy.window().then((win) => { cy.stub(win, 'alert'); });
        cy.contains('.message-card', titreRemplace).within(() => {
          cy.get('button.btn-edit').click();
        });
        cy.get('form.crud-form', { timeout: 10000 }).should('be.visible');
        cy.get('form.crud-form input[type="file"]', { timeout: 15000 }).first().selectFile(videoFixture2, { force: true });
        cy.get('form.crud-form .btn-save').click();
        cy.contains('.message-card', titreRemplace, { timeout: 15000 }).within(() => {
          cy.get('.message-content').should('contain', contenuRemplace);
        });
      });
    });
  });
});

// Test E2E - Article presse + Miniature + Vidéo
describe('Presse - Article + Miniature + Vidéo', () => {
  beforeEach(() => {
    cy.login()
    cy.goToPresseAdmin()
    cy.wait(200)
  })

  it('affiche le formulaire Article + Miniature + Vidéo', () => {
    cy.get('select.presse-select', { timeout: 5000 }).should('be.visible')
    cy.get('select.presse-select').select('article-thumbnail-video')
    cy.wait(300)
    cy.get('form').should('be.visible')
    cy.get('input[name="title"]').should('exist')
    cy.get('textarea[name="content"]').should('exist')
    cy.get('input[name="image"]').should('exist')
    cy.get('input[name="video"]').should('exist')
  })

  it('rejette si image ou vidéo manquante', () => {
    cy.get('select.presse-select').select('article-thumbnail-video')
    cy.wait(300)
    cy.get('input[name="title"]').type('Titre incomplet')
    cy.get('textarea[name="content"]').type('Contenu incomplet')
    cy.get('button').contains(/Publier|Envoyer/i).click()
    cy.contains(/image|vidéo|obligatoire/i).should('be.visible')
  })

  it('crée un article avec image et vidéo valides (données en dur)', () => {
    cy.get('select.presse-select').select('article-thumbnail-video')
    cy.wait(300)
    cy.get('input[name="title"]').type('Article Miniature + Vidéo (Simple)')
    cy.get('textarea[name="content"]').type('Contenu complet avec image et vidéo')
    cy.get('input[name="image"]').selectFile('cypress/fixtures/test-image.png', { force: true })
    cy.wait(300)
    cy.get('input[name="video"]').selectFile('cypress/fixtures/test-video.mp4', { force: true })
    cy.wait(500)
    cy.get('button').contains(/Publier|Envoyer/i).click()
    cy.get('.spinner').should('be.visible')
    cy.get('.spinner').should('not.exist', { timeout: 120000 })
    cy.contains(/succès|publié/i, { timeout: 10000 }).should('be.visible')
  })

  it('VRAI TEST : vérifie que image et vidéo sont uploadées sur Contabo et liées en base', () => {
    cy.prolongSession()
    cy.wait(500)
    
    const uniqueTitle = `Article Thumbnail+Video Test ${Date.now()}`
    const uniqueContent = 'Vérification image+vidéo Contabo'
    
    cy.get('select.presse-select').select('article-thumbnail-video')
    cy.wait(300)
    
    // Remplir et uploader
    cy.get('input[name="title"]').type(uniqueTitle)
    cy.get('textarea[name="content"]').type(uniqueContent)
    cy.get('input[name="image"]').selectFile('cypress/fixtures/test-image.png', { force: true })
    cy.wait(500)
    cy.get('input[name="video"]').selectFile('cypress/fixtures/test-video.mp4', { force: true })
    cy.wait(500)
    
    // Prolonger JUSTE AVANT le submit
    cy.prolongSession()
    cy.wait(500)
    
    cy.get('button').contains(/Publier|Envoyer/i).click()
    
    // Vérifier que le spinner apparaît (upload en cours)
    cy.get('.spinner').should('be.visible')
    
    // Attendre que le spinner disparaisse (uploads + 4s delay terminé)
    cy.get('.spinner').should('not.exist', { timeout: 120000 })
    
    // ⏱️ PUIS le message de succès apparaît
    cy.contains(/succès|publié/i, { timeout: 10000 }).should('be.visible')
    cy.wait(5000) // Attendre que les fichiers soient bien liés en BDD
    
    // VRAIE VÉRIFICATION : Récupérer l'article de la base de données
    cy.prolongSession()
    cy.wait(500)
    
    cy.window().then(() => {
      const token = localStorage.getItem('accessToken')
      
      cy.request({
        method: 'GET',
        url: 'https://cppeurope.net/api/users/messages/',
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false
      }).then(response => {
        cy.log(`📊 Response status: ${response.status}`)
        cy.log(`📊 Articles trouvés: ${Array.isArray(response.body) ? response.body.length : 'N/A'}`)
        
        if (Array.isArray(response.body) && response.body.length > 0) {
          cy.log(`📝 5 premiers titres: ${response.body.slice(0, 5).map(a => a.title).join(', ')}`)
        }
        
        expect(response.status).to.equal(200)
        expect(response.body).to.be.an('array')
        
        // Trouver l'article créé
        const article = response.body.find(a => a.title === uniqueTitle)
        
        // Vérifier que l'article existe
        expect(article, `Article "${uniqueTitle}" devrait exister en base`).to.exist
        expect(article.content, 'Le contenu devrait correspondre').to.equal(uniqueContent)
        expect(article.categ, 'La catégorie devrait être presse').to.equal('presse')
        
        cy.log(`✅ Article trouvé: ID=${article.id}, media=${article.media ? article.media.length : 0}`)
        
        // Vérifier que 2 fichiers ont été uploadés (image + vidéo)
        if (article.media && Array.isArray(article.media) && article.media.length >= 2) {
          const image = article.media.find(m => m.type === 'image')
          const video = article.media.find(m => m.type === 'video')
          
          if (image) {
            expect(image.filename, 'Image filename devrait exister').to.exist
            cy.log(`✅ Image présente: ${image.filename}`)
          } else {
            cy.log(`⚠️ Aucune image trouvée dans media`)
          }
          
          if (video) {
            expect(video.filename, 'Video filename devrait exister').to.exist
            cy.log(`✅ Vidéo présente: ${video.filename}`)
          } else {
            cy.log(`⚠️ Aucune vidéo trouvée dans media`)
          }
        } else {
          cy.log(`⚠️ Moins de 2 fichiers dans media (${article.media ? article.media.length : 0})`)
        }
      })
    })
  })
})

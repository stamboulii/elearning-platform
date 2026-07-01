# E-Learning Platform - Documentation Complète

## 📋 Table des Matières
1. [Vue d'Ensemble](#vue-densemble)
2. [Stack Technologique](#stack-technologique)
3. [Architecture](#architecture)
4. [Modèles de Données (Prisma)](#modèles-de-données-prisma)
5. [Rôles Utilisateurs](#rôles-utilisateurs)
6. [Routes API Backend](#routes-api-backend)
7. [Services Backend](#services-backend)
8. [Pages Frontend](#pages-frontend)
9. [Fonctionnalités par Rôle](#fonctionnalités-par-rôle)
10. [Scénarios Métier](#scénarios-métier)
11. [Système de Paiement](#système-de-paiement)
12. [Gamification & Badges](#gamification--badges)
13. [Notifications](#notifications)
14. [Sécurité](#sécurité)

---

## 🎯 Vue d'Ensemble

Plateforme e-learning complète avec trois rôles : **Étudiant**, **Instructeur**, **Admin**.  
Permet la création de cours, l'inscription, le paiement en ligne, le suivi de progression, les quiz, les flashcards, les certifications et la gamification.

---

## 🛠 Stack Technologique

### Frontend
| Technologie | Usage |
|-------------|-------|
| React 19 | Framework UI |
| React Router v7 | Routing |
| Tailwind CSS 3.4 | Styles |
| Framer Motion 12 | Animations |
| Socket.io Client | Notifications temps réel |
| Stripe.js | Paiements |
| i18next | Internationalisation |
| Lucide React | Icônes |
| Recharts | Graphiques analytics |
| html2canvas + jsPDF | Génération certificats PDF |
| canvas-confetti | Animations gamification |

### Backend
| Technologie | Usage |
|-------------|-------|
| Node.js + Express 5 | Serveur API |
| Prisma 6 | ORM |
| PostgreSQL | Base de données |
| Socket.io | WebSocket notifications |
| Stripe SDK | Paiements |
| Groq SDK | IA (génération quiz descriptions) |
| Cloudinary | Stockage vidéos/images |
| Multer | Upload fichiers |
| Canvas | Génération images certificats |
| JWT + bcryptjs | Authentification |
| Helmet + Rate Limit | Sécurité |
| Swagger | Documentation API |
| Nodemailer | Emails |

---

## 🏗 Architecture

```
elearning-platform/
├── client/                    # Frontend React (Vite)
│   └── src/
│       ├── pages/            # Pages par rôle
│       │   ├── admin/
│       │   ├── instructor/
│       │   ├── student/
│       │   ├── auth/
│       │   └── *.jsx          # Pages communes
│       ├── components/       # Composants réutilisables
│       ├── services/         # Appels API + Socket.io
│       ├── hooks/            # Custom hooks (useAuth)
│       ├── context/          # Contexts (notifications, langue)
│       └── utils/            # Toast, helpers
│
└── server/                   # Backend Express
    └── src/
        ├── routes/           # 20 routeurs Express
        ├── controllers/      # Gestionnaires de requêtes
        ├── services/         # Logique métier
        ├── middleware/       # Auth, upload, validation
        ├── config/           # Database, upload, socket
        └── server.js         # Point d'entrée
```

---

## 🗄️ Modèles de Données (Prisma)

### User Management
| Modèle | Description |
|--------|-------------|
| `User` | Compte utilisateur (email, password, rôle, XP, level) |
| `UserProfile` | Profil étendu (téléphone, pays, bio, préférences) |

**Rôles** : `STUDENT` | `INSTRUCTOR` | `ADMIN`

### Course Management
| Modèle | Description |
|--------|-------------|
| `Category` | Catégories hiérarchiques (parent/enfant) |
| `Course` | Cours (titre, slug, prix, status, niveau, langue) |
| `CourseSection` | Sections/Modules d'un cours |
| `Lesson` | Leçons (VIDEO/TEXT/QUIZ/ASSIGNMENT/DOCUMENT) |

**Champs clés Course** :
- `price`, `discountPrice`, `isFree` — tarification
- `status` : `DRAFT` | `PUBLISHED` | `ARCHIVED`
- `level` : `BEGINNER` | `INTERMEDIATE` | `ADVANCED` | `ALL_LEVELS`

**Champs clés Lesson** :
- `contentType` : `VIDEO` | `TEXT` | `QUIZ` | `ASSIGNMENT` | `DOCUMENT`
- `isPreview` : accès gratuit pour tous (aperçu)
- `isFree` : leçon gratuite dans cours payant
- `duration` : en minutes

### Enrollment & Progress
| Modèle | Description |
|--------|-------------|
| `Enrollment` | Inscription étudiant (progression, statut, certificat) |
| `LessonProgress` | Progression par leçon (complété, temps visionné, position vidéo) |
| `StudySchedule` | Planning d'étude personnalisé |

**Champs clés Enrollment** :
- `progressPercentage` : 0-100%
- `completionStatus` : `IN_PROGRESS` | `COMPLETED`
- `isPaid` : paiement validé
- `certificateIssued` : certificat généré

### Payment & Transactions
| Modèle | Description |
|--------|-------------|
| `Transaction` | Transactions (montant, méthode, statut, référence) |
| `Coupon` | Codes promo (%, fixe, dates, limites) |
| `CouponUsage` | Historique d'utilisation des coupons |

**TransactionStatus** : `PENDING` | `COMPLETED` | `FAILED` | `REFUNDED`  
**DiscountType** : `PERCENTAGE` | `FIXED`

### Shopping
| Modèle | Description |
|--------|-------------|
| `CartItem` | Panier (userId + courseId unique) |
| `Wishlist` | Favoris (userId + courseId unique) |

### Reviews & Ratings
| Modèle | Description |
|--------|-------------|
| `Review` | Avis étudiants (note 1-5, texte, approuvé) |
| `ReviewResponse` | Réponse de l'instructeur |

### Quizzes & Assessments
| Modèle | Description |
|--------|-------------|
| `Quiz` | Quiz par leçon (score passing, limite temps, tentatives) |
| `QuizQuestion` | Questions (MCQ/VraiFaux/Paris, options, points) |
| `QuizAttempt` | Tentatives étudiant (score, réussi, dates) |
| `QuizAnswer` | Réponses détaillées par question |

**QuestionType** : `MULTIPLE_CHOICE` | `TRUE_FALSE` | `SHORT_ANSWER`

### Certificates
| Modèle | Description |
|--------|-------------|
| `Certificate` | Certificat PDF (numéro unique, URL image) |

### Discussions
| Modèle | Description |
|--------|-------------|
| `Discussion` | Forum par cours/leçon |
| `DiscussionReply` | Réponses forum |

### Gamification
| Modèle | Description |
|--------|-------------|
| `Badge` | Badges (nom, description, icône, critère) |
| `UserBadge` | Badges attribués aux utilisateurs |

### Notifications
| Modèle | Description |
|--------|-------------|
| `Notification` | Notifications (type, titre, message, lu/non lu) |

**NotificationType** : `ENROLLMENT` | `PAYMENT` | `REVIEW` | `DISCUSSION` | `CERTIFICATE` | `COURSE_PUBLISHED` | `QUIZ_RESULT` | `WISHLIST_UPDATE` | `SYSTEM` | `OTHER`

### Flashcards
| Modèle | Description |
|--------|-------------|
| `FlashcardDeck` | Deck par leçon |
| `Flashcard` | Cartes (recto/verso) |

---

## 👥 Rôles Utilisateurs

### STUDENT
- **Inscription/Connexion** : email/password, inscription publique
- **Catalogue** : parcourir, filtrer, rechercher cours
- **Panier & Favoris** : ajouter/retirer cours
- **Paiement** : Stripe + coupons promo
- **Accès cours** : vidéos, textes, quiz, documents, flashcards
- **Progression** : marquer leçons complètes, suivi pourcentage
- **Quiz** : passer quiz (respecter 90% vidéo requis)
- **Certificats** : obtention auto à 100% progression
- **Avis** : noter et commenter les cours
- **Forum** : discussions par cours/leçon
- **Gamification** : XP, niveaux, badges
- **Notifications** : temps réel via WebSocket

### INSTRUCTOR
- **Dashboard** : analytics (revenus, étudiants, progression)
- **Création cours** : sections + leçons (VIDEO/TEXT/QUIZ/DOCUMENT)
- **Gestion cours** : modifier, publier, archiver
- **Preview/Free** : marquer leçons aperçu/gratuites
- **Quiz IA** : génération automatique via Groq
- **Flashcards IA** : génération automatique
- **Réponses avis** : répondre aux reviews étudiants
- **Statistiques** : vue détaillée par cours

### ADMIN
- **Dashboard** : vue globale plateforme
- **Utilisateurs** : gestion comptes (activer/désactiver)
- **Catégories** : CRUD complet + hiérarchie
- **Transactions** : suivi tous les paiements
- **Coupons** : création/gestion codes promo
- **Inscriptions** : vue toutes les enrollments
- **Modération** : approuver/rejeter avis, contenu
- **Système** : paramètres plateforme

---

## 🔌 Routes API Backend

### Auth (`/api/auth`)
| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| POST | `/register` | Public | Inscription |
| POST | `/login` | Public | Connexion JWT |
| POST | `/logout` | Privé | Déconnexion |
| GET | `/me` | Privé | Profil utilisateur |
| PUT | `/profile` | Privé | Mettre à jour profil |

### Users (`/api/users`)
| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| GET | `/` | Admin | Liste utilisateurs |
| GET | `/:id` | Privé | Détail utilisateur |
| PUT | `/:id` | Privé | Modifier utilisateur |
| DELETE | `/:id` | Admin | Supprimer utilisateur |

### Courses (`/api/courses`)
| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| GET | `/` | Public | Catalogue (avec filtres) |
| GET | `/:id` | Public | Détail cours |
| GET | `/instructor/me` | Instructeur | Mes cours |
| POST | `/` | Instructeur | Créer cours |
| PUT | `/:id` | Instructeur | Modifier cours |
| PATCH | `/:id/archive` | Instructeur | Archiver cours |
| DELETE | `/:id` | Instructeur | Supprimer cours |
| POST | `/:id/requirements` | Instructeur | Ajouter prérequis |
| POST | `/:id/outcomes` | Instructeur | Ajouter objectifs |
| POST | `/generate-description` | Instructeur | IA description cours |

### Sections (`/api/sections/:courseId/sections`)
| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| POST | `/` | Instructeur | Créer section |
| PUT | `/:id` | Instructeur | Modifier section |
| DELETE | `/:id` | Instructeur | Supprimer section |
| PUT | `/:id/reorder` | Instructeur | Réordonner sections |

### Lessons (`/api/lessons`)
| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| POST | `/sections/:sectionId/lessons` | Instructeur | Créer leçon |
| GET | `/sections/:sectionId/lessons` | Public | Leçons d'une section |
| GET | `/:id` | Public | Détail leçon |
| PUT | `/:id` | Instructeur | Modifier leçon |
| DELETE | `/:id` | Instructeur | Supprimer leçon |
| PUT | `/sections/:sectionId/lessons/reorder` | Instructeur | Réordonner leçons |

### Quizzes (`/api/quizzes`)
| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| POST | `/generate/:lessonId` | Instructeur | Générer quiz IA |
| POST | `/manual/:lessonId` | Instructeur | Créer quiz manuel |
| GET | `/lesson/:lessonId` | Public | Quiz d'une leçon |
| PUT | `/:id` | Instructeur | Modifier quiz |
| DELETE | `/:id` | Instructeur | Supprimer quiz |
| POST | `/:id/attempts` | Étudiant | Soumettre tentative |
| GET | `/attempts/:quizId` | Étudiant | Mes tentatives |
| GET | `/:id/attempts/:attemptId` | Privé | Détail tentative |

### Progress (`/api/progress`)
| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| POST | `/lessons/:lessonId/complete` | Étudiant | Marquer leçon terminée |
| GET | `/lessons/:lessonId` | Étudiant | Progression leçon |
| GET | `/enrollments/:enrollmentId` | Étudiant | Progression cours |
| PUT | `/lessons/:lessonId/video` | Étudiant | Mettre à jour vidéo |
| POST | `/lessons/:lessonId/reset` | Étudiant | Réinitialiser progression |

### Enrollments (`/api/enrollments`)
| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| POST | `/courses/:courseId/enroll` | Étudiant | S'inscrire |
| GET | `/my` | Étudiant | Mes inscriptions |
| GET | `/courses/:courseId/status` | Public | Statut inscription |
| GET | `/:id` | Étudiant | Détail inscription |
| PUT | `/:id/progress` | Étudiant | Mettre à jour progression |

### Certificates (`/api/certificates`)
| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| GET | `/enrollment/:enrollmentId` | Étudiant | Certificat par inscription |
| GET | `/my` | Étudiant | Mes certificats |
| GET | `/:id` | Privé | Détail certificat |

### Categories (`/api/categories`)
| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| GET | `/` | Public | Toutes catégories |
| GET | `/:id` | Public | Détail catégorie |
| POST | `/` | Admin | Créer catégorie |
| PUT | `/:id` | Admin | Modifier catégorie |
| DELETE | `/:id` | Admin | Supprimer catégorie |

### Transactions (`/api/transactions`)
| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| POST | `/create-payment-intent` | Étudiant | Créer intention paiement |
| POST | `/webhook` | Stripe | Webhook Stripe |
| GET | `/my` | Étudiant | Mes transactions |
| GET | `/` | Admin | Toutes transactions |
| GET | `/:id` | Privé | Détail transaction |

### Coupons (`/api/coupons`)
| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| POST | `/validate` | Public | Valider code promo |
| POST | `/apply` | Étudiant | Appliquer coupon |
| GET | `/` | Admin | Tous coupons |
| POST | `/` | Admin | Créer coupon |
| PUT | `/:id` | Admin | Modifier coupon |
| DELETE | `/:id` | Admin | Supprimer coupon |

### Cart (`/api/cart`)
| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| GET | `/` | Étudiant | Mon panier |
| POST | `/add` | Étudiant | Ajouter au panier |
| DELETE | `/remove/:courseId` | Étudiant | Retirer du panier |
| DELETE | `/clear` | Étudiant | Vider panier |

### Wishlist (`/api/wishlist`)
| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| GET | `/` | Étudiant | Ma wishlist |
| POST | `/add/:courseId` | Étudiant | Ajouter |
| DELETE | `/remove/:courseId` | Étudiant | Retirer |

### Notifications (`/api/notifications`)
| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| GET | `/` | Privé | Mes notifications |
| PATCH | `/:id/read` | Privé | Marquer lu |
| GET | `/unread-count` | Privé | Non lues |

### Study Schedule (`/api/study-schedule`)
| Méthène | Route | Accès | Description |
|---------|-------|-------|-------------|
| POST | `/` | Étudiant | Créer planning |
| GET | `/my` | Étudiant | Mon planning |
| PUT | `/:id` | Étudiant | Modifier planning |
| DELETE | `/:id` | Étudiant | Supprimer planning |

### Admin (`/api/admin`)
| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| GET | `/stats` | Admin | Statistiques globales |
| GET | `/users` | Admin | Gestion utilisateurs |
| PUT | `/users/:id` | Admin | Modifier utilisateur |
| DELETE | `/users/:id` | Admin | Supprimer utilisateur |

### Instructor Analytics (`/api/instructor/analytics`)
| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| GET | `/dashboard` | Instructeur | Stats dashboard |
| GET | `/courses/:id` | Instructeur | Stats par cours |
| GET | `/revenue` | Instructeur | Revenus |

### Upload (`/api/upload`)
| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| POST | `/course/:courseId/thumbnail` | Instructeur | Upload miniature |
| POST | `/course/:courseId/preview-video` | Instructeur | Upload vidéo preview |
| POST | `/lesson/:lessonId/video` | Instructeur | Upload vidéo leçon |
| POST | `/lesson/:lessonId/resources` | Instructeur | Upload documents |

---

## 🔧 Services Backend

| Service | Responsabilité |
|---------|---------------|
| `authService` | Inscription, login, JWT, reset password |
| `userService` | CRUD utilisateurs, profil |
| `categoryService` | CRUD catégories hiérarchiques |
| `courseService` | CRUD cours, pricing, accès, archive |
| `sectionService` | CRUD sections, réordonnancement |
| `lessonService` | CRUD leçons, vidéo/doc/quiz, accès preview/free |
| `quizService` | CRUD quiz, questions, tentatives |
| `enrollmentService` | Inscriptions, progression, accès cours |
| `progressService` | Marquage leçons, tracking vidéo, calcul progression |
| `certificateService` | Génération certificats PDF/image |
| `transactionService` | Paiements, Stripe, historique |
| `couponService` | Codes promo, validation, usage |
| `cartService` | Panier shopping |
| `wishlistService` | Favoris |
| `notificationService` | Création notifications, WebSocket |
| `gamificationService` | XP, niveaux, badges automatiques |
| `flashcardService` | CRUD decks + cartes |
| `uploadService` | Cloudinary upload (vidéos, images) |
| `groqService` | IA : génération descriptions quiz |
| `adminService` | Stats globales, gestion users |
| `stripeService` | Webhooks, confirmation paiement |

---

## 📄 Pages Frontend

### Pages Publiques
| Page | Route | Description |
|------|-------|-------------|
| `Home.jsx` | `/` | Page d'accueil |
| `CourseDetail.jsx` | `/courses/:id` | Détail cours (étudiant) |
| `CourseCatalog.jsx` | `/courses` | Catalogue public |
| `Login.jsx` | `/login` | Connexion |
| `Register.jsx` | `/register` | Inscription |

### Pages Étudiant
| Page | Route | Description |
|------|-------|-------------|
| `Dashboard.jsx` | `/student/dashboard` | Dashboard étudiant |
| `MyCourses.jsx` | `/student/courses` | Mes cours inscrits |
| `CoursePlayer.jsx` | `/courses/:id/learn` | Lecteur de cours |
| `CertificateView.jsx` | `/student/certificates/:id` | Vue certificat |
| `CertificateButton.jsx` | — | Bouton téléchargement certificat |
| `StudentEnrollments.jsx` | — | Gestion inscriptions |
| `Checkout.jsx` | `/checkout/:courseId` | Paiement |
| `WishlistPage.jsx` | `/wishlist` | Favoris |
| `CartPage.jsx` | `/cart` | Panier |
| `Notifications.jsx` | `/notifications` | Notifications |

### Pages Instructeur
| Page | Route | Description |
|------|-------|-------------|
| `Dashboard.jsx` | `/instructor/dashboard` | Dashboard instructeur |
| `MyCourses.jsx` | `/instructor/courses` | Mes cours |
| `CourseDetail.jsx` | `/instructor/courses/:id` | Détail + analytics |
| `CourseBuilder.jsx` | `/instructor/courses/:id/builder` | Éditeur cours (sections/leçons) |
| `CreateCourse.jsx` | `/instructor/courses/create` | Créer nouveau cours |
| `EditCourse.jsx` | `/instructor/courses/:id/edit` | Modifier infos cours |
| `InstructorCourseStats.jsx` | `/instructor/courses/:id/stats` | Stats détaillées |

### Pages Admin
| Page | Route | Description |
|------|-------|-------------|
| `Dashboard.jsx` | `/admin/dashboard` | Dashboard admin |
| `Users.jsx` | `/admin/users` | Gestion utilisateurs |
| `Courses.jsx` | `/admin/courses` | Gestion cours |
| `Categories.jsx` | `/admin/categories` | Gestion catégories |
| `CouponManager.jsx` | `/admin/coupons` | Gestion coupons |
| `Enrollments.jsx` | `/admin/enrollments` | Vue inscriptions |
| `TransactionManager.jsx` | `/admin/transactions` | Vue transactions |
| `Settings.jsx` | `/admin/settings` | Paramètres |

### Pages Communes
| Page | Route | Description |
|------|-------|-------------|
| `Profile.jsx` | `/profile` | Profil utilisateur |
| `CheckoutPage.jsx` | `/checkout` | Page paiement complète |
| `PaymentSuccessPage.jsx` | `/payment/success` | Confirmation paiement |
| `PaymentCancelPage.jsx` | `/payment/cancel` | Annulation paiement |

### Composants
| Composant | Usage |
|-----------|-------|
| `ConfirmModal.jsx` | Modale confirmation (supprimer, archiver) |
| `Avatar.jsx` | Avatar utilisateur |
| `ProtectedRoute.jsx` | Guard authentification + rôle |
| `QuizPlayer.jsx` | Lecteur quiz étudiant |

---

## 🎮 Fonctionnalités par Rôle

### Étudiant

#### Parcours Découverte
1. **Accueil** → héro + featured courses
2. **Catalogue** → recherche, filtres (catégorie, niveau, prix, note)
3. **Détail cours** → description, sections, aperçu, prix, avis
4. **Panier** → ajouter, modifier quantités, checkout
5. **Wishlist** → sauvegarder cours pour plus tard
6. **Inscription** → gratuite directe OU payée via Stripe

#### Apprentissage
1. **Lecteur de cours** → vidéo fullscreen, contenu texte, quiz, flashcards
2. **Progression** → sauvegarde automatique position vidéo, temps visionné
3. **Marquer complété** → validation 90% vidéo + quiz réussi
4. **Quiz** : soumission, score, feedback immédiat
5. **Flashcards** : révision cartes mémoire
6. **Forum** : poser questions, répondre
7. **Planning** : définir objectif d'étude, heures/jour
8. **Certificat** : génération auto à 100% progression

#### Communauté
1. **Avis** : noter + commenter les cours suivis
2. **Notifications** : réponses instructeur, nouveaux cours, badges

#### Gamification
1. **XP** : 50 XP par leçon, 500 XP par cours complet
2. **Niveaux** : progression automatique
3. **Badges** : achievements débloqués
4. **Confetti** : célébration accomplishments

### Instructeur

#### Gestion Cours
1. **Créer cours** : titre, catégorie, niveau, prix, slug, descriptions
2. **Éditer infos** : titre, miniature, descriptions, prix, discount
3. **Archiver** : masquer cours étudiants
4. **Publier** : soumettre pour révision/admin

#### Construction Contenu
1. **Sections** : créer, éditer, supprimer, réordonner
2. **Leçons** : 
   - Types : VIDEO, TEXT, QUIZ, ASSIGNMENT, DOCUMENT
   - Upload vidéo (jusqu'à 500MB)
   - Upload documents PDF
   - Rédaction contenu texte riche
   - Création quiz manuel (questions, options, points)
   - Génération quiz IA (Groq)
   - Génération flashcards IA
3. **Preview** : marquer leçons comme aperçu gratuit
4. **Free** : marquer leçons gratuites dans cours payant

#### Analytics
1. **Dashboard** : revenus, étudiants, complétion
2. **Stats cours** : progression étudiants, taux complétion
3. **Avis** : répondre aux reviews
4. **Revenus** : suivi transactions, coupons utilisés

### Admin

#### Gestion Plateforme
1. **Utilisateurs** : lister, modifier, activer/désactiver, supprimer
2. **Catégories** : CRUD hiérarchique (parent/enfant)
3. **Transactions** : vue globale tous les paiements
4. **Coupons** : créer, modifier, désactiver codes promo
5. **Inscriptions** : vue toutes les enrollments
6. **Modération avis** : approuver/rejeter reviews
7. **Statistiques** : croissance, revenus, utilisateurs actifs

---

## 🔄 Scénarios Métier Détaillés

### Scénario 1 : Inscription & Achat Cours

```
1. Visiteur → Browse catalogue
2. Sélectionne cours payant (€49.99)
3. Ajoute au panier OU achète direct
4. S'inscrit (compte STUDENT)
5. Checkout → Stripe
   - Si coupon : validation + application réduction
   - Création intention paiement
6. Paiement réussi → Webhook Stripe
   - Transaction créée (COMPLETED)
   - Enrollment créée (isPaid=true)
   - Notification à l'instructeur
   - Confirmation email
7. Accès cours débloqué
```

### Scénario 2 : Cours Gratuit

```
1. Instructeur crée cours, coche "isFree"
2. Publie cours
3. Visiteur → voit cours gratuit
4. S'inscrit → Enrollment direct (pas de paiement)
5. Accès immédiat à toutes les leçons
```

### Scénario 3 : Leçon Aperçu (Preview)

```
1. Instructeur cours payant
2. Marque 2-3 leçons comme "preview"
3. Visiteur non-inscrit → voit seulement leçons preview
4. Clique "S'inscrire" pour accès complet
5. Après achat → toutes les leçons débloquées
```

### Scénario 4 : Complétion Cours & Certificat

```
1. Étudiant suit les leçons
2. Pour chaque vidéo : tracking temps (timeSpent)
3. Bouton "Mark as Complete" :
   - VIDEO → requis 90% visionné (serveur vérifie timeSpent)
   - QUIZ → requis score >= passingScore
   - TEXT/DOC → requis temps lecture minimum
4. 100% leçons complétées → enrollment.status = COMPLETED
5. Auto-génération certificat :
   - Numéro unique CERT-{timestamp}-{uuid}
   - Image générée (Canvas + Cloudinary)
   - Notification étudiant
   - Badge "Course Completed" attribué
```

### Scénario 5 : Quiz avec Validation

```
1. Instructeur crée leçon QUIZ
2. Configure passing score (ex: 70%) + attemptsAllowed (ex: 3)
3. Étudiant accède au quiz
4. Soumet réponses → QuizAttempt créé
5. Scoring automatique :
   - MCQ/T/F : comparaison bonne réponse
   - Points gagnés = somme questions correctes
   - passed = score >= passingScore
6. Feedback immédiat : score, bonnes/mauvaises réponses
7. Si échec : peut réessayer (jusqu'à limite)
8. Si succès → peut marquer leçon complétée
```

### Scénario 6 : Génération IA Quiz

```
1. Instructeur crée leçon QUIZ
2. Clique "Generate AI Quiz" (bouton)
3. Appel Groq SDK :
   - Input : contenu vidéo/texte leçon
   - Output : 5-10 questions avec options
4. Quiz créé automatiquement
5. Instructeur peut éditer questions/options
```

### Scénario 7 : Paiement avec Coupon

```
1. Étudiant ajoute cours au panier
2. Checkout page
3. Entre code coupon → validation :
   - Vérifie existence + actif + dates valides
   - Vérifie usageLimit non atteint
   - Calcule réduction (% ou montant fixe)
4. Applique réduction au total
5. Stripe checkout (montant réduit)
6. Paiement réussi :
   - Transaction créée avec coupon applied
   - CouponUsage enregistré
   - Enrollment créée
```

### Scénario 8 : Notification Temps Réel

```
1. Événement métier → création notification (BD)
2. Socket.io émet à l'utilisateur :
   - Nouvelle inscription → instructeur notifié
   - Paiement réussi → étudiant confirmé
   - Avis publié → instructeur alerté
   - Cours publié → étudiants intéressés notifiés
   - Certificat émis → étudiant célébré
   - Badge obtenu → étudiant notifié
3. UI : badge compteur non-lu + dropdown notifications
```

### Scénario 9 : Inscription par Admin

```
1. Admin reçoit notification "Nouvelle catégorie demandée"
2. Vérifie `/admin/categories` 
3. Approuve → catégorie visible Instructeurs
4. OU crée directement (Admin bypass)
```

### Scénario 10 : Recherche & Filtres

```
1. Étudiant arrive sur catalogue
2. Filtres disponibles :
   - Catégorie (dropdown hiérarchique)
   - Niveau (Beginner/Intermediate/Advanced)
   - Prix (gratuit/payant)
   - Note minimum (étoiles)
   - Recherche texte (titre + description)
3. Tri : Popularité, Note, Prix, Récent, Titre
4. Pagination : 12 cours/page
```

---

## 💰 Système de Paiement

### Flux Complet
```
1. Étudiant sélectionne cours
2. → Cart + Checkout
3. Création PaymentIntent Stripe
4. Affichage formulaire carte Stripe
5. Paiement → Webhook Stripe
6. Vérification signature
7. Transaction mise à jour (COMPLETED)
8. Enrollment créée (isPaid=true)
9. Notification étudiants (si nouveau cours publié)
10. Invoice.email (Stripe)
```

### Gestion Prix Cours
- **Prix de base** : `course.price` (€)
- **Prix discount** : `course.discountPrice` (affiché barré)
- **Gratuit** : `course.isFree = true` (toutes leçons accessibles)
- **Pourcentage calculé** : `(price - discountPrice) / price * 100`

### Coupons
- **Type** : PERCENTAGE ou FIXED
- **Validité** : dates début/fin
- **Limite** : usageLimit (null = illimité)
- **Applicabilité** : tous cours ou sélection
- **Suivi** : CouponUsage (transaction, user, date)

---

## 🏆 Gamification & Badges

### Système XP
| Action | XP Gagné |
|--------|----------|
| Leçon complétée | +50 XP |
| Cours complété | +500 XP |
| Badge obtenu | Variable |

### Système de Niveaux
- XP cumulé détermine le niveau
- Seuils configurables par admin
- Affichage progression dans dashboard

### Badges (Model Badge)
| Champ | Description |
|-------|-------------|
| `name` | Nom unique (ex: "First Steps") |
| `description` | Texte explicatif |
| `icon` | Emoji ou URL image |
| `criteria` | Type achievement (ex: "FIRST_COURSE_COMPLETED") |
| `requirement` | Valeur seuil (ex: 5 pour 5 cours) |

**Badges standards suggérés** :
- 🎓 First Course Completed (1 cours)
- 📚 Scholar (5 cours)
- 🏆 Master (10 cours)
- ⭐ Review Master (10 avis)
- 🔥 7-Day Streak (7 jours consécutifs)
- 💯 Perfect Score (quiz 100%)

---

## 🔔 Notifications

### Types
| Type | Déclencheur | Destinataire |
|------|-------------|--------------|
| `ENROLLMENT` | Nouvelle inscription | Instructeur |
| `PAYMENT` | Paiement réussi | Étudiant |
| `REVIEW` | Nouvel avis publié | Instructeur |
| `DISCUSSION` | Nouvelle discussion/réponse | Participants |
| `CERTIFICATE` | Certificat émis | Étudiant |
| `COURSE_PUBLISHED` | Nouveau cours publié | Tous étudiants |
| `QUIZ_RESULT` | Résultat quiz | Étudiant |
| `WISHLIST_UPDATE` | Cours souhaité disponible | Étudiant |
| `SYSTEM` | Maintenance, annonces | Tous |
| `OTHER` | Divers | — |

### Delivery
- **WebSocket** : Socket.io (temps réel)
- **BD** : table Notification (persistance)
- **UI** : badge compteur + dropdown + toast

---

## 🔒 Sécurité

### Authentification
- JWT tokens (access + refresh)
- bcryptjs (hash password, rounds=10)
- Guards : `protect` middleware sur routes privées
- Vérification rôle : `authorize(ROLE1, ROLE2)`

### Autorisation
- Propriétaire cours = instructorId
- Admin bypass toutes restrictions
- Étudiant accède seulement ses propres données

### Protection
- Helmet.js : headers sécurité
- Rate Limiter : 100 req/15min par IP
- CORS : origins configurés
- Input validation : express-validator
- Upload sécurité : Multer + Cloudinary (jamais stockage local)
- Secrets : JWT_SECRET, STRIPE_KEY, CLOUDINARY vars

### Accès Cours
```
Instructor → Accès illimité à SES cours
Preview     → Accès sans inscription (tous)
Free course → Accès gratuit tous (inscrit ou visiteur)
Free lesson → Accès étudiant inscrit (cours payant)
Payant      → Accès seulement si isPaid=true
```

---

## 📊 Validation Contenu

### Vidéos
- **Upload max** : 500MB
- **Formats** : MP4, WebM, MOV
- **Progression** : tracking position + durée + temps total
- **Complétion** : 90% durée requise (backend enforce)

### Textes/Documents
- **Temps lecture minimum** : max(60s, duration × 30s)
- **Formats docs** : PDF, DOC, DOCX, PPT, PPTX, TXT

### Quiz
- **Tentatives limitées** : `attemptsAllowed` (défaut 3)
- **Score passing** : `passingScore` (défaut 80%)
- **Types questions** : MCQ, Vrai/Faux, Réponse courte
- **Points** : configurables par question

---

## 🌍 Internationalisation

- **Library** : i18next + react-i18next
- **Détection auto** : navigateur
- **Langues supportées** : FR, EN (extensible)
- **Clés** : préfixées par feature (`instructor.course_builder.*`, `student.course_player.*`)

---

## 🚀 Déploiement

### Scripts Disponibles
```bash
# Server
npm run start          # Production
npm run dev            # Dev avec nodemon
npm run prisma:migrate # Migrations BD
npm run prisma:seed    # Données initiales

# Client
npm run dev            # Vite dev server
npm run build          # Build production
npm run lint           # ESLint
```

### Variables d'Environnement Requises
```env
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=...
JWT_REFRESH_SECRET=...

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_PUBLISHABLE_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Groq IA
GROQ_API_KEY=...

# Email (Nodemailer)
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
```

---

## 🛣️ Roadmap & Améliorations Suggérées

### Court Terme
- [ ] Édition inline leçons (sans modal)
- [ ] Request Category (instructeur → admin)
- [ ] Recherche full-text PostgreSQL
- [ ] Notifications email (Nodemailer)
- [ ] Upload vidéo + transcodage automatique

### Moyen Terme
- [ ] Live streaming classes
- [ ] Assignments avec soumission fichiers
- [ ] Peer review système
- [ ] Chat en direct instructeur/étudiants
- [ ] Mobile app (React Native)

### Long Terme
- [ ] Certificats blockchain (NFT)
- [ ] Gamification avancée (leaderboards)
- [ ] IA tutor adaptatif
- [ ] Intégration Zoom/Teams
- [ ] Multi-devise internationale

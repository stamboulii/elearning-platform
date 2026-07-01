# Arborescence & Rôle des Fichiers

**Dernière mise à jour :** 2026-06-30  
**Stack :** React 19 + Express 5 + Prisma 6 + PostgreSQL + Socket.io + Stripe + Cloudinary

---

## 1. Vue d'ensemble du projet

```
elearning-platform/
├── client/                    # Frontend React (Vite + Tailwind)
│   └── src/
│       ├── pages/            # Pages applicatives par rôle
│       ├── components/       # Composants réutilisables
│       ├── services/         # Appels API + WebSocket
│       ├── context/          # Contexts React (auth, notifications, thème)
│       ├── hooks/            # Custom hooks
│       ├── utils/            # Helpers
│       ├── i18n/             # Traductions FR/EN
│       └── assets/           # Images statiques
│
├── server/                   # Backend Express (API REST + WebSocket)
│   └── src/
│       ├── routes/           # Routeurs Express (20 modules)
│       ├── controllers/      # Handlers de requêtes
│       ├── services/         # Logique métier (21 services)
│       ├── middleware/       # Auth, upload, validation
│       ├── config/           # Database, Cloudinary, Swagger
│       └── utils/            # JWT, crypto
│
├── server/prisma/            # Schéma base de données
└── *.md                     # Documentation
```

---

## 2. Client (Frontend)

### `client/src/pages/` — Pages applicatives

**Public (sans authentification)**
| Fichier | Route | Rôle |
|---------|-------|------|
| Home.jsx | `/` | Accueil : hero, featured courses, catégories |
| CourseDetail.jsx | `/courses/:id` | Détail cours (étudiant) : description, sections, avis, prix |
| CourseCatalog.jsx | `/courses` | Catalogue public avec filtres/recherche |
| Login.jsx | `/login` | Connexion email/password |
| Register.jsx | `/register` | Inscription |

**Étudiant (`student/`)**
| Fichier | Route | Rôle |
|---------|-------|------|
| Dashboard.jsx | `/student/dashboard` | Dashboard : cours en cours, progression, recommandations |
| MyCourses.jsx | `/student/courses` | Mes cours inscrits avec progression |
| CoursePlayer.jsx | `/courses/:id/learn` | Lecteur de cours : vidéo, texte, quiz, flashcards, progression |
| CertificateView.jsx | `/student/certificates/:id` | Affichage certificat obtenu |
| CertificateButton.jsx | — | Bouton téléchargement certificat |
| StudentEnrollments.jsx | — | Gestion des inscriptions |
| Checkout.jsx | `/checkout/:courseId` | Paiement Stripe |

**Instructeur (`instructor/`)**
| Fichier | Route | Rôle |
|---------|-------|------|
| Dashboard.jsx | `/instructor/dashboard` | Dashboard : revenus, étudiants, analytics |
| MyCourses.jsx | `/instructor/courses` | Mes cours : CRUD, archive, stats |
| CourseDetail.jsx | `/instructor/courses/:id` | Détail cours : overview, curriculum, étudiants, avis |
| CourseBuilder.jsx | `/instructor/courses/:id/builder` | Éditeur de cours : sections, leçons, quiz, flashcards |
| CreateCourse.jsx | `/instructor/courses/create` | Créer nouveau cours |
| EditCourse.jsx | `/instructor/courses/:id/edit` | Modifier cours : titre, miniature, prix, descriptions |
| InstructorCourseStats.jsx | `/instructor/courses/:id/stats` | Statistiques détaillées d'un cours |

**Admin (`admin/`)**
| Fichier | Route | Rôle |
|---------|-------|------|
| Dashboard.jsx | `/admin/dashboard` | Vue globale plateforme |
| Users.jsx | `/admin/users` | Gestion utilisateurs |
| Courses.jsx | `/admin/courses` | Gestion tous les cours |
| Categories.jsx | `/admin/categories` | CRUD catégories |
| CouponManager.jsx | `/admin/coupons` | CRUD codes promo |
| Enrollments.jsx | `/admin/enrollments` | Vue toutes les inscriptions |
| TransactionManager.jsx | `/admin/transactions` | Vue tous les paiements |
| Settings.jsx | `/admin/settings` | Paramètres plateforme |

**Commun**
| Fichier | Route | Rôle |
|---------|-------|------|
| Profile.jsx | `/profile` | Profil utilisateur |
| Notifications.jsx | `/notifications` | Centre de notifications |
| CartPage.jsx | `/cart` | Panier d'achat |
| CheckoutPage.jsx | `/checkout` | Process de paiement complet |
| WishlistPage.jsx | `/wishlist` | Liste des cours souhaités |
| PaymentSuccessPage.jsx | `/payment/success` | Confirmation paiement |
| PaymentCancelPage.jsx | `/payment/cancel` | Annulation paiement |
| Dashboard.jsx | `/dashboard` | Dashboard générique (redirect selon rôle) |
| App.jsx | — | Router + providers (Auth, Notifications, Socket) |
| main.jsx | — | Bootstrap React (render App) |

### `client/src/components/` — Composants réutilisables

**Course**
| Fichier | Rôle |
|---------|------|
| QuizPlayer.jsx | Lecteur quiz : questions, soumission, feedback, score |
| VideoPlayer.jsx | Lecteur vidéo : tracking progression, resume position |
| CourseCard.jsx | Carte affichage cours (miniature, titre, prix, note) |
| CourseList.jsx | Grille de CourseCard |
| CourseFilter.jsx | Filtres catalogue (catégorie, niveau, prix, recherche) |
| FavoriteButton.jsx | Bouton wishlist (cœur animé) |
| FlashcardDeckView.jsx | Affichage deck flashcards (recto/verso) |
| StudyScheduleView.jsx | Vue planning d'étude (calendrier) |

**Layout**
| Fichier | Rôle |
|---------|------|
| Header.jsx | Navigation : logo, notifications, profil |
| Sidebar.jsx | Menu latéral dashboard |
| Footer.jsx | Pied de page |
| DashboardLayout.jsx | Layout wrapper pour pages dashboard |

**Common**
| Fichier | Rôle |
|---------|------|
| Avatar.jsx | Avatar avec fallback initiales |
| ConfirmModal.jsx | Modale confirmation (supprimer/archiver) |
| Modal.jsx | Modale générique |
| Button.jsx | Bouton avec variantes |
| Input.jsx | Champ de formulaire |
| Loading.jsx | Spinner chargement |
| Card.jsx | Conteneur carte |
| LanguageSwitcher.jsx | Sélecteur FR/EN |
| Toaster.jsx | Container toasts |

**Auth**
| Fichier | Rôle |
|---------|------|
| ProtectedRoute.jsx | Guard : vérifie auth + rôle |

### `client/src/services/` — Couche API & WebSocket

| Fichier | Rôle |
|---------|------|
| api.js | Instance Axios (baseURL, intercepteurs JWT) |
| authService.js | register/login/logout/profile |
| userService.js | CRUD utilisateurs |
| courseService.js | CRUD cours, upload, archive |
| sectionService.js | CRUD sections, reorder |
| lessonService.js | CRUD leçons, upload vidéo/ressources |
| quizService.js | CRUD quiz, génération IA |
| enrollmentService.js | Inscriptions, vérification accès |
| progressService.js | Marquage leçons, tracking vidéo, progression |
| certificateService.js | Génération certificats (PDF) |
| transactionService.js | Historique paiements |
| couponService.js | Validation/application codes promo |
| cartService.js | Gestion panier |
| wishlistService.js | Gestion favoris + localStorage |
| notificationService.js | Notifications + WebSocket |
| flashcardService.js | CRUD flashcards, génération IA |
| studyScheduleService.js | CRUD planning d'étude |
| categoryService.js | Récupération catégories |
| analyticsService.js | Stats instructeur |
| adminService.js | Stats globales admin |
| socketService.js | Connexion Socket.io (singleton) |

### `client/src/context/` — Contexts React

| Fichier | Rôle |
|---------|------|
| AuthContext.jsx | État global auth (user, login, logout) |
| NotificationContext.jsx | État global notifications (liste, non-lu, socket) |
| ThemeContext.jsx | Gestion thème clair/sombre |

### `client/src/hooks/` — Custom Hooks

| Fichier | Rôle |
|---------|------|
| useAuth.js | Accès contexte Auth |
| useCourses.js | Récupération/caching des cours |

### `client/src/utils/` — Utilitaires

| Fichier | Rôle |
|---------|------|
| toast.js | Wrapper react-hot-toast i18n |
| axios.js | Instance Axios |
| wishlistStorage.js | Helpers localStorage |
| helpers.js | Format prix, dates, slugs |
| constants.js | Constantes (rôles, types contenu) |

### `client/src/i18n/` — Internationalisation

| Fichier | Rôle |
|---------|------|
| config.js | Configuration i18next |
| locales/fr.json | Traductions françaises |
| locales/en.json | Traductions anglaises |

---

## 3. Server (Backend)

### `server/src/routes/` — Routeurs Express

| Fichier | Base path | Rôle |
|---------|-----------|------|
| authRoutes.js | `/api/auth` | Inscription, login, logout, refresh, profile |
| userRoutes.js | `/api/users` | CRUD utilisateurs (admin) |
| courseRoutes.js | `/api/courses` | CRUD cours, archive, requirements, outcomes, génération IA |
| sectionRoutes.js | `/api/sections` | CRUD sections, reorder |
| lessonRoutes.js | `/api/lessons` | CRUD leçons, upload, reorder |
| quizRoutes.js | `/api/quizzes` | CRUD quiz, tentative, génération IA, résultats |
| progressRoutes.js | `/api/progress` | Marquage leçons, tracking vidéo, progression |
| enrollmentRoutes.js | `/api/enrollments` | Inscriptions, vérification accès |
| certificateRoutes.js | `/api/certificates` | Génération et récupération certificats |
| categoryRoutes.js | `/api/categories` | CRUD catégories hiérarchiques |
| transactionRoutes.js | `/api/transactions` | Transactions, webhook Stripe |
| checkoutRoutes.js | `/api/checkout` | Création session Stripe |
| couponRoutes.js | `/api/coupons` | Validation, application, CRUD coupons |
| cartRoutes.js | `/api/cart` | Gestion panier |
| wishlistRoutes.js | `/api/wishlist` | Gestion favoris |
| notificationRoutes.js | `/api/notifications` | Récupération, marquer lu, compteur |
| studyScheduleRoutes.js | `/api/study-schedule` | CRUD planning d'étude |
| flashcardRoutes.js | `/api/flashcards` | CRUD decks + cartes |
| paymentRoutes.js | `/api/payments` | Webhooks Stripe |
| adminRoutes.js | `/api/admin` | Stats globales, gestion users |
| Instructoranalyticsroutes.js | `/api/instructor/analytics` | Dashboard instructeur, stats cours, revenus |
| uploadRoutes.js | `/api/upload` | Upload fichiers (miniatures, vidéos, documents) |

### `server/src/controllers/` — Handlers

| Fichier | Rôle |
|---------|------|
| authController.js | Register (hash), login (JWT), logout, profile |
| userController.js | CRUD utilisateurs, activation/désactivation |
| courseController.js | CRUD cours, archive, add requirement/outcome, generate description IA |
| sectionController.js | CRUD sections, reorder |
| lessonController.js | CRUD leçons, update, delete, reorder |
| quizController.js | CRUD quiz/questions, scoring, génération IA |
| progressController.js | Mark complete, get progress, update video, reset |
| enrollmentController.js | Enroll, getMy, checkStatus |
| certificateController.js | Issue, getByEnrollment, getMy |
| categoryController.js | CRUD catégories |
| transactionController.js | Création intention paiement, webhook |
| CheckoutController.js | Création session Stripe |
| couponController.js | Validate, apply, CRUD |
| cartController.js | Get, add, remove, clear |
| wishlistController.js | Get, add, remove |
| notificationController.js | GetAll, markRead, unreadCount |
| studyScheduleController.js | Create, getMy, update, delete |
| flashcardController.js | CRUD decks + cartes |
| paymentController.js | Webhook Stripe confirmation |
| adminController.js | Stats globales, user management |
| Instructoranalyticscontroller.js | Dashboard, course stats, revenue |
| uploadController.js | Cloudinary upload (thumbnail, video, resources) |

### `server/src/services/` — Logique métier

| Fichier | Rôle |
|---------|------|
| authService.js | Hash password, compare, générer JWT, refresh token |
| userService.js | CRUD utilisateurs, recherche, activation |
| categoryService.js | CRUD catégories, hiérarchie |
| courseService.js | Création (slug check), update (pricing/status), getCourseById (accès, sections + canAccess), archive, instructor courses |
| sectionService.js | CRUD sections, vérification ownership, reorder |
| lessonService.js | CRUD leçons, accès isPreview/isFree, ownership, upload Cloudinary |
| quizService.js | CRUD quiz/questions, scoring auto, génération IA (Groq) |
| enrollmentService.js | Inscriptions, vérification paiement, accès cours |
| progressService.js | Mark complete (validation vidéo/quiz/texte), update progression, XP, certificat auto |
| certificateService.js | Génération certificats (canvas image, Cloudinary, numéro unique) |
| transactionService.js | Gestion transactions |
| stripeService.js | Intégration Stripe (checkout, webhooks) |
| couponService.js | Validation, calcul réduction, enregistrement usage |
| cartService.js | Add, remove, clear, vérification doublons |
| wishlistService.js | Add, remove, toggle |
| notificationService.js | Création, marquer lu, compteur, WebSocket emit |
| gamificationService.js | Award XP, level up, badges auto |
| flashcardService.js | CRUD decks + flashcards, génération IA |
| uploadService.js | Cloudinary (images, vidéos, documents) |
| groqService.js | IA : génération descriptions quiz, génération quiz |
| adminService.js | Stats globales (users, revenus, cours populaires) |
| studyScheduleService.js | CRUD planning, parsing dates, calcul heures |

### `server/src/middleware/` — Middleware Express

| Fichier | Rôle |
|---------|------|
| auth.js | protect (JWT), authorize (vérification rôle STUDENT/INSTRUCTOR/ADMIN) |
| upload.js | Multer config (gestion upload fichiers) |

### `server/src/config/` — Configuration

| Fichier | Rôle |
|---------|------|
| database.js | Instance Prisma Client |
| cloudinary.js | Configuration Cloudinary (cloud name, API key/secret, folder) |
| swagger.js | Configuration Swagger UI |

### `server/src/utils/` — Utilitaires

| Fichier | Rôle |
|---------|------|
| jwt.js | Sign/verify access + refresh tokens |
| crypto.js | Hash, compare |

### `server/prisma/` — Base de données

| Fichier | Rôle |
|---------|------|
| schema.prisma | Définition complète : 21 modèles, enums, relations, indexes |
| migrations/ | Historique migrations (généré auto) |
| seed.js | Script peuplement initial (catégories, badges, users demo) |

---

## 4. Fichiers de configuration racine

| Fichier | Rôle |
|---------|------|
| README.md | Guide installation, démarrage, variables env |
| PROJECT_DOCUMENTATION.md | Doc technique : API, modèles, scénarios, sécurité |
| FEATURES_ANALYSIS.md | Analyse prospective : Skill Graph, Micro-Learning, impact |

---

## 5. Index par fonctionnalité (cross-reference)

### Authentification & Utilisateurs
```
client/src/pages/auth/Login.jsx
client/src/pages/auth/Register.jsx
client/src/context/AuthContext.jsx
client/src/hooks/useAuth.js
client/src/services/authService.js
server/src/routes/authRoutes.js
server/src/controllers/authController.js
server/src/services/authService.js
server/src/middleware/auth.js
server/src/utils/jwt.js
```

### Cours & Contenu
```
client/src/pages/instructor/CourseBuilder.jsx
client/src/pages/instructor/CreateCourse.jsx
client/src/pages/instructor/EditCourse.jsx
client/src/services/courseService.js
server/src/routes/courseRoutes.js
server/src/controllers/courseController.js
server/src/services/courseService.js
server/prisma/schema.prisma (model Course, CourseSection, Lesson)
```

### Paiement & Transactions
```
client/src/pages/CheckoutPage.jsx
client/src/pages/Checkout.jsx
client/src/pages/PaymentSuccessPage.jsx
client/src/services/transactionService.js
client/src/services/couponService.js
server/src/routes/checkoutRoutes.js
server/src/routes/transactionRoutes.js
server/src/controllers/CheckoutController.js
server/src/services/stripeService.js
server/src/services/couponService.js
```

### Quiz & Évaluations
```
client/src/components/course/QuizPlayer.jsx
client/src/services/quizService.js
server/src/routes/quizRoutes.js
server/src/controllers/quizController.js
server/src/services/quizService.js
server/prisma/schema.prisma (model Quiz, QuizQuestion, QuizAttempt)
```

### Progression & Certificats
```
client/src/pages/student/CoursePlayer.jsx
client/src/services/progressService.js
client/src/services/certificateService.js
server/src/routes/progressRoutes.js
server/src/routes/certificateRoutes.js
server/src/controllers/progressController.js
server/src/services/progressService.js
server/src/services/certificateService.js
server/prisma/schema.prisma (model Enrollment, LessonProgress, Certificate)
```

### Gamification & Badges
```
client/src/pages/student/Dashboard.jsx
client/src/services/analyticsService.js
server/src/services/gamificationService.js
server/prisma/schema.prisma (model Badge, UserBadge)
```

### Notifications
```
client/src/context/NotificationContext.jsx
client/src/services/notificationService.js
client/src/services/socketService.js
server/src/routes/notificationRoutes.js
server/src/controllers/notificationController.js
server/src/services/notificationService.js
server/prisma/schema.prisma (model Notification)
```

### Flashcards & Planning
```
client/src/components/course/FlashcardDeckView.jsx
client/src/components/course/StudyScheduleView.jsx
client/src/services/flashcardService.js
client/src/services/studyScheduleService.js
server/src/routes/flashcardRoutes.js
server/src/routes/studyScheduleRoutes.js
server/src/services/flashcardService.js
server/src/services/studyScheduleService.js
```

### Admin & Modération
```
client/src/pages/admin/Dashboard.jsx
client/src/pages/admin/Users.jsx
client/src/pages/admin/Categories.jsx
client/src/pages/admin/Courses.jsx
server/src/routes/adminRoutes.js
server/src/controllers/adminController.js
server/src/services/adminService.js
server/src/services/categoryService.js
```

---

## 6. Démarrage rapide

```bash
# Backend
cd server
npm install
npm run dev                    # Port 5000
npx prisma migrate dev         # Migrations DB

# Frontend
cd client
npm install
npm run dev                    # Port 5173
```

**Variables d'environnement requises :**
- `DATABASE_URL` — PostgreSQL
- `JWT_SECRET` / `JWT_REFRESH_SECRET`
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET`
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`
- `GROQ_API_KEY`

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// On définit les routes publiques (Connexion/Inscription)
// Le (.*) est important pour capturer les sous-routes de Clerk
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)", 
  "/sign-up(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
  // Si la route n'est pas publique, on protège l'accès
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Exclure les fichiers statiques de Next.js
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Toujours exécuter pour les routes API
    '/(api|trpc)(.*)',
  ],
};
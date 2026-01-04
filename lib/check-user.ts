import { currentUser } from "@clerk/nextjs/server";
import prisma from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  // 1. Si pas connecté sur Clerk, on arrête tout
  if (!user) {
    return null;
  }

  // 2. On cherche si l'utilisateur existe déjà dans notre DB
  const loggedInUser = await prisma.user.findUnique({
    where: {
      clerkUserId: user.id,
    },
  });

  // 3. S'il existe, on le retourne
  if (loggedInUser) {
    return loggedInUser;
  }

  // 4. S'il n'existe pas, on le crée (Premier login)
  // C'est ici que se fait la "connexion" Clerk -> Supabase
  const newUser = await prisma.user.create({
    data: {
      clerkUserId: user.id,
      email: user.emailAddresses[0].emailAddress,
    },
  });

  return newUser;
};
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";
import path from "path";

const auth = new google.auth.GoogleAuth({
    keyFile: path.join(process.cwd(), "token.json"),
    scopes: ["https://www.googleapis.com/auth/admin.directory.user.readonly"],
    clientOptions: {
        subject: "administrator@einaudicorreggio.it",
    },
});

const service = google.admin({ version: "directory_v1", auth });

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "select_account",
                    access_type: "offline",
                    response_type: "code",
                    scope: "openid email profile",
                    hd: "einaudicorreggio.it",
                },
            },
        }),
        CredentialsProvider({
            name: "Secret Access",
            credentials: {
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (credentials?.password === "rappseinaudi2526!") {
                    return {
                        id: "admin-bypass",
                        name: "Admin Bypass",
                        email: "rappresentanti@einaudicorreggio.it",
                    };
                }
                return null;
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // Bypass for credentials provider
            if (account?.provider === "credentials") {
                const email = user.email!;
                let dbUser = await prisma.user.findUnique({ where: { email } });
                if (!dbUser) {
                    await prisma.user.create({
                        data: {
                            email,
                            nome: user.name || "Admin",
                            ruolo: "ADMIN",
                            classe: "STAFF"
                        }
                    });
                }
                return true;
            }

            console.log("Profile:", profile);
            if (!account || !profile || !profile.email) return false;

            // Restrict to domain
            if (!profile.email.endsWith("@einaudicorreggio.it")) {
                return false;
            }

            let classe = "";
            try {
                const userData = await service.users.get({ userKey: profile.email });
                if (userData.data.orgUnitPath) {
                    console.log("OrgUnitPath:", userData.data.orgUnitPath);
                    // Assuming format like /Studenti/5A or similar. User said split("/")[2]
                    const parts = userData.data.orgUnitPath.split("/");
                    if (parts.length > 2) {
                        classe = parts[2];
                    }
                }
            } catch (error) {
                console.error("Error fetching user data from Google Admin SDK:", error);
                // Allow login even if Admin SDK fails? Maybe not if class is required.
                // But for now let's proceed, maybe it's an admin or teacher without class.
            }

            let dbUser = await prisma.user.findUnique({
                where: {
                    email: profile.email,
                },
            });

            const isAdminEmail = profile.email === "gasparini.fabrizio@einaudicorreggio.it";
            const role = isAdminEmail ? "ADMIN" : "STUDENTE";

            if (!dbUser) {
                dbUser = await prisma.user.create({
                    data: {
                        email: profile.email,
                        nome: profile.name || "",
                        ruolo: role,
                        classe: classe || "",
                    },
                });
            } else {
                const dataToUpdate: any = {};
                if (dbUser.classe !== classe && classe !== "") {
                    dataToUpdate.classe = classe;
                }
                // Auto-promote to admin if email matches, just in case
                if (isAdminEmail && dbUser.ruolo !== "ADMIN") {
                    dataToUpdate.ruolo = "ADMIN";
                }
                
                if (Object.keys(dataToUpdate).length > 0) {
                    await prisma.user.update({
                        where: { email: profile.email },
                        data: dataToUpdate,
                    });
                }
            }

            return true;
        },
        async session({ session, token }) {
            if (!session?.user?.email) return session;

            const user = await prisma.user.findUnique({
                where: {
                    email: session.user.email,
                },
            });

            if (user) {
                // @ts-ignore
                session.user.class = user.classe || "";
                // @ts-ignore
                session.user.admin = user.ruolo === "ADMIN";
                // @ts-ignore
                session.user.id = user.id;
            }

            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login", // Redirect to login on error for now
    },
    secret: process.env.NEXTAUTH_SECRET,
};

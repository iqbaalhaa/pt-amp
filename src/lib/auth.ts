import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
	emailAndPassword: {
		enabled: true,
		disableSignUp: false,
	},

	user: {
		additionalFields: {
			role: {
				type: ["SUPERADMIN", "STAFF"],
				defaultValue: "STAFF",
				input: false,
			},
		},
	},

	database: prismaAdapter(prisma, { provider: "postgresql" }),
});

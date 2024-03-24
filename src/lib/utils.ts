import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import db from "./db";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const formSchema = z.object({
	username: z.string().min(1, { message: "enter your username" }),
	password: z.string().min(1, { message: "enter your password" }),
});

export const authentication = async (username: string, password: string) => {
	try {
		const userJson = await db.get(username);
		const user = JSON.parse(userJson);

		if (user.blocked) throw new Error("This account has been blocked");
		if (user.password !== password)
			throw new Error("Invalid login information");

		return 1; // Authentication successful
	} catch (error: any) {
		throw error;
	}
};

export async function updateFavorite(user: string, photo: any) {
	try {
		// Get the current favorites from the database
		let favorites = JSON.parse(await db.get(`${user}_favorites`));

		// Check if the photo is already in the favorites
		const index = favorites.findIndex(
			(fav: { id: string }) => fav.id === photo.id
		);

		if (index !== -1) {
			// If the photo is already in the favorites, remove it
			favorites.splice(index, 1);
		} else {
			// If the photo is not in the favorites, add it
			favorites.push(photo);
		}

		// Store the updated favorites in the database
		await db.put(`${user}_favorites`, JSON.stringify(favorites));
	} catch (error: any) {
		// If the favorites are not in the database, create them
		if (error.notFound) {
			await db.put(`${user}_favorites`, JSON.stringify([photo]));
		} else {
			console.log("Failed to update favorite", error);
		}
	}
}

export async function getAuthenticatedUser() {
	try {
		const userJson = await db.get("authenticatedUser");
		const user = JSON.parse(userJson);
		return user;
	} catch (error) {
		console.log("Failed to get authenticated user from database", error);
		return null;
	}
}

export async function isFavorite(username: string, photo: any) {
	try {
		// Get the current favorites from the database
		const favoritesJson = await db.get(`${username}_favorites`);
		const favorites = JSON.parse(favoritesJson);

		// Check if the photo is in the favorites
		return favorites.some(
			(favorite: { id: string }) => favorite.id === photo.id
		);
	} catch (error: any) {
		// If the favorites are not in the database, the photo is not a favorite
		if (error.notFound) {
			return false;
		} else {
			console.log("Failed to check favorite", error);
			return false;
		}
	}
}

export type image = {
	id: string;
	urls: { regular: string };
	user: { profile_image: { small: string }; name: string };
};

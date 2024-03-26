import { useState, useEffect } from "react";
import db from "./db";
import { image } from "./utils";
import fetch from "node-fetch";

export default function useFetch(index: number) {
	console.log(index)
	const [data, setData] = useState<image[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const storesPhotos = async () => {
			try {
				await db.get("photosStored");
			} catch (error) {
				const url = `https://api.unsplash.com/photos?client_id=${process.env.NEXT_PUBLIC_ACCESS_KEY}&page=1&per_page=30`;
				const response = await fetch(url);

				if (response.ok) {
					const photos = await response.json();
					const batchSize = 10;

					for (let index = 0; index < photos.length; index += batchSize) {
						const photoBatch = photos.slice(index, index + batchSize);
						await db.put(`images_${index / batchSize + 1}`, JSON.stringify(photoBatch));
					}
					await db.put("photosStored", "true");
				} else {
					console.log("Failed to fetch photos");
				}
			}
		};

		storesPhotos();
	}, []);

	useEffect(() => {
		const fetchPhotos = async () => {
			try {
				const photosJson = await db.get(`images_${index}`);
				const photos = JSON.parse(photosJson);
				setData(photos);
				setLoading(false);
			} catch (error) {
				console.log("Failed to get photos from database", error);
				setLoading(false);
			}
		};

		fetchPhotos();
	}, [index]);

	return { loading, data };
}

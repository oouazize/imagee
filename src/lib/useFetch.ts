import { useState, useEffect } from "react";
import db from "./db";
import { image } from "./utils";

export default function useFetch() {
	const [data, setData] = useState<image[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchPhotos = async () => {
			try {
				const photosJson = await db.get("images");
				const photos = JSON.parse(photosJson);
				setData(photos);
				setLoading(false);
			} catch (error) {
				console.log("Failed to get photos from database", error);
				setLoading(false);
			}
		};

		fetchPhotos();
	}, []);

	return { loading, data };
}

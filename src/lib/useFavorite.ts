import React, { useEffect, useState } from 'react'
import { image, isFavorite } from './utils';

export default function useFavorite({authenticatedUser, data}: {authenticatedUser: string, data: image[]}) {
    const [isFav, setIsFav] = useState<{ [key: string]: boolean }>({});

	useEffect(() => {
		const checkFavorites = async () => {
			const favs: { [key: string]: boolean } = {};

			for (const item of data) {
				if (item.id) {
					favs[item.id] = await isFavorite(authenticatedUser, item);
				}
			}
			setIsFav(favs);
		};

		checkFavorites();
    }, [authenticatedUser, data]);
    
  return isFav
}

"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FaHeart } from "react-icons/fa";
import { CiHeart } from "react-icons/ci";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/src/components/ui/pagination";
import useFetch from "../lib/useFetch";
import { updateFavorite, getAuthenticatedUser, isFavorite } from "../lib/utils";
import db from "../lib/db";
import { useRouter } from "next/navigation";
import LogOut from "./logout";
import fetch from "node-fetch";

export default function list() {
	const route = useRouter();
	const [currentPage, setCurrentPage] = useState(1);
	const [postsPerPage, setPostsPerPage] = useState(10);
	const [authenticatedUser, setAuthenticatedUser] = useState("");

	useEffect(() => {
		const fetchAuthenticatedUser = async () => {
			const user = await getAuthenticatedUser();
			if (!user) route.push("/login");
			else setAuthenticatedUser(user.username);
		};

		fetchAuthenticatedUser();
	}, []);

	useEffect(() => {
		const storesPhotos = async () => {
			try {
				// Try to get the flag from the database
				await db.get("photosStored");
			} catch (error) {
				const url = `https://api.unsplash.com/photos?client_id=${process.env.NEXT_PUBLIC_ACCESS_KEY}&page=1&per_page=120`;
				const response = await fetch(url);

				if (response.ok) {
					const photos = await response.json();
					await db.put("images", JSON.stringify(photos));
					await db.put("photosStored", "true");
				} else {
					console.log("Failed to fetch photos");
				}
			}
		};

		storesPhotos();
	}, []);

	const { loading, data } = useFetch();

	const lastPostIndex = currentPage * postsPerPage;
	const firstPostIndex = lastPostIndex - postsPerPage;
	const currentPosts = data.slice(firstPostIndex, lastPostIndex);

	const [isFav, setIsFav] = useState<{ [key: string]: boolean }>({});

	useEffect(() => {
		const checkFavorites = async () => {
			const favs: { [key: string]: boolean } = {};

			for (const item of currentPosts) {
				if (item.id) {
					favs[item.id] = await isFavorite(authenticatedUser, item);
				}
			}

			setIsFav(favs);
		};

		checkFavorites();
	}, [authenticatedUser, currentPosts]);

	if (authenticatedUser === "") return null;
	return (
		<section className="flex flex-col gap-10">
			<div className="w-full flex-between">
				<h1>All images</h1>
				<LogOut />
			</div>
			<main className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8 max-w-screen-xl mx-auto">
				{!loading &&
					currentPosts.map((item, index) => {
						return (
							<div key={index}>
								<Image
									className="w-80 h-56 rounded-lg"
									src={item.urls.regular}
									width={200}
									height={200}
									alt="image"
									priority
								/>
								<div className="flex-between py-2">
									<div className="flex gap-2">
										<Image
											className="w-6 h-6 rounded-full"
											src={item.user.profile_image.small}
											width={200}
											height={200}
											alt="image"
											priority
										/>
										<h2>{item.user.name}</h2>
									</div>

									<button
										onClick={() => updateFavorite(authenticatedUser, item)}
									>
										{isFav[item.id] ? <FaHeart /> : <CiHeart />}
									</button>
								</div>
							</div>
						);
					})}
			</main>
			<PaginationSection
				totalPosts={data.length}
				postsPerPage={postsPerPage}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
			/>
		</section>
	);
}

function PaginationSection({
	totalPosts,
	postsPerPage,
	currentPage,
	setCurrentPage,
}: {
	totalPosts: any;
	postsPerPage: any;
	currentPage: any;
	setCurrentPage: any;
}) {
	const pageNumbers = [];
	for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
		pageNumbers.push(i);
	}

	const maxPageNum = 5; // Maximum page numbers to display at once
	const pageNumLimit = Math.floor(maxPageNum / 2); // Current page should be in the middle if possible

	let activePages = pageNumbers.slice(
		Math.max(0, currentPage - 1 - pageNumLimit),
		Math.min(currentPage - 1 + pageNumLimit + 1, pageNumbers.length)
	);

	const handleNextPage = () => {
		if (currentPage < pageNumbers.length) {
			setCurrentPage(currentPage + 1);
		}
	};

	const handlePrevPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	// Function to render page numbers with ellipsis
	const renderPages = () => {
		const renderedPages = activePages.map((page, idx) => (
			<PaginationItem
				key={idx}
				className={currentPage === page ? "bg-neutral-100 rounded-md" : ""}
			>
				<PaginationLink onClick={() => setCurrentPage(page)} href={""}>
					{page}
				</PaginationLink>
			</PaginationItem>
		));

		// Add ellipsis at the start if necessary
		if (activePages[0] > 1) {
			renderedPages.unshift(
				<PaginationEllipsis
					key="ellipsis-start"
					onClick={() => setCurrentPage(activePages[0] - 1)}
				/>
			);
		}

		// Add ellipsis at the end if necessary
		if (activePages[activePages.length - 1] < pageNumbers.length) {
			renderedPages.push(
				<PaginationEllipsis
					key="ellipsis-end"
					onClick={() =>
						setCurrentPage(activePages[activePages.length - 1] + 1)
					}
				/>
			);
		}

		return renderedPages;
	};

	return (
		<div className="mt-4">
			<Pagination>
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious onClick={handlePrevPage} href={""} />
					</PaginationItem>

					{renderPages()}

					<PaginationItem>
						<PaginationNext onClick={handleNextPage} href={""} />
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}

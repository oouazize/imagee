"use client";
import React from "react";
import db from "../lib/db";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export default function LogOut() {
	const route = useRouter();
	const handleLogout = async () => {
		try {
			await db.del("authenticatedUser");
		} catch (error) {
		} finally {
			route.push("/login");
		}
	};
	return <Button onClick={handleLogout}>Log out</Button>;
}

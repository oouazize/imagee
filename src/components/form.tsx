"use client";
import toast from "react-hot-toast";
import { Button } from "@/src/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authentication, formSchema, getAuthenticatedUser } from "@/src/lib/utils";
import db from "../lib/db";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function DynamicForm() {
	const route = useRouter();
	useEffect(() => {
		const storeUsers = async () => {
			try {
				const user = await getAuthenticatedUser();
				if (user) route.push("/");
				await db.get("usersStored");
			} catch (error) {
				const users = [
					{ username: "muser1", password: "mpassword1", blocked: false },
					{ username: "muser2", password: "mpassword2", blocked: false },
					{ username: "muser3", password: "mpassword3", blocked: true },
				];

				// should hash the password before store it
				for (const user of users) {
					await db.put(user.username, JSON.stringify(user));
				}

				await db.put("usersStored", "true");
			}
		};
		storeUsers();
	}, []);
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		const { username, password } = values;
		try {
			const res = await authentication(username, password);
			console.log(res);
			if (res) {
				await db.put(
					"authenticatedUser",
					JSON.stringify({ username, password })
				);
				route.push("/");
			}
		} catch (error: any) {
			toast.error(error.message);
		}
		form.reset();
	}

	const formFields: {
		name: "username" | "password";
		label: string;
		placeholder: string;
	}[] = [
		{ name: "username", label: "Name", placeholder: "Enter your username" },
		{ name: "password", label: "Password", placeholder: "Enter your passowrd" },
	];
	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="w-full max-w-[600px] flex flex-col gap-4 text-white"
			>
				{formFields.map((item) => {
					return (
						<FormField
							key={item.name}
							control={form.control}
							name={item.name}
							render={({ field }) => (
								<FormItem>
									<FormLabel>{item.label}</FormLabel>
									<FormControl>
										<Input placeholder={item.placeholder} {...field} />
									</FormControl>
									<FormMessage className="text-red-600" />
								</FormItem>
							)}
						/>
					);
				})}
				<Button>Sign in</Button>
			</form>
		</Form>
	);
}

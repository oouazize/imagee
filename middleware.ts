import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "./src/lib/utils";

export async function middleware(request: NextRequest) {
	// the file didn't trigger!!!
	let response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	});

	const user = await getAuthenticatedUser();

	// Defining the protected routes
	const protectedRoutes = "/login";
	const indexRoute = "/";
	const isProtectedRoute = protectedRoutes.includes(request.nextUrl.pathname);
	const isIndexRoute = indexRoute.includes(request.nextUrl.pathname);

	console.log(user, isProtectedRoute);
	if (user && isProtectedRoute)
		return NextResponse.redirect(new URL("/", request.url));

	if (!user && isIndexRoute)
		return NextResponse.redirect(new URL("/login", request.url));

	return response;
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

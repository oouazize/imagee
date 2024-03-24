import { DynamicForm } from "@/src/components/form";
import Image from "next/image";
import banner from "@/public/banner.jpg";
import { Toaster } from "react-hot-toast";

const Login = async () => {
	return (
		<div className="flex flex-col md:flex-row w-full h-screen">
			<div className="flex-grow h-full flex-center flex-col">
				<div className="w-4/5 max-w-96 flex flex-col gap-8">
					<div className="flex flex-col">
						<h1>Welcome back</h1>
						<h4>Welcome back!Please enter your details.</h4>
					</div>
					<DynamicForm />
				</div>
			</div>
			<Image
				className="hidden md:block w-1/2 h-full"
				src={banner}
				alt="banner"
				priority
			/>
			<Toaster position="bottom-right" />
		</div>
	);
};

export default Login;

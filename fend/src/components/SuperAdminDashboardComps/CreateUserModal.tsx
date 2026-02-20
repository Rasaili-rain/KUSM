import axiosInstance from "@/lib/api_provider";
import { UserRole } from "@/stores/authStore";
import { X } from "lucide-react";
import { useState } from "react";

// Create User Modal
interface CreateUserModalProps {
	onClose: () => void;
	onSuccess: () => void;
	setError: (error: string) => void;
}

export default function CreateUserModal({ onClose, onSuccess, setError }: CreateUserModalProps) {
	const [formData, setFormData] = useState<{
		email: string;
		password: string;
		full_name: string;
		role: UserRole;
	}>({
		email: "",
		password: "",
		full_name: "",
		role: UserRole.ADMIN,
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (formData.password.length < 8) {
			setError("Password must be at least 8 characters");
			return;
		}

		try {
			setIsSubmitting(true);
			await axiosInstance.post("/auth/users", formData);
			onSuccess();
		} catch (err: any) {
			setError(err.response?.data?.detail || "Failed to create user");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-black/50" onClick={onClose} />
			<div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
				<div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
					<h3 className="text-lg font-semibold text-gray-900">Create New User</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 transition"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Email Address *
						</label>
						<input
							type="email"
							required
							value={formData.email}
							onChange={(e) => setFormData({ ...formData, email: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="user@example.com"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Password *
						</label>
						<input
							type="password"
							required
							minLength={8}
							value={formData.password}
							onChange={(e) => setFormData({ ...formData, password: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Min 8 characters"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Full Name
						</label>
						<input
							type="text"
							value={formData.full_name}
							onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="John Doe"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Role *
						</label>
						<select
							value={formData.role}
							onChange={(e) =>
								setFormData({ ...formData, role: e.target.value as UserRole })
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							<option value={UserRole.ADMIN}>Admin</option>
							<option value={UserRole.SUPER_ADMIN}>Super Admin</option>
						</select>
					</div>

					<div className="flex gap-3 pt-4">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
						>
							{isSubmitting ? "Creating..." : "Create User"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
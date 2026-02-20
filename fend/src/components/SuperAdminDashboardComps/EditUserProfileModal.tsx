import { useState } from "react";
import { X, Mail, Save } from "lucide-react";
import { axiosInstance } from "@/lib/api_provider";
import { UserRole } from "@/stores/authStore";

interface User {
	id: number;
	email: string;
	full_name: string | null;
	role: UserRole;
	is_active: boolean;
	created_at: string;
	created_by: number | null;
}

interface EditUserProfileModalProps {
	user: User;
	onClose: () => void;
	onSuccess: () => void;
	setError: (error: string) => void;
}

export default function EditUserProfileModal({
	user,
	onClose,
	onSuccess,
	setError,
}: EditUserProfileModalProps) {
	const [fullName, setFullName] = useState(user.full_name || "");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			setIsSubmitting(true);
			await axiosInstance.patch(`/auth/users/${user.id}`, { full_name: fullName });
			onSuccess();
		} catch (err: any) {
			setError(err.response?.data?.detail || "Failed to update user profile");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-black/50" onClick={onClose} />
			<div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
				<div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
					<h3 className="text-lg font-semibold text-gray-900">Edit User Profile</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 transition"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					<div className="bg-gray-50 rounded-lg p-4">
						<div className="flex items-center gap-2 mb-2">
							<Mail className="w-4 h-4 text-gray-600" />
							<p className="text-sm font-medium text-gray-900">{user.email}</p>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Full Name
						</label>
						<input
							type="text"
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
							placeholder="Enter full name"
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
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
							disabled={isSubmitting || fullName === user.full_name}
							className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
						>
							<Save className="w-4 h-4" />
							{isSubmitting ? "Updating..." : "Update Profile"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
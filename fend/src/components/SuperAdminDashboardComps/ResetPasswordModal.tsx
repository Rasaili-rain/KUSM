// src/components/SuperAdminDashboardComponents/ResetPasswordModal.tsx
import { useState } from "react";
import { X, Mail, Lock, AlertTriangle } from "lucide-react";
import { axiosInstance } from "@/lib/api_provider";
import { type User } from "@/stores/authStore";


interface ResetPasswordModalProps {
	user: User;
	onClose: () => void;
	onSuccess: () => void;
	setError: (error: string) => void;
}

export default function ResetPasswordModal({
	user,
	onClose,
	onSuccess,
	setError,
}: ResetPasswordModalProps) {
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (newPassword.length < 8) {
			setError("Password must be at least 8 characters");
			return;
		}

		if (newPassword !== confirmPassword) {
			setError("Passwords don't match");
			return;
		}

		try {
			setIsSubmitting(true);
			await axiosInstance.post(`/auth/users/${user.id}/reset-password`, {
				new_password: newPassword,
			});
			onSuccess();
		} catch (err: any) {
			setError(err.response?.data?.detail || "Failed to reset password");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-black/50" onClick={onClose} />
			<div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
				<div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
					<h3 className="text-lg font-semibold text-gray-900">Reset Password</h3>
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
						<p className="text-sm text-gray-600">{user.full_name || "No name"}</p>
					</div>

					<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
						<AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
						<p className="text-sm text-yellow-800">
							You are resetting the password for this {user.full_name}. An email will be sent to {user.email} containing the new password.
						</p>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							New Password *
						</label>
						<div className="relative">
							<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
							<input
								type="password"
								required
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								placeholder="Enter new password (min 8 characters)"
								className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								minLength={8}
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Confirm New Password *
						</label>
						<div className="relative">
							<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
							<input
								type="password"
								required
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="Confirm new password"
								className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
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
							disabled={isSubmitting || !newPassword || !confirmPassword}
							className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
						>
							<Lock className="w-4 h-4" />
							{isSubmitting ? "Resetting..." : "Reset Password"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
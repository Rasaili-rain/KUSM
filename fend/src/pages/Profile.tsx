import { useState } from "react";
import { useAuthStore, UserRole } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";
import {
	User,
	Mail,
	Shield,
	ShieldCheck,
	Lock,
	Save,
	AlertCircle,
	CheckCircle,
	X,
	Eye,
	EyeOff
} from "lucide-react";

// Toast Notification Component
interface ToastProps {
	message: string;
	type: 'success' | 'error';
	onClose: () => void;
}

function Toast({ message, type, onClose }: ToastProps) {
	return (
		<div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-5 duration-300">
			<div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl border-2 min-w-[300px] max-w-md ${type === 'success'
				? 'bg-green-50 border-green-500'
				: 'bg-red-50 border-red-500'
				}`}>
				<div className={`p-1 rounded-full ${type === 'success' ? 'bg-green-100' : 'bg-red-100'
					}`}>
					{type === 'success' ? (
						<CheckCircle className="w-6 h-6 text-green-600" />
					) : (
						<AlertCircle className="w-6 h-6 text-red-600" />
					)}
				</div>
				<div className="flex-1">
					<p className={`text-sm font-semibold ${type === 'success' ? 'text-green-900' : 'text-red-900'
						}`}>
						{type === 'success' ? 'Success!' : 'Error!'}
					</p>
					<p className={`text-sm ${type === 'success' ? 'text-green-800' : 'text-red-800'
						}`}>
						{message}
					</p>
				</div>
				<button
					onClick={onClose}
					className={`${type === 'success'
						? 'text-green-600 hover:text-green-800'
						: 'text-red-600 hover:text-red-800'
						} transition-colors`}
				>
					<X className="w-5 h-5" />
				</button>
			</div>
		</div>
	);
}

export default function Profile() {
	const { user, updateProfile, changePassword } = useAuthStore();
	const navigate = useNavigate();

	const [fullName, setFullName] = useState(user?.full_name || "");
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
	const [isChangingPassword, setIsChangingPassword] = useState(false);

	// Toast notification state
	const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

	if (!user) {
		navigate('/');
		return null;
	}

	const showToast = (message: string, type: 'success' | 'error') => {
		setToast({ message, type });
		setTimeout(() => setToast(null), 5000);
	};

	const handleUpdateProfile = async () => {
		try {
			setIsUpdatingProfile(true);

			await updateProfile(fullName);

			showToast("Profile has been updated successfully!", 'success');
		} catch (error: any) {
			showToast(error.response?.data?.detail || "Failed to update profile", 'error');
		} finally {
			setIsUpdatingProfile(false);
		}
	};

	const handleChangePassword = async () => {
		try {
			if (newPassword.length < 8) {
				showToast("New password must be at least 8 characters", 'error');
				return;
			}

			if (newPassword !== confirmPassword) {
				showToast("New passwords don't match!", 'error');
				return;
			}

			if (!currentPassword) {
				showToast("Please enter your current password", 'error');
				return;
			}

			setIsChangingPassword(true);
			await changePassword(currentPassword, newPassword);

			showToast("Password has been changed successfully!", 'success');
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (error: any) {
			showToast(error.response?.data?.detail || "Failed to change password", 'error');
		} finally {
			setIsChangingPassword(false);
		}
	};

	const getPasswordStrength = (password: string) => {
		if (password.length === 0) return { strength: 0, label: "", color: "" };
		if (password.length < 8) return { strength: 1, label: "Weak", color: "bg-red-500" };

		let strength = 1;
		if (password.length >= 12) strength++;
		if (/[A-Z]/.test(password)) strength++;
		if (/[0-9]/.test(password)) strength++;
		if (/[^A-Za-z0-9]/.test(password)) strength++;

		if (strength <= 2) return { strength: 2, label: "Fair", color: "bg-yellow-500" };
		if (strength <= 3) return { strength: 3, label: "Good", color: "bg-blue-500" };
		return { strength: 4, label: "Strong", color: "bg-green-500" };
	};

	const passwordStrength = getPasswordStrength(newPassword);

	return (
		<>
			{/* Toast Notification */}
			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
			)}

			<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
				<div className="max-w-4xl mx-auto">
					{/* Header */}
					<div className="mb-6">
						<h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
						<p className="text-gray-600 mt-1">Manage your account information and security</p>
					</div>

					<div className="grid gap-6">
						{/* User Information Card */}
						<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
							<div className="flex items-center gap-4 mb-6">
								<div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
									<User className="w-10 h-10 text-white" />
								</div>
								<div>
									<h2 className="text-2xl font-bold text-gray-900">
										{user.full_name || "No name set"}
									</h2>
									<div className="flex items-center gap-2 mt-2">
										{user.role === UserRole.SUPER_ADMIN ? (
											<ShieldCheck className="w-4 h-4 text-purple-600" />
										) : (
											<Shield className="w-4 h-4 text-blue-600" />
										)}
										<span
											className={`text-sm font-medium px-3 py-1 rounded-full ${user.role === UserRole.SUPER_ADMIN
												? "bg-purple-100 text-purple-700"
												: "bg-blue-100 text-blue-700"
												}`}
										>
											{user.role === UserRole.SUPER_ADMIN ? "Super Admin" : "Admin"}
										</span>
									</div>
								</div>
							</div>

							<div className="space-y-4">
								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Email Address
									</label>
									<div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
										<Mail className="w-5 h-5 text-gray-500" />
										<span className="text-gray-900 font-medium">{user.email}</span>
									</div>
									<p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
										<Lock className="w-3 h-3" />
										Email cannot be changed for security reasons
									</p>
								</div>

								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										User ID
									</label>
									<div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
										<span className="text-gray-700 font-mono text-sm">#{user.id}</span>
									</div>
								</div>
							</div>
						</div>

						{/* Edit Profile Card */}
						<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
							<div className="flex items-center gap-2 mb-4">
								<div className="bg-blue-100 p-2 rounded-lg">
									<User className="w-5 h-5 text-blue-600" />
								</div>
								<h3 className="text-lg font-bold text-gray-900">
									Edit Profile
								</h3>
							</div>

							<div className="space-y-4">
								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Full Name
									</label>
									<input
										type="text"
										value={fullName}
										onChange={(e) => setFullName(e.target.value)}
										placeholder="Enter your full name"
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
									/>
									<p className="text-xs text-gray-500 mt-2">
										This name will be displayed across the application
									</p>
								</div>

								<button
									onClick={handleUpdateProfile}
									disabled={isUpdatingProfile || fullName === user.full_name}
									className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg w-full sm:w-auto"
								>
									<Save className="w-4 h-4" />
									{isUpdatingProfile ? "Saving..." : "Save Changes"}
								</button>
							</div>
						</div>

						{/* Change Password Card */}
						<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
							<div className="flex items-center gap-2 mb-4">
								<div className="bg-orange-100 p-2 rounded-lg">
									<Lock className="w-5 h-5 text-orange-600" />
								</div>
								<h3 className="text-lg font-bold text-gray-900">
									Change Password
								</h3>
							</div>

							<div className="space-y-4">
								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Current Password
									</label>
									<div className="relative">
										<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
										<input
											type={showCurrentPassword ? "text" : "password"}
											value={currentPassword}
											onChange={(e) => setCurrentPassword(e.target.value)}
											placeholder="Enter current password"
											className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
										/>
										<button
											type="button"
											onClick={() => setShowCurrentPassword(!showCurrentPassword)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
										>
											{showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
										</button>
									</div>
								</div>

								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										New Password
									</label>
									<div className="relative">
										<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
										<input
											type={showNewPassword ? "text" : "password"}
											value={newPassword}
											onChange={(e) => setNewPassword(e.target.value)}
											placeholder="Enter new password (min 8 characters)"
											className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
										/>
										<button
											type="button"
											onClick={() => setShowNewPassword(!showNewPassword)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
										>
											{showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
										</button>
									</div>

									{/* Password Strength Indicator */}
									{newPassword && (
										<div className="mt-3">
											<div className="flex items-center justify-between mb-2">
												<span className="text-xs font-medium text-gray-600">Password Strength:</span>
												<span className={`text-xs font-semibold ${passwordStrength.strength === 1 ? 'text-red-600' :
													passwordStrength.strength === 2 ? 'text-yellow-600' :
														passwordStrength.strength === 3 ? 'text-blue-600' :
															'text-green-600'
													}`}>
													{passwordStrength.label}
												</span>
											</div>
											<div className="flex gap-1">
												{[1, 2, 3, 4].map((level) => (
													<div
														key={level}
														className={`h-2 flex-1 rounded-full transition-all ${level <= passwordStrength.strength
															? passwordStrength.color
															: 'bg-gray-200'
															}`}
													/>
												))}
											</div>
											<p className="text-xs text-gray-500 mt-2">
												Use at least 8 characters with a mix of uppercase, lowercase, numbers, and symbols
											</p>
										</div>
									)}
								</div>

								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Confirm New Password
									</label>
									<div className="relative">
										<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
										<input
											type={showConfirmPassword ? "text" : "password"}
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
											placeholder="Confirm new password"
											className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
										/>
										<button
											type="button"
											onClick={() => setShowConfirmPassword(!showConfirmPassword)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
										>
											{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
										</button>
									</div>
									{confirmPassword && newPassword !== confirmPassword && (
										<p className="text-xs text-red-600 mt-2 flex items-center gap-1">
											<AlertCircle className="w-3 h-3" />
											Passwords do not match
										</p>
									)}
									{confirmPassword && newPassword === confirmPassword && (
										<p className="text-xs text-green-600 mt-2 flex items-center gap-1">
											<CheckCircle className="w-3 h-3" />
											Passwords match
										</p>
									)}
								</div>

								<button
									onClick={handleChangePassword}
									disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
									className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg w-full sm:w-auto"
								>
									<Lock className="w-4 h-4" />
									{isChangingPassword ? "Changing..." : "Change Password"}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
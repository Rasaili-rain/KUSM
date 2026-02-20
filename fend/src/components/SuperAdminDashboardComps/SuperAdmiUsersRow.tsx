// src/components/SuperAdminDashboardComponents/SuperAdmiUsersRow.tsx
import { useState } from "react";
import { UserRole } from "@/stores/authStore";
import {
	Users,
	Mail,
	CheckCircle,
	XCircle,
	Calendar,
	Trash2,
	Edit,
	Shield,
	ShieldCheck,
	User,
	Lock,
} from "lucide-react";
import { axiosInstance } from "@/lib/api_provider";

interface User {
	id: number;
	email: string;
	full_name: string | null;
	role: UserRole;
	is_active: boolean;
	created_at: string;
	created_by: number | null;
}

interface SuperAdminUserRowProps {
	user: User;
	currentUser: any;
	onRefresh: () => void;
	onEdit: (user: User) => void;
	onEditProfile: (user: User) => void;
	onResetPassword: (user: User) => void;
	setError: (error: string) => void;
}

export default function SuperAdminUserRow({
	user,
	currentUser,
	onRefresh,
	onEdit,
	onEditProfile,
	onResetPassword,
	setError,
}: SuperAdminUserRowProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const [isToggling, setIsToggling] = useState(false);

	const isCurrentUser = user.id === currentUser?.id;

	const handleToggleActive = async () => {
		if (isCurrentUser) {
			setError("You cannot deactivate your own account");
			return;
		}

		try {
			setIsToggling(true);
			await axiosInstance.patch(`/auth/users/${user.id}/toggle-active`);
			onRefresh();
		} catch (err: any) {
			setError(err.response?.data?.detail || "Failed to toggle user status");
		} finally {
			setIsToggling(false);
		}
	};

	const handleDelete = async () => {
		if (isCurrentUser) {
			setError("You cannot delete your own account");
			return;
		}

		if (
			!window.confirm(
				`Are you sure you want to delete user ${user.email}? This action cannot be undone.`
			)
		) {
			return;
		}

		try {
			setIsDeleting(true);
			await axiosInstance.delete(`/auth/users/${user.id}`);
			onRefresh();
		} catch (err: any) {
			setError(err.response?.data?.detail || "Failed to delete user");
		} finally {
			setIsDeleting(false);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getRoleBadge = (role: UserRole) => {
		if (role === UserRole.SUPER_ADMIN) {
			return (
				<span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
					<ShieldCheck className="w-3 h-3" />
					Super Admin
				</span>
			);
		}
		return (
			<span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
				<Shield className="w-3 h-3" />
				Admin
			</span>
		);
	};

	return (
		<div
			className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition ${isCurrentUser ? "ring-2 ring-purple-300" : ""
				}`}
		>
			<div className="flex items-center gap-4 flex-1 min-w-0">
				<div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
					<Users className="w-5 h-5 text-blue-600" />
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<p className="font-medium text-gray-900 truncate">
							{user.full_name || "No name"}
						</p>
						{isCurrentUser && (
							<span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded flex-shrink-0">
								You
							</span>
						)}
					</div>
					<div className="flex items-center gap-2 mt-1">
						<Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
						<p className="text-sm text-gray-600 truncate">{user.email}</p>
					</div>
				</div>
			</div>

			<div className="flex items-center gap-3 ml-4">
				<div className="text-right hidden lg:block">
					<p className="text-xs text-gray-500">Created</p>
					<div className="flex items-center gap-1 mt-1">
						<Calendar className="w-3 h-3 text-gray-400" />
						<p className="text-sm font-medium text-gray-700">
							{formatDate(user.created_at)}
						</p>
					</div>
				</div>

				<button
					onClick={handleToggleActive}
					disabled={isToggling || isCurrentUser}
					className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition ${user.is_active
						? "bg-green-100 text-green-700 hover:bg-green-200"
						: "bg-gray-100 text-gray-700 hover:bg-gray-200"
						} ${isCurrentUser ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
				>
					{user.is_active ? (
						<CheckCircle className="w-3 h-3" />
					) : (
						<XCircle className="w-3 h-3" />
					)}
					{user.is_active ? "Active" : "Inactive"}
				</button>

				{getRoleBadge(user.role)}

				<button
					onClick={() => onEditProfile(user)}
					className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
					title="Edit profile"
				>
					<User className="w-4 h-4" />
				</button>

				<button
					onClick={() => onResetPassword(user)}
					className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
					title="Reset password"
				>
					<Lock className="w-4 h-4" />
				</button>

				<button
					onClick={() => onEdit(user)}
					disabled={isCurrentUser}
					className={`p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition ${isCurrentUser ? "opacity-50 cursor-not-allowed" : ""
						}`}
					title="Edit role"
				>
					<Edit className="w-4 h-4" />
				</button>

				<button
					onClick={handleDelete}
					disabled={isDeleting || isCurrentUser}
					className={`p-2 text-red-600 hover:bg-red-50 rounded-lg transition ${isDeleting || isCurrentUser ? "opacity-50 cursor-not-allowed" : ""
						}`}
					title="Delete user"
				>
					<Trash2 className="w-4 h-4" />
				</button>
			</div>
		</div>
	);
}
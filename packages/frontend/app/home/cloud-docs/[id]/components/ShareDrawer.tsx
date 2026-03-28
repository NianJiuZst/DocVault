"use client";

import { useEffect, useState } from "react";
import {
	FiCopy,
	FiGlobe,
	FiLink2,
	FiTrash2,
	FiUserPlus,
	FiUsers,
	FiX,
} from "react-icons/fi";
import type { DocumentShare, ShareRole } from "./types";

interface ShareDrawerProps {
	isOpen: boolean;
	documentTitle: string;
	error: string | null;
	isPublic: boolean;
	publicSubmitting: boolean;
	publicUrl: string | null;
	shareLoading: boolean;
	shareSubmitting: boolean;
	shares: DocumentShare[];
	onClose: () => void;
	onCopyPublicUrl: () => Promise<void>;
	onDisablePublic: () => Promise<void>;
	onEnablePublic: () => Promise<void>;
	onPermissionChange: (userId: number, role: ShareRole) => Promise<void>;
	onRevoke: (userId: number) => Promise<void>;
	onShare: (payload: { userId: number; role: ShareRole }) => Promise<void>;
}

function getInitial(name: string) {
	return name.trim().charAt(0).toUpperCase() || "U";
}

export default function ShareDrawer({
	isOpen,
	documentTitle,
	error,
	isPublic,
	publicSubmitting,
	publicUrl,
	shareLoading,
	shareSubmitting,
	shares,
	onClose,
	onCopyPublicUrl,
	onDisablePublic,
	onEnablePublic,
	onPermissionChange,
	onRevoke,
	onShare,
}: ShareDrawerProps) {
	const [userId, setUserId] = useState("");
	const [role, setRole] = useState<ShareRole>("viewer");
	const [formError, setFormError] = useState<string | null>(null);

	useEffect(() => {
		if (!isOpen) return;

		setFormError(null);

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	if (!isOpen) {
		return null;
	}

	const handleShare = async () => {
		const parsedUserId = Number(userId);
		if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
			setFormError("请输入有效的用户 ID");
			return;
		}

		setFormError(null);
		await onShare({ userId: parsedUserId, role });
		setUserId("");
		setRole("viewer");
	};

	return (
		<div className="fixed inset-0 z-50 flex justify-end">
			<div
				className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
				onClick={onClose}
			/>
			<div className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl">
				<div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
					<div className="min-w-0">
						<p className="text-lg font-semibold text-slate-900">分享文档</p>
						<p className="mt-1 truncate text-sm text-slate-500">
							{documentTitle}
						</p>
					</div>
					<button
						className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
						onClick={onClose}
						type="button"
					>
						<FiX className="h-5 w-5" />
					</button>
				</div>

				<div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
					<section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
						<div className="flex items-center gap-2 text-slate-900">
							<FiUserPlus className="h-4 w-4" />
							<h2 className="text-sm font-semibold">邀请协作者</h2>
						</div>
						<p className="mt-2 text-sm text-slate-500">
							当前后端只支持按用户 ID 分享，所以这里先采用 ID 输入。
						</p>

						<div className="mt-4 space-y-3">
							<input
								className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-blue-400"
								inputMode="numeric"
								onChange={(event) => setUserId(event.target.value)}
								placeholder="输入用户 ID"
								type="text"
								value={userId}
							/>
							<select
								className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-blue-400"
								onChange={(event) => setRole(event.target.value as ShareRole)}
								value={role}
							>
								<option value="viewer">只读</option>
								<option value="editor">可编辑</option>
							</select>
							<button
								className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
								disabled={shareSubmitting}
								onClick={() => void handleShare()}
								type="button"
							>
								{shareSubmitting ? "分享中..." : "添加协作者"}
							</button>
						</div>

						{formError && (
							<div className="mt-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
								{formError}
							</div>
						)}
					</section>

					<section className="rounded-3xl border border-slate-200 bg-white p-5">
						<div className="flex items-center gap-2 text-slate-900">
							<FiUsers className="h-4 w-4" />
							<h2 className="text-sm font-semibold">已共享成员</h2>
						</div>

						{shareLoading ? (
							<p className="mt-4 text-sm text-slate-500">正在加载共享成员...</p>
						) : shares.length === 0 ? (
							<p className="mt-4 text-sm text-slate-500">
								暂时还没有共享给其他用户。
							</p>
						) : (
							<div className="mt-4 space-y-3">
								{shares.map((share) => (
									<div
										className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
										key={share.id}
									>
										<div className="flex items-start gap-3">
											<div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
												{getInitial(share.user.name)}
											</div>
											<div className="min-w-0 flex-1">
												<p className="truncate text-sm font-medium text-slate-900">
													{share.user.name || `用户 ${share.user.id}`}
												</p>
												<p className="mt-1 text-xs text-slate-500">
													用户 ID: {share.user.id}
												</p>
											</div>
										</div>
										<div className="mt-3 flex items-center gap-2">
											<select
												className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400"
												disabled={shareSubmitting}
												onChange={(event) =>
													void onPermissionChange(
														share.user.id,
														event.target.value as ShareRole,
													)
												}
												value={share.permission}
											>
												<option value="viewer">只读</option>
												<option value="editor">可编辑</option>
											</select>
											<button
												className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100"
												onClick={() => void onRevoke(share.user.id)}
												type="button"
											>
												<FiTrash2 className="h-4 w-4" />
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</section>

					<section className="rounded-3xl border border-slate-200 bg-white p-5">
						<div className="flex items-center gap-2 text-slate-900">
							<FiGlobe className="h-4 w-4" />
							<h2 className="text-sm font-semibold">公开链接</h2>
						</div>
						<p className="mt-2 text-sm text-slate-500">
							生成公开访问地址，未登录用户也可以打开查看。
						</p>

						{isPublic && publicUrl ? (
							<div className="mt-4 space-y-3">
								<div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
									<FiLink2 className="h-4 w-4 flex-shrink-0 text-slate-500" />
									<input
										className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none"
										readOnly
										value={publicUrl}
									/>
								</div>
								<div className="flex gap-2">
									<button
										className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
										onClick={() => void onCopyPublicUrl()}
										type="button"
									>
										<span className="inline-flex items-center gap-2">
											<FiCopy className="h-4 w-4" />
											复制链接
										</span>
									</button>
									<button
										className="flex-1 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
										disabled={publicSubmitting}
										onClick={() => void onDisablePublic()}
										type="button"
									>
										{publicSubmitting ? "关闭中..." : "关闭公开访问"}
									</button>
								</div>
							</div>
						) : (
							<button
								className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
								disabled={publicSubmitting}
								onClick={() => void onEnablePublic()}
								type="button"
							>
								{publicSubmitting ? "生成中..." : "创建公开链接"}
							</button>
						)}
					</section>

					{error && (
						<div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
							{error}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

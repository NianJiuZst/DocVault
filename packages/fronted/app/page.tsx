"use client";
import type React from "react";
import styles from "./page.module.css"; // 重要：现在使用CSS Modules
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { debounce } from "es-toolkit";

const SplashScreen: React.FC = () => {
	const router = useRouter();
	useEffect(() => {
		console.log("[SplashScreen] useEffect mounted");

		if (process.env.NODE_ENV === "development") {
			localStorage.removeItem("hasScrolledToBottom");
		}

		const calculateScrollPosition = () => {
			const scrollPosition = window.scrollY + window.innerHeight;
			const documentHeight = document.documentElement.scrollHeight;
			const percentage = (scrollPosition / documentHeight) * 100;

			return {
				scrollPosition,
				documentHeight,
				percentage,
			};
		};

		const handleScroll = debounce(() => {
			const { percentage } = calculateScrollPosition();
			if (percentage >= 90 && !localStorage.getItem("hasScrolledToBottom")) {
				console.log("[Scroll] Bottom reached! Redirecting to /home/editor");
				localStorage.setItem("hasScrolledToBottom", "true");
				router.push("/home/editor");
			}
		}, 100);

		handleScroll();
		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [router]);

	const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		const card = e.currentTarget;
		const rect = card.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * 100;
		const y = ((e.clientY - rect.top) / rect.height) * 100;

		const rotationFactor = parseFloat(card.dataset.rotationFactor || "2");
		const rotateX = (y - 50) / rotationFactor;
		const rotateY = ((x - 50) / rotationFactor) * -1;

		card.style.setProperty("--x", `${x}%`);
		card.style.setProperty("--y", `${y}%`);
		card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
	};

	const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
		const card = e.currentTarget;
		card.style.transform = "rotateX(0) rotateY(0)";
	};

	return (
		<div className="p-6">
			<div className={styles.background}></div>

			<main className={styles.main}>
				<h1 className={styles.title}>DocVault</h1>

				<p className={styles.subtitle}>
					Tiptap+Next.js 15 打造现代化协同文档编辑器，内置 AI Agent 与 RAG
					知识库关联功能
				</p>

				<div className={styles["cards-container"]}>
					{/* 卡片 1 */}
					<div
						className={styles.card}
						data-rotation-factor="2"
						onMouseMove={handleCardMouseMove}
						onMouseLeave={handleCardMouseLeave}
					>
						<div className={styles["card-content"]}>
							<div>
								<p className={styles["card-title"]}>AI智能知识协同</p>
								<p className={styles["card-text"]}>
									通过AI 实现快速解析文档内容逻辑、提取核心重点，AI Agent
									自动完成文档核心内容归档、生成检索标签，推动 “创作 - 沉淀 -
									复用” 知识闭环落地。
								</p>
							</div>
						</div>
					</div>

					{/* 卡片 2 */}
					<div
						className={styles.card}
						data-rotation-factor="2"
						onMouseMove={handleCardMouseMove}
						onMouseLeave={handleCardMouseLeave}
					>
						<div className={styles["card-content"]}>
							<div>
								<p className={styles["card-title"]}>多人实时协同编辑</p>
								<p className={styles["card-text"]}>
									基于Yjs的CRDT算法实现毫秒级内容同步，多人编辑时自动消解冲突，网络波动下仍保持流畅协作体验
								</p>
							</div>
						</div>
					</div>

					{/* 卡片 3 */}
					<div
						className={styles.card}
						data-rotation-factor="2"
						onMouseMove={handleCardMouseMove}
						onMouseLeave={handleCardMouseLeave}
					>
						<div className={styles["card-content"]}>
							<div>
								<p className={styles["card-title"]}>知识库智能联动</p>
								<p className={styles["card-text"]}>
									文档编辑中实时关联RAG知识库，AI自动推荐相关知识片段，实现内容创作与知识沉淀的无缝闭环
								</p>
							</div>
						</div>
					</div>
				</div>
				<p className={styles["scroll-prompt"]}>上滑开启 AI 协同编辑</p>
				<div className={styles.container}>
					{/* Chevron 1 */}
					<div className={`${styles.chevron} ${styles["delay-1"]}`}>
						<span className={styles.before}></span>
						<span className={styles.after}></span>
					</div>

					{/* Chevron 2 */}
					<div className={`${styles.chevron} ${styles["delay-2"]}`}>
						<span className={styles.before}></span>
						<span className={styles.after}></span>
					</div>

					{/* Chevron 3 */}
					<div className={styles.chevron}>
						<span className={styles.before}></span>
						<span className={styles.after}></span>
					</div>
				</div>
			</main>
			<div className={styles["height-spacer"]}></div>
		</div>
	);
};

export default SplashScreen;

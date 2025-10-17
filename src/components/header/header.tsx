import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import styles from "./header.module.css";
import { useState } from "react";

export function Header() {
    const { data: session, status } = useSession();
    const [ isHovered, setisHovered ] = useState(false);

    return (
        <header className={styles.header}>
            <section className={styles.content}>
                <nav className={styles.nav}>
                    <Link href="/">
                        <h1 className={styles.logo}>
                            Tasks<span>+</span>
                        </h1>
                    </Link>

                    {session?.user && (
                        <>
                            <Link href="dashboard" className={styles.link}>
                                My Dashboard
                            </Link>
                        </>
                    )}
                </nav>

                {status === "loading" ? (
                    <></>
                    ) : session ? (
                        <button 
                            className={styles.loginButton} 
                            onClick={() => signOut()}
                            onMouseEnter={() => setisHovered(true)}
                            onMouseLeave={() => setisHovered(false)}
                        >
                            {isHovered ? "Log out" : `Hi, ${session.user?.name}`}
                        </button>
                    ) : (
                        <button className={styles.loginButton} onClick={() => signIn("google")}>
                            Log in
                        </button>
                    )
                }
            </section>
        </header>
    )
}
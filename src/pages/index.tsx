import Head from "next/head";
import Image from "next/image";
import styles from "../styles/home.module.css";

import heroImg from "../../public/assets/hero.png"

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Task+ | Organize your tasks easily</title>
      </Head>

      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image
            className={styles.hero}
            alt="Logo Tarefas+"
            src={heroImg}
            priority
          />
        </div>

        <h1 className={styles.title}>  
          System made for you to organize <br />
          your studies and tasks
        </h1>

        <div className={styles.infoContent}>
          <section className={styles.box}>
            <span>+12 posts</span>
          </section>
          
          <section className={styles.box}>
            <span>+90 comments</span>
          </section>
        </div>
      </main>
    </div>
  );
}

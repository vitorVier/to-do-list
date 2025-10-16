import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import styles from "./styles.module.css";
import Head from 'next/head';
import TextArea from "@/src/components/textArea";
import { FiShare2 } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import { ChangeEvent, FormEvent, useState } from "react";

import { db } from "@/src/services/firebaseConnection";
import { addDoc, collection } from 'firebase/firestore';

interface HomeProps {
    user: {
        email: string;
    }
}

export default function Dashboard({ user }: HomeProps ) {
    const [ input, setInput ] = useState("");
    const [ publicTask, setPublicTask ] = useState(false); 

    function handleChangePublic(e: ChangeEvent<HTMLInputElement>) {
        setPublicTask(e.target.checked)
    }

    async function handleRegisterTask(e: FormEvent) {
        e.preventDefault();

        if(input === '') return;

        try {
            await addDoc(collection(db, "tasks"), {
                task: input,
                created: new Date(),
                user: user?.email,
                public: publicTask
            })

            setInput('')
            setPublicTask(false)
            
        } catch(err) {
            console.log(err)
        }
    }

    return(
        <div className={styles.container}>
            <Head>
                <title>Meu painel de tarefas</title>
            </Head>

            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}>Qual sua tarefa?</h1>

                        <form onSubmit={handleRegisterTask}>
                            <TextArea 
                                placeholder="Digite sua tarefa..."
                                value={input}    
                                onChange={ (e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value) }
                            />

                            <div className={styles.checkboxArea}>
                                <input 
                                    type="checkbox" 
                                    className={styles.checkbox}
                                    checked={publicTask}
                                    onChange={handleChangePublic}
                                />
                                <label>Deixar tarefa pública?</label>
                            </div>

                            <button type="submit" className={styles.button}>Adicionar tarefa</button>
                        </form>
                    </div>
                </section>

                <section className={styles.taskContainer}>
                    <h1>Minhas tarefas</h1>

                    <article className={styles.task}>
                        <div className={styles.tagContainer}>
                            <label className={styles.tag}>Público</label>
                            <button className={styles.shareButton}>
                                <FiShare2
                                    size={22}
                                    color="#3183FF"
                                />
                            </button>
                        </div>

                        <div className={styles.taskContent}>
                            <p>Minhas primeira tarefa</p>
                            <button className={styles.trashButton}>
                                <FaTrash
                                    size={24}
                                    color="#EA3140"
                                />
                            </button>
                        </div>
                    </article>
                </section>
            </main>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const session = await getSession({ req });
    
    if(!session?.user) {
        // Se o usuario nao estiver autenticado, redireciona para a pagina inicial
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }

    return {
        props: {
            user: {
                email: session?.user?.email
            }
        }
    }
}
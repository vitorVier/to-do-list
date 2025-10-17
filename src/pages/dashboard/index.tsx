import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import styles from "./styles.module.css";
import Head from 'next/head';
import TextArea from "@/src/components/textArea";
import { FiShare2 } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import { db } from "@/src/services/firebaseConnection";
import { 
    doc,
    addDoc, 
    collection,
    deleteDoc,
    query,
    orderBy,
    where,
    onSnapshot
} from 'firebase/firestore';
import Link from "next/link";

interface HomeProps {
    user: {
        email: string;
    }
}

interface TaskProps {
    id: string;
    created: Date;
    public: boolean;
    task: string;
    user: string;
}

export default function Dashboard({ user }: HomeProps ) {
    const [ input, setInput ] = useState("");
    const [ publicTask, setPublicTask ] = useState(false); 
    const [ tasks, setTasks ] = useState<TaskProps[]>([]); 

    useEffect(() => {
        async function loadTasks() {
            const tasksRef = collection(db, 'tasks');

            const q = query(
                tasksRef,
                orderBy("created", "desc"),
                where("user", "==", user?.email)
            )

            onSnapshot(q, (snapshot) => {
                let list = [] as TaskProps[];

                snapshot.forEach((doc) => {
                    list.push({
                        id: doc.id,
                        task: doc.data().task,
                        created: doc.data().created,
                        user: doc.data().user,
                        public: doc.data().public
                    })
                })

                setTasks(list);
            })
        }

        loadTasks();
    }, [user?.email])

    function handleChangePublic(e: ChangeEvent<HTMLInputElement>) {
        setPublicTask(e.target.checked)
        console.log(publicTask)
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

    async function handleShare(id: string) {
        await navigator.clipboard.writeText(
            `${process.env.NEXT_PUBLIC_URL}/dashboard/task/${id}`
        )

        alert("URL copiada!")
    }

    async function handleDeleteTask(id: string) {
        const docRef = doc(db, "tasks", id);
        
        await deleteDoc(docRef);
    }

    return(
        <div className={styles.container}>
            <Head>
                <title>Meu painel de tarefas</title>
            </Head>

            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}>What is your task?</h1>

                        <form onSubmit={handleRegisterTask}>
                            <TextArea 
                                placeholder="Enter your task..."
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
                                <label>Make task public?</label>
                            </div>

                            <button type="submit" className={styles.button}>Add task</button>
                        </form>
                    </div>
                </section>

                <section className={styles.taskContainer}>
                    <h1>My Tasks</h1>

                    {tasks.map((item) => (
                        <article key={item.id} className={styles.task}>
                            {item.public && (
                                <div className={styles.tagContainer}>
                                    <label className={styles.tag}>PUBLIC</label>
                                    <button className={styles.shareButton} onClick={() => handleShare(item.id) }>
                                        <FiShare2
                                            size={22}
                                            color="#3183FF"
                                        />
                                    </button>
                                </div>
                            )}

                            <div className={styles.taskContent}>
                                {item.public ? (
                                    <Link href={`task/${item.id}`}>
                                        <p>{item.task}</p>
                                    </Link>
                                ) : (
                                    <p>{item.task}</p>
                                )}

                                <button className={styles.trashButton}>
                                    <FaTrash
                                        size={24}
                                        color="#EA3140"
                                        onClick={() => handleDeleteTask(item.id)}
                                    />
                                </button>
                            </div>
                        </article>
                    ))}
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
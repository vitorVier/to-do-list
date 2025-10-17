import { ChangeEvent, FormEvent, useState } from "react"
import { useSession } from "next-auth/react"
import Head from "next/head"
import styles from './styles.module.css'
import { GetServerSideProps } from "next"

import { db } from "@/src/services/firebaseConnection"
import {
    doc,
    addDoc,
    collection,
    query,
    where,
    getDoc,
    getDocs,
    deleteDoc
} from 'firebase/firestore'
import TextArea from "@/src/components/textArea"
import { FaTrash } from "react-icons/fa"

interface TaskProps {
    item: {
        taskId: string,
        task: string,
        public: boolean,
        created: string,
        user: string,
    };

    allComments: CommentProps[];
}

interface CommentProps {
    id: string;
    comment: string;
    taskId: string;
    user: string;
    name: string;
}

export default function Task({ item, allComments }: TaskProps) {
    const { data: session } = useSession();

    const [ input, setInput ] = useState("");
    const [ comments, setComments ] = useState<CommentProps[]>(allComments || []);

    async function handleComment(e: FormEvent) {
        e.preventDefault();

        if(input === '' || !session?.user?.email || !session?.user?.name) return;

        try {
            const docRef = await addDoc(collection(db, "comments"), {
                comment: input,
                created: new Date(),
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.taskId
            })

            const data = {
                id: docRef.id,
                comment: input,
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.taskId,
            }

            setComments((oldItems) => [...oldItems, data])
            setInput('')
        } catch(err) {
            console.log(err)
        }
    }

    async function handleDeleteComment(id: string) {
        try {
            const docRef = doc(db, 'comments', id);
            await deleteDoc(docRef);
            
            const deleteComment = comments.filter((item) => item.id !== id)
            setComments(deleteComment)
        } catch(err) {
            console.log(err)
        }
    }
    
    return(
        <div className={styles.container}>
            <Head>
                <title>Task Detail's</title>
            </Head>

            <main className={styles.main}>
                <h1>Task</h1>

                <article className={styles.task}>
                    <p>{item.task}</p>
                </article>
            </main>

            <section className={styles.commentsContainer}>
                <h2>Send a comment</h2>

                <form onSubmit={handleComment}>
                    <TextArea
                        value={input}
                        onChange={ (e: ChangeEvent<HTMLTextAreaElement>) => 
                            setInput(e.target.value) 
                        }
                        placeholder="Leave your comment..."
                    />

                    <button disabled={!session?.user} className={styles.button}>
                        Send comment
                    </button>
                </form>
            </section>

            <section className={styles.commentsContainer}>
                <h2>All comments</h2>

                {comments.length === 0 && (
                    <span>Nothing comments found...</span>
                )}

                {comments.map((item) => (
                    <article key={item.id} className={styles.comment}>
                        <div className={styles.headComment}>
                            <label className={styles.commentLabel}>{item.name}</label>
                            {item.user === session?.user?.email && (
                                <button onClick={() => handleDeleteComment(item?.id)} className={styles.buttonTrash}>
                                    <FaTrash size={18} color="#EA3140"/>
                                </button>
                            )}
                        </div>

                        <p>{item.comment}</p>
                    </article>
                ))}
            </section>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const id = params?.id as string;

    const docRef = doc(db, "tasks", id);
    const snapshot = await getDoc(docRef);

    const q = query(collection(db, 'comments'), where("taskId", "==", id));
    const snapshotComments = await getDocs(q);

    let allComments: CommentProps[] = [];
    snapshotComments.forEach((doc) => {
        allComments.push({
            id: doc.id,
            comment: doc.data().comment,
            user: doc.data().user,
            name: doc.data().name,
            taskId: doc.data().taskId
        })
    })

    if(snapshot.data() === undefined || !snapshot.data()?.public) {
        return {
            redirect: {
                destination: "/",
                permanent: false
            }
        }
    }

    const miliseconds = snapshot.data()?.created?.seconds * 1000;

    const task = {
        taskId: id,
        task: snapshot.data()?.task,
        public: snapshot.data()?.public,
        created: new Date(miliseconds).toLocaleDateString(),
        user: snapshot.data()?.user,
    }

    return {
        props: {
            item: task,
            allComments: allComments
        }
    }
}
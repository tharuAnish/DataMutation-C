"use client"

import { useOptimistic } from "react"

import { formatDate } from "@/lib/format"
import LikeButton from "./like-icon"
import { togglePostLikeStatus } from "@/actions/posts"
import Image from "next/image"

function imageLoader(config) {
  const urlStart = config.src.split("upload/")[0]
  const urlEnd = config.src.split("upload/")[1]
  const transformations = `w_200,q_${config.quality}`
  return `${urlStart}upload/${transformations}/${urlEnd}`
}

function Post({ post, action }) {
  return (
    <article className="post">
      <div className="post-image">
        <Image
          src={post.image}
          loader={imageLoader}
          width={200}
          height={120}
          alt={post.title}
          quality={50}
        />
      </div>
      <div className="post-content">
        <header>
          <div>
            <h2>{post.title}</h2>
            <p>
              Shared by {post.userFirstName} on{" "}
              <time dateTime={post.createdAt}>
                {formatDate(post.createdAt)}
              </time>
            </p>
          </div>
          <div>
            <form
              action={action.bind(null, post.id)}
              className={post.isLiked ? "liked" : ""}
            >
              <LikeButton />
            </form>
          </div>
        </header>
        <p>{post.content}</p>
      </div>
    </article>
  )
}

export default function Posts({ posts }) {
  const [optimisticPost, updateOptimisticPosts] = useOptimistic(
    posts,
    (prevPosts, updatedPostId) => {
      const updatePostIndex = prevPosts.findIndex(
        (post) => post.id === updatedPostId
      )

      if (updatePostIndex === -1) {
        return prevPosts
      }

      const updatedPost = { ...prevPosts[updatePostIndex] }
      updatedPost.likes = updatedPost.likes + (updatedPost.isLiked ? -1 : 1)
      updatedPost.isLiked = !updatedPost.isLiked
      const newPosts = [...prevPosts]
      newPosts[updatePostIndex] = updatedPost
      return newPosts
    }
  )

  if (!optimisticPost || optimisticPost.length === 0) {
    return <p>There are no posts yet. Maybe start sharing some?</p>
  }

  async function updatedPost(postId) {
    updateOptimisticPosts(postId)
    await togglePostLikeStatus(postId)
  }

  return (
    <ul className="posts">
      {optimisticPost.map((post) => (
        <li key={post.id}>
          <Post post={post} action={updatedPost} />
        </li>
      ))}
    </ul>
  )
}
